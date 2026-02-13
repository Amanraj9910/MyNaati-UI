require('dotenv').config();
const { query } = require('./src/config/database');
const fs = require('fs');

async function check() {
    const tables = [
        'tblProfessionalDevelopmentCategory',
        'tblProfessionalDevelopmentRequirement',
        'tblCredentialCredentialRequest',
        'tblCredentialRequest',
        'tblCredentialStatusType',
        'tblTestStatusType',
        'tblCredentialApplicationStatusType',
        'tblPersonName',
        'tblEntity',
        'tblPostcode'
    ];

    const results = {};

    for (const t of tables) {
        try {
            const res = await query("SELECT TOP 0 * FROM " + t);
            results[t] = Object.keys(res.recordset.columns);
        } catch (e) {
            results[t] = 'FAILED: ' + e.message;
        }
    }

    const current = JSON.parse(fs.readFileSync('schema_investigation.json', 'utf8'));
    const combined = { ...current, ...results };

    fs.writeFileSync('schema_investigation.json', JSON.stringify(combined, null, 2));
    console.log('Schema investigation updated.');
    process.exit(0);
}

check();
