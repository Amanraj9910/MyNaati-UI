require('dotenv').config();
const { connectDatabase, sql } = require('./src/config/database');

async function main() {
    try {
        await connectDatabase();
        console.log('Checking for orphaned ASP.NET users (failed registrations)...');

        // Find ASP.NET Users who do NOT have a corresponding record in tblMyNaatiUser
        const result = await sql.query(`
            SELECT u.UserId, u.UserName, m.CreateDate
            FROM aspnet_Users u
            JOIN aspnet_Membership m ON u.UserId = m.UserId
            LEFT JOIN tblMyNaatiUser link ON u.UserId = link.AspUserId
            WHERE link.AspUserId IS NULL
            ORDER BY m.CreateDate DESC
        `);

        if (result.recordset.length === 0) {
            console.log('No orphaned users found.');
        } else {
            console.log(`Found ${result.recordset.length} orphaned users:`);
            result.recordset.forEach(u => {
                console.log(`- User: ${u.UserName} (Created: ${u.CreateDate}) - ID: ${u.UserId}`);
            });

            // Cleanup?
            // For now, just listing.
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

main();
