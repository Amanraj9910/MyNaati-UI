const { query, sql } = require('../config/database');

// /MyNaati Application ID
const APPLICATION_ID = 'A4B7C679-ED79-491E-841D-34A65938D621';

async function create({ userId, userName }) {
    await query(
        `INSERT INTO aspnet_Users (ApplicationId, UserId, UserName, LoweredUserName, MobileAlias, IsAnonymous, LastActivityDate)
         VALUES (@appId, @userId, @userName, @loweredUserName, NULL, 0, GETDATE())`,
        {
            appId: { type: sql.UniqueIdentifier, value: APPLICATION_ID },
            userId: { type: sql.UniqueIdentifier, value: userId },
            userName: { type: sql.NVarChar, value: userName },
            loweredUserName: { type: sql.NVarChar, value: userName.toLowerCase() }
        }
    );
    return userId;
}

async function findByUserName(userName) {
    const result = await query(
        `SELECT * FROM aspnet_Users 
         WHERE ApplicationId = @appId AND LoweredUserName = @loweredUserName`,
        {
            appId: { type: sql.UniqueIdentifier, value: APPLICATION_ID },
            loweredUserName: { type: sql.NVarChar, value: userName.toLowerCase() }
        }
    );
    return result.recordset[0] || null;
}

/**
 * Find an ASP.NET user by their UserId (GUID).
 * Used for token refresh and profile lookup.
 * 
 * @param {string} userId - The ASP.NET User GUID
 * @returns {Promise<Object|null>} User record or null
 */
async function findByUserId(userId) {
    const result = await query(
        `SELECT * FROM aspnet_Users 
         WHERE ApplicationId = @appId AND UserId = @userId`,
        {
            appId: { type: sql.UniqueIdentifier, value: APPLICATION_ID },
            userId: { type: sql.UniqueIdentifier, value: userId }
        }
    );
    return result.recordset[0] || null;
}

module.exports = {
    create,
    findByUserName,
    findByUserId
};
