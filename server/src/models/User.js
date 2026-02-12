/**
 * =============================================================================
 * MyNaati Backend — User Model (tblUser)
 * =============================================================================
 * 
 * Database operations for the tblUser table.
 * tblUser is the most referenced table in the database — nearly every table
 * has a ModifiedUser FK pointing to it.
 * 
 * Schema:
 *   UserId (PK), UserName, FullName, OfficeId, Note, Active, Email,
 *   SystemUser, NonWindowsUser, Password, LastPasswordChangeDate,
 *   FailedPasswordAttemptCount, IsLockedOut, LastLockoutDate
 * 
 * Also stores MFA secret (in a custom column or linked table).
 */

const { query, sql } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Create a new user record.
 * Called during registration after creating Entity and Person records.
 * 
 * @param {Object} data
 * @param {string} data.userName - Login username (max 50 chars)
 * @param {string} data.fullName - Display name (max 100 chars)
 * @param {string} data.email - Email address (max 200 chars)
 * @param {string} data.password - Bcrypt-hashed password (max 128 chars)
 * @param {number} [data.officeId=1] - Default office
 * @returns {Promise<number>} The newly created UserId
 */
async function create({ userName, fullName, email, password, officeId = 1 }) {
    const result = await query(
        `INSERT INTO tblUser (UserName, FullName, OfficeId, Active, Email,
       SystemUser, NonWindowsUser, Password, LastPasswordChangeDate,
       FailedPasswordAttemptCount, IsLockedOut)
     OUTPUT INSERTED.UserId
     VALUES (@userName, @fullName, @officeId, 1, @email,
       0, 1, @password, GETDATE(), 0, 0)`,
        {
            userName: { type: sql.NVarChar, value: userName },
            fullName: { type: sql.NVarChar, value: fullName },
            email: { type: sql.NVarChar, value: email },
            password: { type: sql.NVarChar, value: password },
            officeId: { type: sql.Int, value: officeId },
        }
    );
    return result.recordset[0].UserId;
}

/**
 * Find a user by their username (for login).
 * The most critical query in the auth flow.
 * 
 * @param {string} userName - The login username
 * @returns {Promise<Object|null>} User record or null
 */
async function findByUsername(userName) {
    const result = await query(
        `SELECT UserId, UserName, FullName, Email, Password, OfficeId,
            Active, IsLockedOut, FailedPasswordAttemptCount, LastLockoutDate,
            LastPasswordChangeDate, Note
     FROM tblUser
     WHERE UserName = @userName`,
        { userName: { type: sql.NVarChar, value: userName } }
    );
    return result.recordset[0] || null;
}

/**
 * Find a user by their email address.
 * Used for password reset flow.
 * 
 * @param {string} email - The user's email
 * @returns {Promise<Object|null>} User record or null
 */
async function findByEmail(email) {
    const result = await query(
        `SELECT UserId, UserName, FullName, Email, Password, OfficeId, Active, IsLockedOut
     FROM tblUser
     WHERE Email = @email AND Active = 1`,
        { email: { type: sql.NVarChar, value: email } }
    );
    return result.recordset[0] || null;
}

/**
 * Find a user by their UserId.
 * 
 * @param {number} userId - The UserId
 * @returns {Promise<Object|null>} User record or null
 */
async function findById(userId) {
    const result = await query(
        `SELECT UserId, UserName, FullName, Email, OfficeId, Active,
            IsLockedOut, FailedPasswordAttemptCount, Note
     FROM tblUser
     WHERE UserId = @userId`,
        { userId: { type: sql.Int, value: userId } }
    );
    return result.recordset[0] || null;
}

/**
 * Verify a password against a hash.
 * 
 * @param {string} storedHash - The bcrypt hash from the database
 * @param {string} password - The password to check
 * @returns {Promise<boolean>} True if match
 */
async function verifyPassword(storedHash, password) {
    return await bcrypt.compare(password, storedHash);
}

/**
 * Update the user's password hash.
 * Called during password change and password reset.
 * 
 * @param {number} userId - The UserId
 * @param {string} newPasswordHash - The new bcrypt hash
 */
async function updatePassword(userId, newPasswordHash) {
    await query(
        `UPDATE tblUser
     SET Password = @password,
         LastPasswordChangeDate = GETDATE(),
         FailedPasswordAttemptCount = 0
     WHERE UserId = @userId`,
        {
            userId: { type: sql.Int, value: userId },
            password: { type: sql.NVarChar, value: newPasswordHash },
        }
    );
}

/**
 * Increment the failed password attempt counter.
 * Called on each failed login attempt.
 * Auto-locks the account after 5 consecutive failures.
 * 
 * @param {number} userId - The UserId
 * @returns {Promise<number>} Updated failed attempt count
 */
async function incrementFailedAttempts(userId) {
    const result = await query(
        `UPDATE tblUser
     SET FailedPasswordAttemptCount = FailedPasswordAttemptCount + 1,
         IsLockedOut = CASE WHEN FailedPasswordAttemptCount + 1 >= 5 THEN 1 ELSE IsLockedOut END,
         LastLockoutDate = CASE WHEN FailedPasswordAttemptCount + 1 >= 5 THEN GETDATE() ELSE LastLockoutDate END
     OUTPUT INSERTED.FailedPasswordAttemptCount
     WHERE UserId = @userId`,
        { userId: { type: sql.Int, value: userId } }
    );
    return result.recordset[0]?.FailedPasswordAttemptCount || 0;
}

/**
 * Reset failed attempts counter (called after successful login).
 * 
 * @param {number} userId - The UserId
 */
async function resetFailedAttempts(userId) {
    await query(
        `UPDATE tblUser
     SET FailedPasswordAttemptCount = 0
     WHERE UserId = @userId`,
        { userId: { type: sql.Int, value: userId } }
    );
}

/**
 * Lock a user account (admin action or auto-lock after too many failures).
 * 
 * @param {number} userId - The UserId
 */
async function lockUser(userId) {
    await query(
        `UPDATE tblUser
     SET IsLockedOut = 1, LastLockoutDate = GETDATE()
     WHERE UserId = @userId`,
        { userId: { type: sql.Int, value: userId } }
    );
}

/**
 * Unlock a user account (admin action).
 * 
 * @param {number} userId - The UserId
 */
async function unlockUser(userId) {
    await query(
        `UPDATE tblUser
     SET IsLockedOut = 0, FailedPasswordAttemptCount = 0, LastLockoutDate = NULL
     WHERE UserId = @userId`,
        { userId: { type: sql.Int, value: userId } }
    );
}

/**
 * Search users by name, email, or username (admin function).
 * Returns paginated results.
 * 
 * @param {Object} options
 * @param {string} [options.searchQuery=''] - Search term
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Results per page
 * @returns {Promise<{ users: Object[], total: number }>}
 */
async function search({ searchQuery = '', page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${searchQuery}%`;

    // Get total count for pagination
    const countResult = await query(
        `SELECT COUNT(*) as total FROM tblUser
     WHERE (UserName LIKE @search OR FullName LIKE @search OR Email LIKE @search)`,
        { search: { type: sql.NVarChar, value: searchTerm } }
    );

    // Get paginated results
    const result = await query(
        `SELECT UserId, UserName, FullName, Email, Active, IsLockedOut, OfficeId
     FROM tblUser
     WHERE (UserName LIKE @search OR FullName LIKE @search OR Email LIKE @search)
     ORDER BY FullName ASC
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        {
            search: { type: sql.NVarChar, value: searchTerm },
            offset: { type: sql.Int, value: offset },
            limit: { type: sql.Int, value: limit },
        }
    );

    return {
        users: result.recordset,
        total: countResult.recordset[0].total,
    };
}

/**
 * Update the user's email address.
 * 
 * @param {number} userId - The UserId
 * @param {string} newEmail - The new email address
 */
async function updateEmail(userId, newEmail) {
    await query(
        `UPDATE tblUser SET Email = @email WHERE UserId = @userId`,
        {
            userId: { type: sql.Int, value: userId },
            email: { type: sql.NVarChar, value: newEmail },
        }
    );
}

module.exports = {
    create,
    findByUsername,
    findByEmail,
    findById,
    verifyPassword,
    updatePassword,
    incrementFailedAttempts,
    resetFailedAttempts,
    lockUser,
    unlockUser,
    search,
    updateEmail,
};
