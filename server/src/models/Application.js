/**
 * Application Model — tblCredentialApplication
 * Queries credential applications linked to an entity.
 */
const { query, sql } = require('../config/database');

async function findByEntityId(entityId) {
    const result = await query(
        `SELECT ca.CredentialApplicationId, ca.EntityId, ca.ApplicationNumber,
                ca.ApplicationDate, ca.CredentialApplicationStatusTypeId as StatusId,
                cast.Name as StatusName
         FROM tblCredentialApplication ca
         INNER JOIN tblCredentialApplicationStatusType cast ON ca.CredentialApplicationStatusTypeId = cast.CredentialApplicationStatusTypeId
         WHERE ca.EntityId = @entityId
         ORDER BY ca.ApplicationDate DESC`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset;
}

async function countActive(entityId) {
    const result = await query(
        `SELECT COUNT(*) AS count FROM tblCredentialApplication ca
         INNER JOIN tblCredentialApplicationStatusType cast ON ca.CredentialApplicationStatusTypeId = cast.CredentialApplicationStatusTypeId
         WHERE ca.EntityId = @entityId AND cast.Name NOT IN ('Completed', 'Cancelled', 'Rejected')`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset[0].count;
}

module.exports = { findByEntityId, countActive };
