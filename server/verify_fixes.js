/**
 * Verification Script — verify_fixes.js
 * Executes each modified model function with a test user to ensure no SQL errors occur.
 */
require('dotenv').config();
const CredentialModel = require('./src/models/Credential');
const TestSittingModel = require('./src/models/TestSitting');
const InvoiceModel = require('./src/models/Invoice');
const ApplicationModel = require('./src/models/Application');
const PDModel = require('./src/models/ProfessionalDevelopment');
const AddressModel = require('./src/models/Address');
const EmailModel = require('./src/models/Email');
const { closePool } = require('./src/config/database');

const TEST_PERSON_ID = 177917;
const TEST_ENTITY_ID = 184080;

async function runVerification() {
    console.log('🚀 Starting SQL Schema Verification...\n');
    let failCount = 0;

    const tests = [
        { name: 'CredentialModel.countActive', fn: () => CredentialModel.countActive(TEST_ENTITY_ID) },
        { name: 'CredentialModel.findByEntityId', fn: () => CredentialModel.findByEntityId(TEST_ENTITY_ID) },
        { name: 'TestSittingModel.countUpcoming', fn: () => TestSittingModel.countUpcoming(TEST_PERSON_ID) },
        { name: 'TestSittingModel.findByPersonId', fn: () => TestSittingModel.findByPersonId(TEST_PERSON_ID) },
        { name: 'InvoiceModel.countUnpaid', fn: () => InvoiceModel.countUnpaid(TEST_ENTITY_ID) },
        { name: 'InvoiceModel.findByEntityId', fn: () => InvoiceModel.findByEntityId(TEST_ENTITY_ID) },
        { name: 'InvoiceModel.getTotalOwed', fn: () => InvoiceModel.getTotalOwed(TEST_ENTITY_ID) },
        { name: 'ApplicationModel.countActive', fn: () => ApplicationModel.countActive(TEST_ENTITY_ID) },
        { name: 'ApplicationModel.findByEntityId', fn: () => ApplicationModel.findByEntityId(TEST_ENTITY_ID) },
        { name: 'PDModel.countByPersonId', fn: () => PDModel.countByPersonId(TEST_PERSON_ID) },
        { name: 'PDModel.findByPersonId', fn: () => PDModel.findByPersonId(TEST_PERSON_ID) },
        { name: 'AddressModel.findByEntityId', fn: () => AddressModel.findByEntityId(TEST_ENTITY_ID) },
        { name: 'EmailModel.findByEntityId', fn: () => EmailModel.findByEntityId(TEST_ENTITY_ID) }
    ];

    for (const test of tests) {
        try {
            const result = await test.fn();
            console.log(`✅ ${test.name.padEnd(35)}: SUCCESS (Result: ${JSON.stringify(result).substring(0, 50)}...)`);
        } catch (error) {
            console.error(`❌ ${test.name.padEnd(35)}: FAILED`);
            console.error(`   Error: ${error.message}\n`);
            failCount++;
        }
    }

    console.log(`\n=========================================`);
    if (failCount === 0) {
        console.log('✨ ALL QUERIES PASSED VERIFICATION! ✨');
    } else {
        console.log(`⚠️ VERIFICATION FAILED WITH ${failCount} ERRORS.`);
    }
    console.log(`=========================================\n`);

    await closePool();
    process.exit(failCount === 0 ? 0 : 1);
}

runVerification();
