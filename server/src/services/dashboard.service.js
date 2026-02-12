/**
 * =============================================================================
 * MyNaati Backend — Dashboard Service
 * =============================================================================
 * 
 * Aggregates summary data from all 7 dashboard sections.
 * Resolves the user's entity chain: AspUserId → MyNaatiUser → Entity → Person
 * Then queries each module for summary counts.
 */

const { query, sql } = require('../config/database');
const MyNaatiUserModel = require('../models/MyNaatiUser');
const PersonModel = require('../models/Person');
const CredentialModel = require('../models/Credential');
const TestSittingModel = require('../models/TestSitting');
const InvoiceModel = require('../models/Invoice');
const ApplicationModel = require('../models/Application');
const PDModel = require('../models/ProfessionalDevelopment');
const AddressModel = require('../models/Address');
const EmailModel = require('../models/Email');
const logger = require('../utils/logger');

/**
 * Resolve the full entity chain from ASP.NET UserId.
 * Returns { naatiNumber, entityId, personId } or nulls if not linked.
 */
async function resolveUserChain(userId) {
    const myNaatiUser = await MyNaatiUserModel.findByAspUserId(userId);
    if (!myNaatiUser || !myNaatiUser.NaatiNumber) {
        return { naatiNumber: null, entityId: null, personId: null, myNaatiUser: null };
    }

    const entityResult = await query(
        'SELECT EntityId FROM tblEntity WHERE NAATINumber = @n',
        { n: { type: sql.Int, value: myNaatiUser.NaatiNumber } }
    );

    const entityId = entityResult.recordset[0]?.EntityId || null;
    let personId = null;
    let personDetails = null;

    if (entityId) {
        personDetails = await PersonModel.findByEntityId(entityId);
        personId = personDetails?.PersonId || null;
    }

    return {
        naatiNumber: myNaatiUser.NaatiNumber,
        entityId,
        personId,
        personDetails,
        myNaatiUser,
    };
}

/**
 * Get dashboard summary with counts from all 7 sections.
 */
async function getDashboardSummary(userId) {
    const chain = await resolveUserChain(userId);
    const { naatiNumber, entityId, personId, personDetails } = chain;

    // Build greeting
    let greeting = 'Welcome to MyNaati 👋';
    let givenName = null;
    let surname = null;

    if (personId) {
        const personName = await PersonModel.getLatestName(personId);
        if (personName) {
            givenName = personName.GivenName;
            surname = personName.Surname;
            greeting = `Welcome back, ${personName.GivenName}! 👋`;
        }
    }

    // Fetch all counts in parallel (gracefully handle missing tables)
    const [credentials, tests, invoices, applications, logbook] = await Promise.all([
        entityId ? safeQuery(() => CredentialModel.countActive(entityId)) : 0,
        personId ? safeQuery(() => TestSittingModel.countUpcoming(personId)) : 0,
        entityId ? safeQuery(() => InvoiceModel.countUnpaid(entityId)) : 0,
        entityId ? safeQuery(() => ApplicationModel.countActive(entityId)) : 0,
        personId ? safeQuery(() => PDModel.countByPersonId(personId)) : { count: 0, totalHours: 0 },
    ]);

    const totalOwed = entityId ? await safeQuery(() => InvoiceModel.getTotalOwed(entityId)) : 0;

    return {
        greeting,
        givenName,
        surname,
        naatiNumber,
        stats: {
            activeCredentials: credentials,
            upcomingTests: tests,
            unpaidInvoices: invoices,
            totalOwed: totalOwed,
            activeApplications: applications,
            pdActivities: typeof logbook === 'object' ? logbook.count : logbook,
            pdHours: typeof logbook === 'object' ? logbook.totalHours : 0,
        },
        quickActions: [
            { id: 'profile', title: 'My Account', emoji: '👤', path: '/profile', description: 'View and update your personal details' },
            { id: 'credentials', title: 'My Credentials', emoji: '🏅', path: '/credentials', description: 'View your current certifications' },
            { id: 'tests', title: 'Manage My Tests', emoji: '📝', path: '/tests', description: 'View your scheduled and past tests' },
            { id: 'invoices', title: 'My Invoices', emoji: '🧾', path: '/invoices', description: 'View and pay outstanding invoices' },
            { id: 'bills', title: 'My Bills', emoji: '💳', path: '/bills', description: 'View your transaction history' },
            { id: 'logbook', title: 'My Logbook', emoji: '📖', path: '/logbook', description: 'Log professional development activities' },
            { id: 'apply', title: 'Apply for Certification', emoji: '📋', path: '/applications', description: 'Start a new credential application' },
        ],
    };
}

/**
 * Get user's credentials list.
 */
async function getCredentials(userId) {
    const { entityId } = await resolveUserChain(userId);
    if (!entityId) return [];
    return safeQuery(() => CredentialModel.findByEntityId(entityId), []);
}

/**
 * Get user's test sittings.
 */
async function getTests(userId) {
    const { personId } = await resolveUserChain(userId);
    if (!personId) return [];
    return safeQuery(() => TestSittingModel.findByPersonId(personId), []);
}

/**
 * Get user's invoices.
 */
async function getInvoices(userId) {
    const { entityId } = await resolveUserChain(userId);
    if (!entityId) return [];
    return safeQuery(() => InvoiceModel.findByEntityId(entityId), []);
}

/**
 * Get user's credential applications.
 */
async function getApplications(userId) {
    const { entityId } = await resolveUserChain(userId);
    if (!entityId) return [];
    return safeQuery(() => ApplicationModel.findByEntityId(entityId), []);
}

/**
 * Get user's PD activities (logbook).
 */
async function getLogbook(userId) {
    const { personId } = await resolveUserChain(userId);
    if (!personId) return [];
    return safeQuery(() => PDModel.findByPersonId(personId), []);
}

/**
 * Get user's profile (person + addresses + emails).
 */
async function getProfile(userId) {
    const chain = await resolveUserChain(userId);
    const { entityId, personId, personDetails } = chain;

    let name = null;
    let addresses = [];
    let emails = [];

    if (personId) {
        name = await PersonModel.getLatestName(personId);
    }
    if (entityId) {
        addresses = await safeQuery(() => AddressModel.findByEntityId(entityId), []);
        emails = await safeQuery(() => EmailModel.findByEntityId(entityId), []);
    }

    return {
        naatiNumber: chain.naatiNumber,
        person: personDetails,
        name,
        addresses,
        emails,
    };
}

/**
 * Safely execute a query, returning a fallback on error (e.g. missing table).
 */
async function safeQuery(fn, fallback = 0) {
    try {
        return await fn();
    } catch (error) {
        logger.warn(`Dashboard query failed (table may not exist): ${error.message}`);
        return fallback;
    }
}

module.exports = {
    getDashboardSummary,
    getCredentials,
    getTests,
    getInvoices,
    getApplications,
    getLogbook,
    getProfile,
};
