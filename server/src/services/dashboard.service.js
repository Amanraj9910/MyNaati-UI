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
const PhoneModel = require('../models/Phone');
const EntityModel = require('../models/Entity');
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
        personId ? safeQuery(() => CredentialModel.countActive(personId)) : 0,
        personId ? safeQuery(() => TestSittingModel.countUpcoming(personId)) : 0,
        naatiNumber ? safeQuery(() => InvoiceModel.countUnpaid(naatiNumber)) : 0,
        personId ? safeQuery(() => ApplicationModel.countActive(personId)) : 0,
        personId ? safeQuery(() => PDModel.countByPersonId(personId)) : { count: 0, totalHours: 0 },
    ]);

    const totalOwed = naatiNumber ? await safeQuery(() => InvoiceModel.getTotalOwed(naatiNumber)) : 0;

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
    const { personId } = await resolveUserChain(userId);
    if (!personId) return [];
    return safeQuery(() => CredentialModel.findByPersonId(personId), []);
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
    const { naatiNumber } = await resolveUserChain(userId);
    if (!naatiNumber) return [];
    return safeQuery(() => InvoiceModel.findByNaatiNumber(naatiNumber), []);
}

/**
 * Get user's credential applications.
 */
async function getApplications(userId) {
    const { personId } = await resolveUserChain(userId);
    if (!personId) return [];
    return safeQuery(() => ApplicationModel.findByPersonId(personId), []);
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
    let phones = [];
    let entityDetails = null;

    if (personId) {
        name = await PersonModel.getLatestName(personId);
    }
    if (entityId) {
        addresses = await safeQuery(() => AddressModel.findByEntityId(entityId), []);
        emails = await safeQuery(() => EmailModel.findByEntityId(entityId), []);
        phones = await safeQuery(() => PhoneModel.findByEntityId(entityId), []);
        entityDetails = await safeQuery(() => EntityModel.findById(entityId), null);
    }

    return {
        naatiNumber: chain.naatiNumber,
        person: personDetails,
        name,
        addresses,
        emails,
        phones,
        website: entityDetails?.WebsiteURL || null,
    };
}

/**
 * Update user's profile or address.
 */
async function updateProfile(userId, updateData) {
    const chain = await resolveUserChain(userId);
    const { entityId, personId } = chain;

    if (!personId || !entityId) {
        throw new Error('User profile not fully initialized');
    }

    // 1. Update Person Details
    if (updateData.type === 'personal') {
        await PersonModel.update(personId, updateData.data);
    }
    // 2. Update Address
    else if (updateData.type === 'address') {
        const { addressId, ...addressData } = updateData.data;

        // Ensure only one primary address
        if (addressData.IsPrimary) {
            await query(
                'UPDATE tblAddress SET PrimaryContact = 0 WHERE EntityId = @entityId',
                { entityId: { type: sql.Int, value: entityId } }
            );
        }

        if (addressId) {
            // Verify ownership
            const existing = await AddressModel.findById(addressId);
            if (!existing || existing.EntityId !== entityId) {
                throw new Error('Address not found or access denied');
            }
            await AddressModel.update(addressId, addressData);
        } else {
            await AddressModel.create(entityId, addressData);
        }
    }
    // 3. Update Email
    else if (updateData.type === 'email') {
        const { email } = updateData.data;
        // Check if exists? For now just create new one as per "Add/Edit" modal implication
        // User analysis says "Edit Email: Modal form to add/edit".
        // If we are adding:
        await EmailModel.create({ entityId, email });
    }
    // 4. Update Phone
    else if (updateData.type === 'phone') {
        await PhoneModel.create(entityId, updateData.data);
    }
    // 5. Update Website (Entity)
    else if (updateData.type === 'website') {
        await EntityModel.update(entityId, updateData.data);
    }

    return getProfile(userId);
}

/**
 * Add a new logbook entry (PD Activity).
 */
async function addLogbookEntry(userId, entryData) {
    const { personId } = await resolveUserChain(userId);
    if (!personId) throw new Error('User has no linked person record');

    await PDModel.create(personId, entryData);
    return PDModel.findByPersonId(personId);
}

async function getPDCategories() {
    return PDModel.getCategories();
}

/**
 * Start a new credential application.
 */
async function createApplication(userId, typeId) {
    const { personId } = await resolveUserChain(userId);
    if (!personId) throw new Error('User has no linked person record');

    await ApplicationModel.create(personId, typeId);
    return ApplicationModel.findByPersonId(personId);
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
    updateProfile,
    addLogbookEntry,
    getPDCategories,
    createApplication,
};
