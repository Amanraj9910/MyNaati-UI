/**
 * Diagnostic script: Check if a user exists and what records are associated.
 * Usage: node check_user.js <email>
 */
require('dotenv').config();
const { connectDB, query, sql } = require('./src/config/database');

const APPLICATION_ID = 'A4B7C679-ED79-491E-841D-34A65938D621';

async function checkUser(email) {
    await connectDB();
    console.log(`\n🔍 Checking records for: ${email}\n`);

    // 1. Check aspnet_Users
    const aspUser = await query(
        `SELECT UserId, UserName, LastActivityDate FROM aspnet_Users 
         WHERE ApplicationId = @appId AND LoweredUserName = @email`,
        {
            appId: { type: sql.UniqueIdentifier, value: APPLICATION_ID },
            email: { type: sql.NVarChar, value: email.toLowerCase() }
        }
    );
    console.log('aspnet_Users:', aspUser.recordset.length > 0 ? aspUser.recordset[0] : 'NOT FOUND');

    // 2. Check aspnet_Membership
    if (aspUser.recordset.length > 0) {
        const membership = await query(
            `SELECT UserId, Email, IsApproved, IsLockedOut, CreateDate FROM aspnet_Membership WHERE UserId = @userId`,
            { userId: { type: sql.UniqueIdentifier, value: aspUser.recordset[0].UserId } }
        );
        console.log('aspnet_Membership:', membership.recordset.length > 0 ? membership.recordset[0] : 'NOT FOUND');
    }

    // 3. Check tblUser (legacy)
    const legacyUser = await query(
        `SELECT TOP 1 UserId, UserName, Email, FullName FROM tblUser WHERE Email = @email`,
        { email: { type: sql.NVarChar, value: email } }
    );
    console.log('tblUser (legacy):', legacyUser.recordset.length > 0 ? legacyUser.recordset[0] : 'NOT FOUND');

    // 4. Check MyNaatiUser link
    if (aspUser.recordset.length > 0) {
        const link = await query(
            `SELECT * FROM tblMyNaatiUser WHERE AspUserId = @userId`,
            { userId: { type: sql.UniqueIdentifier, value: aspUser.recordset[0].UserId } }
        );
        console.log('tblMyNaatiUser:', link.recordset.length > 0 ? link.recordset[0] : 'NOT FOUND');
    }

    console.log('\n✅ Done\n');
    process.exit(0);
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node check_user.js <email>');
    process.exit(1);
}

checkUser(email).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
