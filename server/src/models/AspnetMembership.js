const { query, sql } = require('../config/database');

const APPLICATION_ID = 'A4B7C679-ED79-491E-841D-34A65938D621';

async function create({ userId, password, passwordSalt, email }) {
    await query(
        `INSERT INTO aspnet_Membership (
            ApplicationId, UserId, Password, PasswordFormat, PasswordSalt, Email, LoweredEmail,
            IsApproved, IsLockedOut, CreateDate, LastLoginDate, LastPasswordChangedDate, LastLockoutDate,
            FailedPasswordAttemptCount, FailedPasswordAttemptWindowStart,
            FailedPasswordAnswerAttemptCount, FailedPasswordAnswerAttemptWindowStart
         )
         VALUES (
            @appId, @userId, @password, 1, @passwordSalt, @email, @loweredEmail,
            1, 0, GETDATE(), GETDATE(), GETDATE(), '1754-01-01',
            0, '1754-01-01', 0, '1754-01-01'
         )`,
        {
            appId: { type: sql.UniqueIdentifier, value: APPLICATION_ID },
            userId: { type: sql.UniqueIdentifier, value: userId },
            password: { type: sql.NVarChar, value: password },
            passwordSalt: { type: sql.NVarChar, value: passwordSalt },
            email: { type: sql.NVarChar, value: email },
            loweredEmail: { type: sql.NVarChar, value: email.toLowerCase() }
        }
    );
}

async function findByUserId(userId) {
    const result = await query(
        `SELECT * FROM aspnet_Membership WHERE UserId = @userId`,
        { userId: { type: sql.UniqueIdentifier, value: userId } }
    );
    return result.recordset[0] || null;
}

/**
 * Find a membership record by email address.
 * Uses LoweredEmail for case-insensitive matching within the MyNaati application.
 * 
 * @param {string} email - The email to search for
 * @returns {Promise<Object|null>} Membership record or null
 */
async function findByEmail(email) {
    const result = await query(
        `SELECT m.*, u.UserName FROM aspnet_Membership m
         INNER JOIN aspnet_Users u ON m.UserId = u.UserId
         WHERE m.ApplicationId = @appId AND m.LoweredEmail = @loweredEmail`,
        {
            appId: { type: sql.UniqueIdentifier, value: APPLICATION_ID },
            loweredEmail: { type: sql.NVarChar, value: email.toLowerCase() }
        }
    );
    return result.recordset[0] || null;
}

/**
 * Update a user's password hash and salt in aspnet_Membership.
 * 
 * @param {string} userId - The ASP.NET User GUID
 * @param {string} newPasswordHash - The new hashed password
 * @param {string} newSalt - The new password salt
 */
async function updatePassword(userId, newPasswordHash, newSalt) {
    await query(
        `UPDATE aspnet_Membership 
         SET Password = @password, PasswordSalt = @salt, LastPasswordChangedDate = GETDATE()
         WHERE UserId = @userId`,
        {
            userId: { type: sql.UniqueIdentifier, value: userId },
            password: { type: sql.NVarChar, value: newPasswordHash },
            salt: { type: sql.NVarChar, value: newSalt }
        }
    );
}

module.exports = {
    create,
    findByUserId,
    findByEmail,
    updatePassword
};
