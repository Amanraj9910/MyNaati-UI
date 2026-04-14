require('dotenv').config();
const { query } = require('./src/config/database');
const { getActiveCredentialsForCard, getQrCodeGuid } = require('./src/models/CredentialIdCard');
const { resolveUserChain } = require('./src/services/dashboard.service');

const fs = require('fs');

async function test() {
    const results = {};
    try {
        const users = await query('SELECT TOP 1 UserId FROM tblUser');
        const userId = users.recordset[0].UserId;
        results.userId = userId;

        const { personId } = await resolveUserChain(userId);
        results.personId = personId;

        const creds = await getActiveCredentialsForCard(personId);
        results.credentials = creds;

        if (creds.length > 0) {
            results.qr = await getQrCodeGuid(creds[0].credentialId);
        } else {
             const randomCred = await query(`SELECT TOP 1 c.CredentialId, cp.PersonId 
                                               FROM tblCredential c
                                               INNER JOIN tblCertificationPeriod cp ON c.CertificationPeriodId = cp.CertificationPeriodId`);
             results.randomCred = randomCred.recordset[0];

             const randomQr = await query('SELECT TOP 1 * FROM tblCredentialQrCode');
             results.randomQr = randomQr.recordset[0];
        }
        
        fs.writeFileSync('test_output.json', JSON.stringify(results, null, 2));
        console.log('Done, wrote to test_output.json');
    } catch(e) {
        fs.writeFileSync('test_output.json', JSON.stringify({ error: e.message, stack: e.stack }));
    }
    process.exit(0);
}

test();
