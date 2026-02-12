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
        const email = 'rajaman78167@gmail.com';
        const pool = await sql.connect(config);

        const fs = require('fs');
        let output = '';
        const log = (msg) => { console.log(msg); output += msg + '\n'; };

        log(`Checking for user: ${email}...`);

        // 1. Check tblUser
        const userResult = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM tblUser WHERE Email = @email');

        if (userResult.recordset.length === 0) {
            log('❌ User NOT found in tblUser.');
            fs.writeFileSync('verification_output.txt', output);
            process.exit(0);
        }

        const user = userResult.recordset[0];
        log('✅ User found in tblUser:');
        log(`   - UserId: ${user.UserId}`);
        log(`   - FullName: ${user.FullName}`);
        log(`   - Active: ${user.Active}`);

        // 2. Check tblEmail link
        const emailResult = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM tblEmail WHERE Email = @email');

        if (emailResult.recordset.length === 0) {
            log('❌ Email record NOT found in tblEmail (Link missing).');
        } else {
            const emailRecord = emailResult.recordset[0];
            log('✅ Email record found in tblEmail:');
            log(`   - EmailId: ${emailRecord.EmailId}`);
            log(`   - EntityId: ${emailRecord.EntityId}`);

            // 3. Check tblPerson
            const personResult = await pool.request()
                .input('entityId', sql.Int, emailRecord.EntityId)
                .query('SELECT * FROM tblPerson WHERE EntityId = @entityId');

            if (personResult.recordset.length === 0) {
                log('❌ Person record NOT found in tblPerson.');
            } else {
                const person = personResult.recordset[0];
                log('✅ Person found in tblPerson:');
                log(`   - PersonId: ${person.PersonId}`);

                // 4. Check tblPersonName
                const nameResult = await pool.request()
                    .input('personId', sql.Int, person.PersonId)
                    .query('SELECT * FROM tblPersonName WHERE PersonId = @personId');

                if (nameResult.recordset.length === 0) {
                    log('❌ PersonName record NOT found.');
                } else {
                    const name = nameResult.recordset[0];
                    log('✅ PersonName found:');
                    log(`   - GivenName: ${name.GivenName}`);
                    log(`   - Surname: ${name.Surname}`);
                    log(`   - OtherNames: ${name.OtherNames}`);
                }
            }
        }
        fs.writeFileSync('verification_output.txt', output);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
main();
