/**
 * Application Model — tblCredentialApplication
 * Schema: CredentialApplicationId, CredentialApplicationTypeId, CredentialApplicationStatusTypeId,
 *         EnteredDate, PersonId, SponsorInstitutionId, EnteredUserId, ReceivingOfficeId,
 *         StatusChangeDate, StatusChangeUserId, OwnedByUserId, OwnedByApplicant,
 *         PreferredTestLocationId, SponsorInstitutionContactPersonId, AutoCreated
 * Note: Uses PersonId (NOT EntityId). Uses EnteredDate (NOT ApplicationDate). No ApplicationNumber column.
 */
const { query, sql } = require('../config/database');

async function findByPersonId(personId) {
    const result = await query(
        `SELECT ca.CredentialApplicationId, ca.PersonId,
                ca.EnteredDate AS ApplicationDate, ca.CredentialApplicationStatusTypeId AS StatusId,
                cast.Name AS StatusName, ca.CredentialApplicationTypeId
         FROM tblCredentialApplication ca
         INNER JOIN tblCredentialApplicationStatusType cast ON ca.CredentialApplicationStatusTypeId = cast.CredentialApplicationStatusTypeId
         WHERE ca.PersonId = @personId
         ORDER BY ca.EnteredDate DESC`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset;
}

async function countActive(personId) {
    const result = await query(
        `SELECT COUNT(*) AS count FROM tblCredentialApplication ca
         INNER JOIN tblCredentialApplicationStatusType cast ON ca.CredentialApplicationStatusTypeId = cast.CredentialApplicationStatusTypeId
         WHERE ca.PersonId = @personId AND cast.Name NOT IN ('Completed', 'Cancelled', 'Rejected')`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset[0].count;
}

async function create(personId, typeId) {
    const appResult = await query(
        `INSERT INTO tblCredentialApplication (PersonId, EnteredDate, CredentialApplicationTypeId, CredentialApplicationStatusTypeId, OwnedByApplicant, AutoCreated)
         VALUES (@personId, GETDATE(), @typeId, 1, 1, 0);
         SELECT SCOPE_IDENTITY() AS CredentialApplicationId;`,
        {
            personId: { type: sql.Int, value: personId },
            typeId: { type: sql.Int, value: typeId }
        }
    );
    return appResult.recordset[0].CredentialApplicationId;
}

module.exports = { findByPersonId, countActive, create };
