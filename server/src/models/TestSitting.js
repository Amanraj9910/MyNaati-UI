/**
 * TestSitting Model — tblTestSitting
 * Schema: TestSittingId, TestSessionId, CredentialRequestId, Rejected, Sat, Supplementary,
 *         TestSpecificationId, AllocatedDate, RejectedDate
 * tblTestSession schema: TestSessionId, VenueId, Name, TestDateTime, ArrivalTime, Duration,
 *         CredentialTypeId, Completed, PublicNote, AllowSelfAssign, ...
 * Note: tblTestSession uses VenueId (NOT TestLocationId).
 */
const { query, sql } = require('../config/database');

async function findByPersonId(personId) {
    const result = await query(
        `SELECT ts.TestSittingId, ts.CredentialRequestId, ts.TestSessionId,
                tsess.TestDateTime AS SittingDate,
                tsess.Name AS SessionName, tsess.TestDateTime,
                tsess.VenueId, ts.Rejected, ts.Sat
         FROM tblTestSitting ts
         INNER JOIN tblTestSession tsess ON ts.TestSessionId = tsess.TestSessionId
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
