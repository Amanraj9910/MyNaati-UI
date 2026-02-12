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

        log('--- Inspecting tblMyNaatiUser & tblEntity ---');
        const schemaResult = await pool.request().query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('tblMyNaatiUser', 'tblEntity')
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);

        log(schemaResult.recordset);

        // Also check if there are any existing records in tblMyNaatiUser to see sample data
        const sampleResult = await pool.request().query('SELECT TOP 5 * FROM tblMyNaatiUser');
        log('\n--- Sample Data (tblMyNaatiUser) ---');
        log(sampleResult.recordset);

        fs.writeFileSync('mynaati_user_schema.txt', output);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
main();
