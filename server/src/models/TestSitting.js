/**
 * TestSitting Model — tblTestSitting
 * Queries test sittings linked to a person (via PersonId).
 */
const { query, sql } = require('../config/database');

async function findByPersonId(personId) {
    const result = await query(
        `SELECT ts.TestSittingId, ts.PersonId, ts.TestSessionId,
                ts.SittingDate, ts.StatusId,
                tsess.Name AS SessionName, tsess.TestDate,
                tl.Name AS LocationName, tl.City
         FROM tblTestSitting ts
         LEFT JOIN tblTestSession tsess ON ts.TestSessionId = tsess.TestSessionId
         LEFT JOIN tblTestLocation tl ON tsess.TestLocationId = tl.TestLocationId
         WHERE ts.PersonId = @personId
         ORDER BY ts.SittingDate DESC`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset;
}

async function countUpcoming(personId) {
    const result = await query(
        `SELECT COUNT(*) AS count FROM tblTestSitting
         WHERE PersonId = @personId AND SittingDate >= GETDATE()`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset[0].count;
}

module.exports = { findByPersonId, countUpcoming };
