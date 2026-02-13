/**
 * Credential Model — tblCredential
 * Queries credentials linked to an entity (via EntityId).
 */
const { query, sql } = require('../config/database');

async function findByEntityId(entityId) {
    const result = await query(
        `SELECT c.CredentialId, c.EntityId, c.CredentialTypeId,
                c.StartDate AS EffectiveFrom, c.ExpiryDate AS EffectiveTo,
                ct.Name AS CredentialTypeName, ct.Description AS CredentialTypeDescription,
                cst.Name AS Status
         FROM tblCredential c
         INNER JOIN tblCredentialType ct ON c.CredentialTypeId = ct.CredentialTypeId
         INNER JOIN tblCredentialStatusType cst ON c.CredentialStatusTypeId = cst.CredentialStatusTypeId
         WHERE c.EntityId = @entityId
         ORDER BY c.ExpiryDate DESC`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset;
}

async function countActive(entityId) {
    const result = await query(
        `SELECT COUNT(*) AS count FROM tblCredential
         WHERE EntityId = @entityId 
         AND ExpiryDate >= GETDATE()
         AND CredentialStatusTypeId IN (SELECT CredentialStatusTypeId FROM tblCredentialStatusType WHERE Name = 'Active')`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset[0].count;
}

module.exports = { findByEntityId, countActive };
