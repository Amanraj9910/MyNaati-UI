// Quick script to check tblPersonImage columns
require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
};

async function main() {
    try {
        const pool = await sql.connect(config);
        const res = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'tblPersonImage'
            ORDER BY ORDINAL_POSITION
        `);
        console.log('tblPersonImage columns:');
        console.log(JSON.stringify(res.recordset, null, 2));
        await pool.close();
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}

main();
