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
        console.log('Connecting to database...');
        const pool = await sql.connect(config);
        console.log('Connected. Querying schema...');

        const result = await pool.request().query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME IN ('tblEmail')
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);

        if (result.recordset.length === 0) {
            console.log('No columns found for the specified tables. Are the table names correct?');
            // List all tables to be sure
            const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'");
            console.log('Available tables:', tables.recordset.map(r => r.TABLE_NAME).join(', '));
        } else {
            const grouped = {};
            result.recordset.forEach(r => {
                if (!grouped[r.TABLE_NAME]) grouped[r.TABLE_NAME] = [];
                grouped[r.TABLE_NAME].push(`${r.COLUMN_NAME} (${r.DATA_TYPE}, nullable=${r.IS_NULLABLE})`);
            });

            const fs = require('fs');
            fs.writeFileSync('schema.json', JSON.stringify(grouped, null, 2));
            console.log('Schema written to schema.json');
        }
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
main();
