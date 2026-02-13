/**
 * TestSitting Model — tblTestSitting
 * Queries test sittings linked to a person (via PersonId).
 */
const { query, sql } = require('../config/database');

async function findByPersonId(personId) {
    const result = await query(
        `SELECT ts.TestSittingId, ts.CredentialRequestId, ts.TestSessionId,
                tsess.TestDateTime AS SittingDate,
                tsess.Name AS SessionName, tsess.TestDateTime,
                tl.Name AS LocationName, tl.City
         FROM tblTestSitting ts
         INNER JOIN tblTestSession tsess ON ts.TestSessionId = tsess.TestSessionId
         INNER JOIN tblTestLocation tl ON tsess.TestLocationId = tl.TestLocationId
         INNER JOIN tblCredentialRequest cr ON ts.CredentialRequestId = cr.CredentialRequestId
         INNER JOIN tblCredentialApplication ca ON cr.CredentialApplicationId = ca.CredentialApplicationId
         WHERE ca.PersonId = @personId
         ORDER BY tsess.TestDateTime DESC`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset;
}

async function countUpcoming(personId) {
    const result = await query(
        `SELECT COUNT(*) AS count 
         FROM tblTestSitting ts
         INNER JOIN tblTestSession tsess ON ts.TestSessionId = tsess.TestSessionId
         INNER JOIN tblCredentialRequest cr ON ts.CredentialRequestId = cr.CredentialRequestId
         INNER JOIN tblCredentialApplication ca ON cr.CredentialApplicationId = ca.CredentialApplicationId
         WHERE ca.PersonId = @personId AND tsess.TestDateTime >= GETDATE()`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset[0].count;
}

module.exports = { findByPersonId, countUpcoming };
