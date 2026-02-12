/**
 * Credential Model — tblCredential
 * Queries credentials linked to an entity (via EntityId).
 */
const { query, sql } = require('../config/database');

async function findByEntityId(entityId) {
    const result = await query(
        `SELECT c.CredentialId, c.EntityId, c.CredentialTypeId, c.StatusId,
                ct.Name AS CredentialTypeName, ct.Description AS CredentialTypeDescription,
                c.EffectiveFrom, c.EffectiveTo, c.IsActive
         FROM tblCredential c
         LEFT JOIN tluCredentialType ct ON c.CredentialTypeId = ct.CredentialTypeId
         WHERE c.EntityId = @entityId
         ORDER BY c.EffectiveFrom DESC`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset;
}

async function countActive(entityId) {
    const result = await query(
        `SELECT COUNT(*) AS count FROM tblCredential
         WHERE EntityId = @entityId AND IsActive = 1`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset[0].count;
}

module.exports = { findByEntityId, countActive };
