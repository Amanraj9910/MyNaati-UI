/**
 * Application Model — tblCredentialApplication
 * Queries credential applications linked to an entity.
 */
const { query, sql } = require('../config/database');

async function findByEntityId(entityId) {
    const result = await query(
        `SELECT ca.CredentialApplicationId, ca.EntityId, ca.ApplicationDate,
                ca.StatusId, ca.CredentialApplicationTypeId,
                cat.Name AS ApplicationTypeName,
                ca.ReferenceNumber, ca.LastModifiedDate
         FROM tblCredentialApplication ca
         LEFT JOIN tluCredentialApplicationType cat ON ca.CredentialApplicationTypeId = cat.CredentialApplicationTypeId
         WHERE ca.EntityId = @entityId
         ORDER BY ca.ApplicationDate DESC`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset;
}

async function countActive(entityId) {
    const result = await query(
        `SELECT COUNT(*) AS count FROM tblCredentialApplication
         WHERE EntityId = @entityId AND StatusId NOT IN (
             SELECT StatusId FROM tluApprovalStatus WHERE Name IN ('Completed', 'Cancelled', 'Rejected')
         )`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset[0].count;
}

module.exports = { findByEntityId, countActive };
