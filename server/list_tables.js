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
        const result = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
        const fs = require('fs');
        fs.writeFileSync('tables.json', JSON.stringify(result.recordset.map(t => t.TABLE_NAME), null, 2));
        console.log('Tables written to tables.json');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
main();
