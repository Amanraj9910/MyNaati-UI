/**
 * ProfessionalDevelopment Model — tblProfessionalDevelopmentActivity
 * Schema: ProfessionalDevelopmentActivityId, ProfessionalDevelopmentCategoryId,
 *         ProfessionalDevelopmentRequirementId, Notes, Description, DateCompleted, PersonId
 * Note: No StartDate, Points, Hours, or ActivityDate columns.
 */
const { query, sql } = require('../config/database');

async function findByPersonId(personId) {
    const result = await query(
        `SELECT pda.ProfessionalDevelopmentActivityId, pda.PersonId,
                pda.DateCompleted AS ActivityDate, pda.Description, pda.Notes,
                pda.ProfessionalDevelopmentCategoryId AS CategoryId,
                pdc.Name AS CategoryName
         FROM tblProfessionalDevelopmentActivity pda
         LEFT JOIN tblProfessionalDevelopmentCategory pdc ON pda.ProfessionalDevelopmentCategoryId = pdc.ProfessionalDevelopmentCategoryId
         WHERE pda.PersonId = @personId
         ORDER BY pda.DateCompleted DESC`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset;
}

async function countByPersonId(personId) {
    const result = await query(
        `SELECT COUNT(*) AS count,
                0 AS totalHours
         FROM tblProfessionalDevelopmentActivity
         WHERE PersonId = @personId`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset[0];
}

async function create(personId, data) {
    const result = await query(
        `INSERT INTO tblProfessionalDevelopmentActivity (PersonId, ProfessionalDevelopmentCategoryId, DateCompleted, Description, Notes)
         VALUES (@personId, @categoryId, @dateCompleted, @description, @notes);
         SELECT SCOPE_IDENTITY() AS ProfessionalDevelopmentActivityId;`,
        {
            personId: { type: sql.Int, value: personId },
            categoryId: { type: sql.Int, value: data.CategoryId },
            dateCompleted: { type: sql.DateTime, value: data.ActivityDate || data.DateCompleted },
            description: { type: sql.NVarChar, value: data.Description },
            notes: { type: sql.NVarChar, value: data.Notes || `Hours: ${data.Hours || 0}` }
        }
    );
    return result.recordset[0].ProfessionalDevelopmentActivityId;
}

async function getCategories() {
    const result = await query('SELECT ProfessionalDevelopmentCategoryId, Name, Description FROM tblProfessionalDevelopmentCategory ORDER BY Name');
    return result.recordset;
}

module.exports = { findByPersonId, countByPersonId, create, getCategories };
