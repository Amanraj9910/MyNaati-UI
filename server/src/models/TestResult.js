/**
 * TestResult Model — tblTestResult
 * Schema: TestResultId, TestSittingId, ResultTypeId, ProcessedDate, SatDate,
 *         EligibleForSupplementary, EligibleForConcededPass, CommentsGeneral, ...
 * 
 * Joins: tblTestSitting → tblTestSession → tblVenue → tblTestLocation
 *        tblCredentialRequest → tblCredentialType, tblSkill → tblLanguage
 *        tluResultType (for Pass/Fail result name)
 */
const { query, sql } = require('../config/database');

/**
 * Get all test results for a person.
 * Traverses: TestResult → TestSitting → CredentialRequest → CredentialApplication → Person
 */
/**
 * Get all test results for a person.
 * Traverses: TestResult → TestSitting → CredentialRequest → CredentialApplication → Person
 * Filters: Only AllowIssue=1 (finalized) results, distinct by TestSittingId (latest ProcessedDate).
 */
async function findByPersonId(personId) {
    const result = await query(
        `WITH RankedResults AS (
            SELECT tr.TestResultId, tr.TestSittingId, tr.ProcessedDate, tr.SatDate,
                   tr.EligibleForSupplementary, tr.EligibleForConcededPass,
                   rt.Result AS OverallResult,
                   ct.ExternalName AS CredentialTypeName,
                   l1.Name AS Language1, l2.Name AS Language2,
                   tsess.TestDateTime, tsess.Name AS SessionName,
                   v.Name AS VenueName, v.Address AS VenueAddress,
                   tl.Name AS LocationName,
                   ts.TestSittingId AS AttendanceId,
                   ROW_NUMBER() OVER (PARTITION BY tr.TestSittingId ORDER BY tr.ProcessedDate DESC) as rn
            FROM tblTestResult tr
            INNER JOIN tblTestSitting ts ON tr.TestSittingId = ts.TestSittingId
            INNER JOIN tblTestSession tsess ON ts.TestSessionId = tsess.TestSessionId
            INNER JOIN tblCredentialRequest cr ON ts.CredentialRequestId = cr.CredentialRequestId
            INNER JOIN tblCredentialApplication ca ON cr.CredentialApplicationId = ca.CredentialApplicationId
            INNER JOIN tblCredentialType ct ON cr.CredentialTypeId = ct.CredentialTypeId
            LEFT JOIN tblSkill sk ON cr.SkillId = sk.SkillId
            LEFT JOIN tblLanguage l1 ON sk.Language1Id = l1.LanguageId
            LEFT JOIN tblLanguage l2 ON sk.Language2Id = l2.LanguageId
            LEFT JOIN tblVenue v ON tsess.VenueId = v.VenueId
            LEFT JOIN tblTestLocation tl ON v.TestLocationId = tl.TestLocationId
            LEFT JOIN tluResultType rt ON tr.ResultTypeId = rt.ResultTypeId
            WHERE ca.PersonId = @personId
        )
        SELECT * FROM RankedResults WHERE rn = 1
        ORDER BY ProcessedDate DESC`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset;
}

/**
 * Count total test results for a person (dashboard summary).
 */
async function countByPersonId(personId) {
    const result = await query(
        `SELECT COUNT(*) AS count
         FROM tblTestResult tr
         INNER JOIN tblTestSitting ts ON tr.TestSittingId = ts.TestSittingId
         INNER JOIN tblCredentialRequest cr ON ts.CredentialRequestId = cr.CredentialRequestId
         INNER JOIN tblCredentialApplication ca ON cr.CredentialApplicationId = ca.CredentialApplicationId
         WHERE ca.PersonId = @personId`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset[0].count;
}

/**
 * Get component-level results for a specific test result.
 * Shows detailed breakdown (e.g., Dialogue 1, Dialogue 2, Ethics scores).
 */
async function getComponentResults(testResultId) {
    const result = await query(
        `SELECT tcr.TestComponentResultId, 
                tct.Name AS ComponentName,
                tcr.Mark, tcr.MaxMark,
                mrt.Name AS ComponentResult
         FROM tblTestComponentResult tcr
         LEFT JOIN tblTestComponentType tct ON tcr.TypeId = tct.TestComponentTypeId
         LEFT JOIN tblMarkingResultType mrt ON tcr.MarkingResultTypeId = mrt.MarkingResultTypeId
         WHERE tcr.TestResultId = @testResultId
         ORDER BY tct.Name`,
        { testResultId: { type: sql.Int, value: testResultId } }
    );
    return result.recordset;
}

/**
 * Get a single test result by ID (with ownership check via personId).
 */
async function findById(testResultId, personId) {
    const result = await query(
        `SELECT tr.TestResultId, tr.TestSittingId, tr.ProcessedDate, tr.SatDate,
                tr.EligibleForSupplementary, tr.EligibleForConcededPass,
                tr.CommentsGeneral,
                rt.Result AS OverallResult,
                ct.ExternalName AS CredentialTypeName,
                l1.Name AS Language1, l2.Name AS Language2,
                tsess.TestDateTime, tsess.Name AS SessionName,
                v.Name AS VenueName, v.Address AS VenueAddress,
                tl.Name AS LocationName,
                ts.TestSittingId AS AttendanceId
         FROM tblTestResult tr
         INNER JOIN tblTestSitting ts ON tr.TestSittingId = ts.TestSittingId
         INNER JOIN tblTestSession tsess ON ts.TestSessionId = tsess.TestSessionId
         INNER JOIN tblCredentialRequest cr ON ts.CredentialRequestId = cr.CredentialRequestId
         INNER JOIN tblCredentialApplication ca ON cr.CredentialApplicationId = ca.CredentialApplicationId
         INNER JOIN tblCredentialType ct ON cr.CredentialTypeId = ct.CredentialTypeId
         LEFT JOIN tblSkill sk ON cr.SkillId = sk.SkillId
         LEFT JOIN tblLanguage l1 ON sk.Language1Id = l1.LanguageId
         LEFT JOIN tblLanguage l2 ON sk.Language2Id = l2.LanguageId
         LEFT JOIN tblVenue v ON tsess.VenueId = v.VenueId
         LEFT JOIN tblTestLocation tl ON v.TestLocationId = tl.TestLocationId
         LEFT JOIN tluResultType rt ON tr.ResultTypeId = rt.ResultTypeId
         WHERE tr.TestResultId = @testResultId AND ca.PersonId = @personId`,
        {
            testResultId: { type: sql.Int, value: testResultId },
            personId: { type: sql.Int, value: personId }
        }
    );
    return result.recordset[0] || null;
}

module.exports = { findByPersonId, countByPersonId, getComponentResults, findById };
