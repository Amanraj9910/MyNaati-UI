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

        // 1. Get ApplicationId
        log('--- Fetching ApplicationId ---');
        const appResult = await pool.request().query(`
            SELECT ApplicationName, ApplicationId, LoweredApplicationName 
            FROM aspnet_Applications 
            WHERE LoweredApplicationName = '/mynaati'
        `);

        if (appResult.recordset.length > 0) {
            log('✅ Found Application:');
            log(appResult.recordset[0]);
        } else {
            log('❌ Application "/mynaati" NOT found. Listing all:');
            const allApps = await pool.request().query('SELECT ApplicationName, LoweredApplicationName FROM aspnet_Applications');
            log(allApps.recordset);
        }

        // 2. Check for GUID link in tblPerson/tblEntity
        log('\n--- Checking for GUID columns in tblPerson/tblEntity ---');
        const schemaResult = await pool.request().query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('tblPerson', 'tblEntity', 'tblEmail') 
            AND (DATA_TYPE = 'uniqueidentifier' OR COLUMN_NAME LIKE '%User%')
        `);
        // Added tblEmail and LIKE User check to be thorough

        log(schemaResult.recordset);

        fs.writeFileSync('config_output_utf8.txt', output);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
main();
