/**
 * =============================================================================
 * MyNaati Backend — MyNaatiUser Model (tblMyNaatiUser)
 * =============================================================================
 * 
 * Database operations for the tblMyNaatiUser table.
 * Links MyNaati portal users to ASP.NET membership users.
 * In the new system, this table bridges UserId ↔ PersonId for portal access.
 * 
 * Schema:
 *   MyNaatiUserId (PK), AspUserId, PersonId, MfaSecret, MfaEnabled
 * 
 * Note: MfaSecret and MfaEnabled may need to be added as columns if they
 * don't exist in the legacy schema. These store TOTP authentication data.
 */

const { query, sql } = require('../config/database');

/**
 * Create a new MyNaati portal user record.
 * Links a user account to a person record for portal access.
 * 
 * @param {Object} data
 * @param {number} data.userId - The UserId from tblUser
 * @param {number} data.personId - The PersonId from tblPerson
 * @returns {Promise<number>} The newly created MyNaatiUserId
 */
async function create({ userId, personId }) {
    const result = await query(
        `INSERT INTO tblMyNaatiUser (AspUserId, PersonId)
     OUTPUT INSERTED.MyNaatiUserId
     VALUES (@userId, @personId)`,
        {
            userId: { type: sql.Int, value: userId },
            personId: { type: sql.Int, value: personId },
        }
    );
    return result.recordset[0].MyNaatiUserId;
}

/**
 * Find a MyNaati user by PersonId.
 * Used to look up the portal user link for an authenticated person.
 * 
 * @param {number} personId - The PersonId to look up
 * @returns {Promise<Object|null>} MyNaatiUser record or null
 */
async function findByPersonId(personId) {
    const result = await query(
        `SELECT * FROM tblMyNaatiUser WHERE PersonId = @personId`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset[0] || null;
}

/**
 * Find a MyNaati user by UserId (AspUserId column).
 * Used during login to resolve the PersonId for the authenticated user.
 * 
 * @param {number} userId - The UserId (stored in AspUserId column)
 * @returns {Promise<Object|null>} MyNaatiUser record or null
 */
async function findByUserId(userId) {
    const result = await query(
        `SELECT * FROM tblMyNaatiUser WHERE AspUserId = @userId`,
        { userId: { type: sql.Int, value: userId } }
    );
    return result.recordset[0] || null;
}

module.exports = {
    create,
    findByPersonId,
    findByUserId,
};
