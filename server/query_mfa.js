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
    await sql.connect(config);
    const result = await sql.query(`SELECT p.PersonId, p.MfaCode, p.MfaExpireStartDate, p.EntityId, e.Email FROM tblPerson p JOIN tblEmail e ON p.EntityId = e.EntityId WHERE e.Email = 'rajaman78167@gmail.com'`);
    console.log(result.recordset);
    process.exit(0);
}
main();
