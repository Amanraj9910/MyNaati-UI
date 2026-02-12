require('dotenv').config();
const { connectDatabase, sql } = require('./src/config/database');

async function main() {
    try {
        await connectDatabase();
        console.log('Cleaning up orphaned ASP.NET users...');

        // 1. Get orphaned user IDs
        const result = await sql.query(`
            SELECT u.UserId, u.UserName
            FROM aspnet_Users u
            LEFT JOIN tblMyNaatiUser link ON u.UserId = link.AspUserId
            WHERE link.AspUserId IS NULL
        `);

        if (result.recordset.length === 0) {
            console.log('No orphaned users found to clean up.');
            return;
        }

        const userIds = result.recordset.map(u => u.UserId);
        const userNames = result.recordset.map(u => u.UserName).join(', ');

        console.log(`Found ${userIds.length} orphaned users: ${userNames}`);

        // 2. Delete from aspnet_Membership first (FK dependency)
        for (const userId of userIds) {
            await sql.query(`DELETE FROM aspnet_Membership WHERE UserId = '${userId}'`);
            console.log(`Deleted membership for user ${userId}`);
        }

        // 3. Delete from aspnet_Users
        for (const userId of userIds) {
            await sql.query(`DELETE FROM aspnet_Users WHERE UserId = '${userId}'`);
            console.log(`Deleted user ${userId}`);
        }

        console.log('Cleanup complete.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

main();
