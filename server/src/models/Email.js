/**
 * =============================================================================
 * MyNaati Backend — Email Model (tblEmail)
 * =============================================================================
 * 
 * Database operations for the tblEmail table.
 * Used to link an Entity (Person) to an Email address.
 * Key for establishing the link between tblUser (auth) and tblPerson (profile).
 * 
 * Schema:
 *   EmailId (PK), EntityId, Email, Note, IncludeInPD, IsPreferredEmail,
 *   Invalid, ExaminerCorrespondence
 */

const { query, sql } = require('../config/database');

/**
 * Create a new email record linked to an entity.
 * 
 * @param {Object} data
 * @param {number} data.entityId - The parent EntityId
 * @param {string} data.email - The email address
 * @returns {Promise<number>} The newly created EmailId
 */
async function create({ entityId, email }) {
    const result = await query(
        `INSERT INTO tblEmail (EntityId, Address, Note, IncludeInPD, IsPreferredEmail, Invalid, ExaminerCorrespondence)
     OUTPUT INSERTED.EmailId
     VALUES (@entityId, @email, '', 0, 1, 0, 0)`,
        {
            entityId: { type: sql.Int, value: entityId },
            email: { type: sql.VarChar, value: email },
        }
    );
    return result.recordset[0].EmailId;
}

/**
 * Find an email record by the email address.
 * Used during login to resolve EntityId from User.Email.
 * 
 * @param {string} email - The email address to look up
 * @returns {Promise<Object|null>} Email record or null
 */
async function findByEmail(email) {
    const result = await query(
        `SELECT * FROM tblEmail WHERE Address = @email`,
        { email: { type: sql.VarChar, value: email } }
    );
    return result.recordset[0] || null;
}

/**
 * Find the preferred email for an entity.
 * 
 * @param {number} entityId - The EntityId
 * @returns {Promise<Object|null>} Email record or null
 */
async function findPreferredByEntityId(entityId) {
    const result = await query(
        `SELECT TOP 1 * FROM tblEmail 
         WHERE EntityId = @entityId AND IsPreferredEmail = 1
         ORDER BY EmailId DESC`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset[0] || null;
}

/**
 * Find all emails for an entity.
 * 
 * @param {number} entityId - The EntityId
 * @returns {Promise<Object[]>} Array of email records
 */
async function findByEntityId(entityId) {
    const result = await query(
        `SELECT * FROM tblEmail
         WHERE EntityId = @entityId
         ORDER BY IsPreferredEmail DESC, EmailId DESC`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset;
}

module.exports = {
    create,
    findByEmail,
    findPreferredByEntityId,
    findByEntityId,
};
