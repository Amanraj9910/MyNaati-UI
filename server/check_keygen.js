require('dotenv').config();
const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: { encrypt: true, trustServerCertificate: true }
};

async function main() {
    try {
        const pool = await sql.connect(config);
        const fs = require('fs');
        let output = '';
        const log = (msg) => {
            const text = (typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg);
            console.log(text);
            output += text + '\n';
        };

        // 1. Check if Stored Procedure exists
        log('--- Checking for Stored Procedure: GetSingleKey ---');
        const spResult = await pool.request().query(`
            SELECT ROUTINE_NAME, ROUTINE_DEFINITION 
            FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_NAME = 'GetSingleKey'
        `);

        if (spResult.recordset.length > 0) {
            log('✅ Found Stored Procedure: GetSingleKey');
        } else {
            log('❌ Stored Procedure GetSingleKey NOT found.');
        }

        // 2. Check tblTableData for PersonNaatiNumber
        log('\n--- Checking tblTableData for PersonNaatiNumber ---');
        // First check if table exists
        const tableCheck = await pool.request().query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'tblTableData'
        `);

        if (tableCheck.recordset.length === 0) {
            log('❌ tblTableData does NOT exist.');
        } else {
            // Check content
            const dataResult = await pool.request().query(`
                SELECT * FROM tblTableData WHERE TableName = 'PersonNaatiNumber'
            `);

            if (dataResult.recordset.length > 0) {
                log('✅ Found PersonNaatiNumber counter:');
                log(dataResult.recordset[0]);
            } else {
                log('❌ PersonNaatiNumber entry NOT found in tblTableData. Listing all keys:');
                const allKeys = await pool.request().query('SELECT * FROM tblTableData');
                log(allKeys.recordset);
            }
        }

        fs.writeFileSync('naati_keygen_check.txt', output);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
main();
