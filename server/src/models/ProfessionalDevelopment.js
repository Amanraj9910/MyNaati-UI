/**
 * ProfessionalDevelopment Model — tblProfessionalDevelopmentActivity
 * Queries PD activities linked to a person (via PersonId).
 */
const { query, sql } = require('../config/database');

async function findByPersonId(personId) {
    const result = await query(
        `SELECT pda.ProfessionalDevelopmentActivityId, pda.PersonId,
                pda.ActivityDate, pda.Description, pda.Hours,
                pda.StatusId, pda.CategoryId,
                pdc.Name AS CategoryName
         FROM tblProfessionalDevelopmentActivity pda
         LEFT JOIN tluProfessionalDevelopmentCategory pdc ON pda.CategoryId = pdc.ProfessionalDevelopmentCategoryId
         WHERE pda.PersonId = @personId
         ORDER BY pda.ActivityDate DESC`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset;
}

async function countByPersonId(personId) {
    const result = await query(
        `SELECT COUNT(*) AS count,
                ISNULL(SUM(Hours), 0) AS totalHours
         FROM tblProfessionalDevelopmentActivity
         WHERE PersonId = @personId`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset[0];
}

module.exports = { findByPersonId, countByPersonId };
