/**
 * =============================================================================
 * MyNaati Backend — Home Service
 * =============================================================================
 * 
 * Business logic for Module 1: Home / Dashboard.
 * 
 * Provides:
 *   - Dashboard data (personalized greeting with user's name)
 *   - About NAATI content
 *   - Learn More content
 *   - System diagnostics (admin only)
 *   - System configuration values
 */

const PersonModel = require('../models/Person');
const SystemValueModel = require('../models/SystemValue');
const { getPool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get personalized dashboard data for a logged-in user.
 * Fetches the user's name for the welcome greeting and provides
 * quick-links and summary data.
 * 
 * @param {number} personId - The authenticated user's PersonId
 * @returns {Promise<Object>} Dashboard data including greeting and quick actions
 */
async function getDashboardData(personId) {
    let greeting = 'Welcome to MyNaati';
    let givenName = null;
    let surname = null;

    // Fetch user's latest name for the personalized greeting
    if (personId) {
        const personName = await PersonModel.getLatestName(personId);
        if (personName) {
            givenName = personName.GivenName;
            surname = personName.Surname;
            greeting = `Welcome back, ${personName.GivenName}!`;
        }
    }

    return {
        greeting,
        givenName,
        surname,
        quickActions: [
            { id: 'apply', title: 'Apply for Credential', icon: 'FileText', path: '/apply', description: 'Start a new credential application' },
            { id: 'tests', title: 'My Tests', icon: 'ClipboardCheck', path: '/tests', description: 'View your scheduled and past tests' },
            { id: 'credentials', title: 'My Credentials', icon: 'Award', path: '/credentials', description: 'View your issued credentials' },
            { id: 'logbook', title: 'Logbook', icon: 'BookOpen', path: '/logbook', description: 'Log professional development activities' },
            { id: 'bills', title: 'Bills & Invoices', icon: 'Receipt', path: '/bills', description: 'View and pay invoices' },
            { id: 'profile', title: 'Personal Details', icon: 'User', path: '/profile', description: 'Update your personal information' },
        ],
    };
}

/**
 * Get the "About NAATI" page content.
 * Returns static NAATI information for the public about page.
 * 
 * @returns {Object} About page content
 */
function getAboutContent() {
    return {
        title: 'About NAATI',
        content: `NAATI is the national standards and accreditation body for translators and 
interpreters in Australia. Established in 1977, NAATI sets and maintains high national 
standards in the translating and interpreting industry.

NAATI provides certification for translators and interpreters, ensuring that practitioners 
meet the required standards of competence. NAATI credentials are widely recognized as 
the benchmark for professional translating and interpreting services in Australia.`,
        sections: [
            {
                title: 'Our Mission',
                content: 'To strengthen inclusion and access to services for Australia\'s linguistically diverse communities through the improvement and monitoring of the quality of translating and interpreting.',
            },
            {
                title: 'What We Do',
                content: 'NAATI sets, develops and monitors translating and interpreting standards, and provides credential assessments for practitioners.',
            },
            {
                title: 'Certification Types',
                items: [
                    'Certified Translator',
                    'Certified Interpreter',
                    'Certified Conference Interpreter',
                    'Recognised Practising Translator/Interpreter',
                ],
            },
        ],
        links: {
            contactUs: 'https://www.naati.com.au/contact-us/',
            privacyPolicy: 'https://www.naati.com.au/privacy-policy/',
            termsAndConditions: 'https://www.naati.com.au/terms-and-conditions/',
        },
    };
}

/**
 * Get the "Learn More" page content.
 * Returns information about NAATI services for the public learn more page.
 * 
 * @returns {Object} Learn more content with expandable sections
 */
function getLearnMoreContent() {
    return {
        title: 'Learn More About Our Services',
        sections: [
            {
                id: 'certification',
                title: 'Certification',
                content: 'NAATI offers certification for translators and interpreters through both testing and course-based pathways.',
            },
            {
                id: 'testing',
                title: 'Testing',
                content: 'NAATI conducts tests throughout Australia and internationally to assess translating and interpreting competency.',
            },
            {
                id: 'recertification',
                title: 'Recertification',
                content: 'Certified practitioners must maintain their credentials through ongoing professional development.',
            },
            {
                id: 'directory',
                title: 'Practitioner Directory',
                content: 'The online directory helps the public find certified translators and interpreters.',
            },
        ],
    };
}

/**
 * Get system diagnostics information (admin only).
 * Reports on database connectivity, server uptime, and memory usage.
 * 
 * @returns {Promise<Object>} Diagnostics data
 */
async function getDiagnostics() {
    let dbStatus = 'Unknown';
    let dbResponseTime = null;

    // Test database connectivity and measure response time
    try {
        const start = Date.now();
        const pool = await getPool();
        await pool.request().query('SELECT 1 AS test');
        dbResponseTime = Date.now() - start;
        dbStatus = 'Connected';
    } catch (error) {
        dbStatus = `Error: ${error.message}`;
        logger.error('Diagnostics DB check failed:', error.message);
    }

    // Gather system metrics
    const memUsage = process.memoryUsage();

    return {
        server: {
            status: 'Running',
            uptime: Math.floor(process.uptime()),
            uptimeFormatted: formatUptime(process.uptime()),
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
        },
        database: {
            status: dbStatus,
            responseTimeMs: dbResponseTime,
            server: process.env.DB_SERVER,
            database: process.env.DB_NAME,
        },
        memory: {
            heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
            rssMB: Math.round(memUsage.rss / 1024 / 1024),
        },
        timestamp: new Date().toISOString(),
    };
}

/**
 * Get all system configuration values from tblSystemValue.
 * Admin-only function for viewing system settings.
 * 
 * @returns {Promise<Object[]>} Array of system value records
 */
async function getSystemValues() {
    return SystemValueModel.getAll();
}

/**
 * Helper: Format uptime seconds into a human-readable string.
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted string like "2d 5h 30m 15s"
 */
function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = {
    getDashboardData,
    getAboutContent,
    getLearnMoreContent,
    getDiagnostics,
    getSystemValues,
};
