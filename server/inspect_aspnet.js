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

        const result = await pool.request().query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME IN ('aspnet_Membership', 'aspnet_Users', 'aspnet_Applications')
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);

        const grouped = {};
        result.recordset.forEach(r => {
            if (!grouped[r.TABLE_NAME]) grouped[r.TABLE_NAME] = [];
            grouped[r.TABLE_NAME].push(`${r.COLUMN_NAME} (${r.DATA_TYPE}, nullable=${r.IS_NULLABLE})`);
        });

        const fs = require('fs');
        fs.writeFileSync('aspnet_schema.json', JSON.stringify(grouped, null, 2));
        console.log('Schema written to aspnet_schema.json');

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
main();
