// Quick schema inspection — get actual column names for test-related tables
require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { encrypt: true, trustServerCertificate: true },
};

async function main() {
    const pool = await sql.connect(config);
    const tables = [
        'tblTestSitting', 'tblTestSession', 'tblTestResult',
        'tblCredentialRequest', 'tblCredentialType', 'tblVenue',
        'tblTestLocation', 'tblSkill', 'tblLanguage',
        'tluResultType', 'tblCredentialRequestStatusType',
        'tblTestComponentResult', 'tblTestComponentType', 'tblMarkingResultType'
    ];
    for (const t of tables) {
        try {
            const r = await pool.request().query(
                `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
                 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${t}' ORDER BY ORDINAL_POSITION`
            );
            console.log(`\n=== ${t} (${r.recordset.length} cols) ===`);
            r.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE}${c.CHARACTER_MAXIMUM_LENGTH ? ', ' + c.CHARACTER_MAXIMUM_LENGTH : ''})`));
        } catch (e) {
            console.log(`\n=== ${t} — NOT FOUND ===`);
        }
    }
    await pool.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
