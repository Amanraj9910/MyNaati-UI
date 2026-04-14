require('dotenv').config();
const { query } = require('./src/config/database');
const fs = require('fs');

async function check() {
    try {
        // Check tblSkill columns
        const skillCols = await query(
            `SELECT COLUMN_NAME, DATA_TYPE 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = 'tblSkill'
             ORDER BY ORDINAL_POSITION`
        );

        // Check tblCredentialQrCode columns  
        const qrCols = await query(
            `SELECT COLUMN_NAME, DATA_TYPE 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = 'tblCredentialQrCode'
             ORDER BY ORDINAL_POSITION`
        );

        // Check tblCredentialType columns
        const ctCols = await query(
            `SELECT COLUMN_NAME, DATA_TYPE 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = 'tblCredentialType'
             ORDER BY ORDINAL_POSITION`
        );

        // Get a sample skill row
        const sampleSkill = await query('SELECT TOP 2 * FROM tblSkill');

        // Get a sample QR code row
        const sampleQr = await query('SELECT TOP 2 * FROM tblCredentialQrCode');

        fs.writeFileSync('schema_output.json', JSON.stringify({
            tblSkill_columns: skillCols.recordset,
            tblCredentialQrCode_columns: qrCols.recordset,
            tblCredentialType_columns: ctCols.recordset,
            sample_skill: sampleSkill.recordset,
            sample_qr: sampleQr.recordset,
        }, null, 2));

        console.log('Done - wrote schema_output.json');
    } catch(e) {
        fs.writeFileSync('schema_output.json', JSON.stringify({ error: e.message, stack: e.stack }));
        console.log('Error - check schema_output.json');
    }
    process.exit(0);
}

check();
