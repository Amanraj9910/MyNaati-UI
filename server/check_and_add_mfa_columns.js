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
        await sql.connect(config);
        const columns = ['MfaCode', 'MfaExpireStartDate', 'LastEmailCode', 'EmailCodeExpireStartDate'];
        const result = await sql.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'tblPerson'
            AND COLUMN_NAME IN ('${columns.join("','")}')
        `);

        const foundColumns = result.recordset.map(r => r.COLUMN_NAME);
        const missingColumns = columns.filter(c => !foundColumns.includes(c));

        console.log('Found:', foundColumns);
        console.log('Missing:', missingColumns);

        if (missingColumns.length > 0) {
            console.log('Attempting to add missing columns...');
            for (const col of missingColumns) {
                let type = 'NVARCHAR(100)';
                if (col.includes('Date')) type = 'DATETIME';
                if (col === 'MfaCode') type = 'VARCHAR(100)'; // Secret key
                if (col === 'LastEmailCode') type = 'VARCHAR(10)';

                try {
                    await sql.query(`ALTER TABLE tblPerson ADD ${col} ${type} NULL`);
                    console.log(`Added ${col}`);
                } catch (e) {
                    console.error(`Failed to add ${col}: ${e.message}`);
                }
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
main();
