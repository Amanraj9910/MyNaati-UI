/**
 * =============================================================================
 * MyNaati Backend — Entity Model (tblEntity)
 * =============================================================================
 * 
 * Database operations for the tblEntity table.
 * tblEntity is the ROOT table in the schema — all persons and institutions
 * link to an entity record. Every person must have a corresponding entity.
 * 
 * Schema:
 *   EntityId (PK), NaatiNumber, EntityTypeId, ODHidden, ModifiedByNaati,
 *   ModifiedDate
 */

const { query, sql } = require('../config/database');

/**
 * Create a new entity record (required before creating a Person or Institution).
 * 
 * @param {Object} data
 * @param {number} data.entityTypeId - Type of entity (e.g., 1=Person, 2=Institution)
 * @returns {Promise<number>} The newly created EntityId
 */
async function create({ entityTypeId, naatiNumber = null }) {
    const result = await query(
        `INSERT INTO tblEntity (EntityTypeId, WebsiteURL, ABN, Note, UseEmail, WebsiteInPD, GSTApplies, NAATINumber)
     OUTPUT INSERTED.EntityId
     VALUES (@entityTypeId, '', '', '', 0, 0, 0, @naatiNumber)`,
        {
            entityTypeId: { type: sql.Int, value: entityTypeId },
            naatiNumber: { type: sql.Int, value: naatiNumber }
        }
    );
    return result.recordset[0].EntityId;
}

/**
 * Find an entity by its ID.
 * 
 * @param {number} entityId - The EntityId to look up
 * @returns {Promise<Object|null>} The entity record or null if not found
 */
async function findById(entityId) {
    const result = await query(
        'SELECT * FROM tblEntity WHERE EntityId = @entityId',
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset[0] || null;
}

module.exports = {
    create,
    findById,
};
