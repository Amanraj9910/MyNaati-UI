/**
 * TestSitting Model — tblTestSitting
 * Schema: TestSittingId, TestSessionId, CredentialRequestId, Rejected, Sat, Supplementary,
 *         TestSpecificationId, AllocatedDate, RejectedDate
 * tblTestSession schema: TestSessionId, VenueId, Name, TestDateTime, ArrivalTime, Duration,
 *         CredentialTypeId, Completed, PublicNote, AllowSelfAssign, ...
 * Note: tblTestSession uses VenueId (NOT TestLocationId).
 *
 * Enhanced: Now includes credential type, skill (languages), venue, location,
 *           and credential request status for full Manage My Tests display.
 */
const { query, sql } = require('../config/database');

async function findByPersonId(personId) {
    const result = await query(
        `SELECT ts.TestSittingId, ts.CredentialRequestId, ts.TestSessionId,
                ts.Rejected, ts.Sat, ts.Supplementary, ts.AllocatedDate, ts.RejectedDate,
                tsess.TestDateTime, tsess.Name AS SessionName,
                ct.ExternalName AS CredentialTypeName,
                sk.SkillId,
                rt.Result AS OverallResult,
                l1.Name AS Language1, l2.Name AS Language2,
                v.Name AS VenueName, v.Address AS VenueAddress,
                tl.Name AS LocationName,
                crst.Name AS RequestStatusName,
                cr.CredentialRequestStatusTypeId AS RequestStatusId
         FROM tblTestSitting ts
         INNER JOIN tblTestSession tsess ON ts.TestSessionId = tsess.TestSessionId
         INNER JOIN tblCredentialRequest cr ON ts.CredentialRequestId = cr.CredentialRequestId
         INNER JOIN tblCredentialApplication ca ON cr.CredentialApplicationId = ca.CredentialApplicationId
         INNER JOIN tblCredentialType ct ON cr.CredentialTypeId = ct.CredentialTypeId
         LEFT JOIN tblSkill sk ON cr.SkillId = sk.SkillId
         LEFT JOIN tblLanguage l1 ON sk.Language1Id = l1.LanguageId
         LEFT JOIN tblLanguage l2 ON sk.Language2Id = l2.LanguageId
         LEFT JOIN tblVenue v ON tsess.VenueId = v.VenueId
         LEFT JOIN tblTestLocation tl ON v.TestLocationId = tl.TestLocationId
         OUTER APPLY (
             SELECT TOP 1 tr.ResultTypeId
             FROM tblTestResult tr
             WHERE tr.TestSittingId = ts.TestSittingId
             ORDER BY tr.ProcessedDate DESC
         ) LatestResult
         LEFT JOIN tluResultType rt ON LatestResult.ResultTypeId = rt.ResultTypeId
         LEFT JOIN tblCredentialRequestStatusType crst 
                ON cr.CredentialRequestStatusTypeId = crst.CredentialRequestStatusTypeId
         WHERE ca.PersonId = @personId
         ORDER BY tsess.TestDateTime DESC`,
        { personId: { type: sql.Int, value: personId } }
    );

    // Add computed action flags
    const now = new Date();
    return result.recordset.map(row => ({
        ...row,
        IsUpcoming: row.TestDateTime && new Date(row.TestDateTime) >= now,
        IsPast: row.TestDateTime && new Date(row.TestDateTime) < now,
        // CanSelectTestSession: status indicates eligible but no sitting booked yet
        // In practice, if a sitting exists, the session is already selected
        CanSelectTestSession: false,
        // CanRequestRefund: future test, not rejected, has been sat=false
        CanRequestRefund: row.TestDateTime && new Date(row.TestDateTime) >= now
            && !row.Rejected && !row.Sat,
    }));
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
