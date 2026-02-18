/**
 * =============================================================================
 * MyNaati Backend — Person Model (tblPerson + tblPersonName)
 * =============================================================================
 * 
 * Database operations for person records.
 * 
 * tblPerson stores individual details (DOB, gender, etc.) linked to tblEntity.
 * tblPersonName stores name history with effective dates (supports name changes).
 * 
 * On the dashboard, the latest person name is used for the welcome greeting.
 */

const { query, sql } = require('../config/database');

/**
 * Create a new person record linked to an entity.
 * 
 * @param {Object} data
 * @param {number} data.entityId - The parent EntityId from tblEntity
 * @param {string} [data.dateOfBirth] - Date of birth (ISO format)
 * @param {number} [data.genderId=1] - Gender ID (reference value)
 * @returns {Promise<number>} The newly created PersonId
 */
async function create({ entityId, dateOfBirth = null, gender = 'U' }) {
    // NameOnAccreditationProduct is required, use a placeholder or derive from context if possible. 
    // Since we don't have the full name here, we'll use a placeholder string.
    const result = await query(
        `INSERT INTO tblPerson (EntityId, Gender, BirthDate, Deceased, ReleaseDetails, DoNotInviteToDirectory,
       EnteredDate, ExpertiseFreeText, NameOnAccreditationProduct, DoNotSendCorrespondence,
       ScanRequired, AllowVerifyOnline, ShowPhotoOnline, EthicalCompetency, InterculturalCompetency,
       AllowAutoRecertification, KnowledgeTest, IsDeleted, IncludeInPD)
     OUTPUT INSERTED.PersonId
     VALUES (@entityId, @gender, @birthDate, 0, 0, 0,
       GETDATE(), '', 'Pending Name', 0,
       0, 0, 0, 0, 0,
       0, 0, 0, 0)`,
        {
            entityId: { type: sql.Int, value: entityId },
            birthDate: { type: sql.DateTime, value: dateOfBirth },
            gender: { type: sql.NChar, value: gender },
        }
    );
    return result.recordset[0].PersonId;
}

/**
 * Find a person by their PersonId, including their latest name.
 * Joins tblPersonName to get the most recent name by EffectiveDate.
 * 
 * @param {number} personId - The PersonId to look up
 * @returns {Promise<Object|null>} Person record with name fields, or null
 */
async function findById(personId) {
    const result = await query(
        `SELECT p.*, pn.GivenName, pn.OtherNames as MiddleName, pn.Surname, pn.TitleId
     FROM tblPerson p
     LEFT JOIN tblPersonName pn ON p.PersonId = pn.PersonId
       AND pn.EffectiveDate = (
         SELECT MAX(pn2.EffectiveDate) FROM tblPersonName pn2 WHERE pn2.PersonId = p.PersonId
       )
     WHERE p.PersonId = @personId`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset[0] || null;
}

/**
 * Find a person by their EntityId.
 * 
 * @param {number} entityId - The EntityId to look up
 * @returns {Promise<Object|null>} Person record or null
 */
async function findByEntityId(entityId) {
    const result = await query(
        `SELECT p.*, pn.GivenName, pn.OtherNames as MiddleName, pn.Surname
     FROM tblPerson p
     LEFT JOIN tblPersonName pn ON p.PersonId = pn.PersonId
       AND pn.EffectiveDate = (
         SELECT MAX(pn2.EffectiveDate) FROM tblPersonName pn2 WHERE pn2.PersonId = p.PersonId
       )
     WHERE p.EntityId = @entityId`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset[0] || null;
}

/**
 * Create a name record for a person in tblPersonName.
 * Supports name history — each name has an EffectiveDate.
 * 
 * @param {Object} data
 * @param {number} data.personId - The PersonId
 * @param {string} data.givenName - Given/first name (max 100 chars)
 * @param {string} data.surname - Surname/last name (max 100 chars)
 * @param {string} [data.middleName] - Middle name (max 100 chars)
 * @param {number} [data.titleId] - Title from tluTitle (Mr, Ms, etc.)
 * @returns {Promise<number>} The newly created PersonNameId
 */
async function createName({ personId, givenName, surname, middleName = null, titleId = null }) {
    const result = await query(
        `INSERT INTO tblPersonName (PersonId, TitleId, GivenName, Surname, OtherNames,
       EffectiveDate, AlternativeGivenName, AlternativeSurname)
     OUTPUT INSERTED.PersonNameId
     VALUES (@personId, @titleId, @givenName, @surname, @otherNames,
       GETDATE(), '', '')`,
        {
            personId: { type: sql.Int, value: personId },
            titleId: { type: sql.Int, value: titleId },
            givenName: { type: sql.VarChar, value: givenName },
            surname: { type: sql.VarChar, value: surname },
            otherNames: { type: sql.VarChar, value: middleName || '' },
        }
    );
    return result.recordset[0].PersonNameId;
}

/**
 * Get the latest name for a person (most recent EffectiveDate).
 * Used for the dashboard welcome greeting.
 * 
 * @param {number} personId - The PersonId
 * @returns {Promise<Object|null>} Name record { GivenName, MiddleName, Surname }
 */
async function getLatestName(personId) {
    const result = await query(
        `SELECT TOP 1 PersonNameId, GivenName, OtherNames as MiddleName, Surname, TitleId, EffectiveDate
     FROM tblPersonName
     WHERE PersonId = @personId
     ORDER BY EffectiveDate DESC`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset[0] || null;
}

async function update(personId, data) {
    // Only allow updating specific fields
    const allowedFields = ['Gender', 'BirthDate']; // Corrected field names for tblPerson
    const updates = {};

    // Build update object
    for (const field of allowedFields) {
        // Map data keys to database column names if necessary
        let dataKey = field;
        if (field === 'Gender') dataKey = 'gender';
        if (field === 'BirthDate') dataKey = 'dateOfBirth';

        if (data[dataKey] !== undefined) {
            updates[field] = data[dataKey];
        }
    }

    if (Object.keys(updates).length === 0) return { rowsAffected: 0 };

    // Construct SQL dynamically
    const setClause = Object.keys(updates).map(key => `${key} = @${key}`).join(', ');

    const params = {
        personId: { type: sql.Int, value: personId }
    };

    // Add params
    for (const [key, value] of Object.entries(updates)) {
        params[key] = {
            type: key === 'BirthDate' ? sql.DateTime : (key === 'Gender' ? sql.NChar : sql.NVarChar),
            value: value
        };
    }

    const result = await query(
        `UPDATE tblPerson SET ${setClause} WHERE PersonId = @personId`,
        params
    );

    return result;
}

module.exports = {
    create,
    findById,
    findByEntityId,
    createName,
    getLatestName,
    update,
};
