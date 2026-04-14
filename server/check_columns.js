const { query } = require('./src/config/database');

async function main() {
    try {
        const res = await query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'tblPersonImage'
        `);
        console.log(JSON.stringify(res.recordset, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
