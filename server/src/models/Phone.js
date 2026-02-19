/**
 * Phone Model — tblPhone
 * Actual DB columns: PhoneId, EntityId, CountryCode, AreaCode, LocalNumber, Number(COMPUTED), Note, IncludeInPD, AllowSmsNotification, Invalid, PrimaryContact, ExaminerCorrespondence
 * Number is COMPUTED = rtrim(ltrim(CountryCode + ' ' + AreaCode + ' ' + LocalNumber))
 * Must write to LocalNumber, NOT Number.
 */
const { query, sql } = require('../config/database');

async function findByEntityId(entityId) {
    const result = await query(
        `SELECT * FROM tblPhone WHERE EntityId = @entityId AND Invalid = 0`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset;
}

async function create(entityId, data) {
    const phoneNumber = data.Number || data.Phone || data.LocalNumber || '';
    const result = await query(
        `INSERT INTO tblPhone (EntityId, LocalNumber, Note, PrimaryContact, IncludeInPD, ExaminerCorrespondence, Invalid, CountryCode, AreaCode, AllowSmsNotification)
         VALUES (@entityId, @localNumber, @note, @primaryContact, @includeInPD, @examinerCorrespondence, 0, '', '', 0);
         SELECT SCOPE_IDENTITY() AS PhoneId;`,
        {
            entityId: { type: sql.Int, value: entityId },
            localNumber: { type: sql.VarChar, value: phoneNumber },
            note: { type: sql.VarChar, value: data.Note || '' },
            primaryContact: { type: sql.Bit, value: data.PrimaryContact ? 1 : 0 },
            includeInPD: { type: sql.Bit, value: data.IncludeInPD ? 1 : 0 },
            examinerCorrespondence: { type: sql.Bit, value: data.ExaminerCorrespondence ? 1 : 0 }
        }
    );
    return result.recordset[0].PhoneId;
}

async function update(phoneId, data) {
    // If setting PrimaryContact=1, first unset others for this entity
    if (data.PrimaryContact) {
        const current = await query('SELECT EntityId FROM tblPhone WHERE PhoneId = @id', { id: { type: sql.Int, value: phoneId } });
        const entityId = current.recordset[0]?.EntityId;
        if (entityId) {
            await query(
                'UPDATE tblPhone SET PrimaryContact = 0 WHERE EntityId = @entityId',
                { entityId: { type: sql.Int, value: entityId } }
            );
        }
    }

    const updates = {};
    // Phone number goes into LocalNumber (Number is computed)
    if (data.Number !== undefined || data.Phone !== undefined || data.LocalNumber !== undefined) {
        updates.LocalNumber = data.Number || data.Phone || data.LocalNumber;
    }
    if (data.Note !== undefined) updates.Note = data.Note;
    if (data.PrimaryContact !== undefined) updates.PrimaryContact = data.PrimaryContact ? 1 : 0;
    if (data.IncludeInPD !== undefined) updates.IncludeInPD = data.IncludeInPD ? 1 : 0;
    if (data.ExaminerCorrespondence !== undefined) updates.ExaminerCorrespondence = data.ExaminerCorrespondence ? 1 : 0;

    if (Object.keys(updates).length === 0) return;

    const setClause = Object.keys(updates).map(k => `${k} = @${k}`).join(', ');
    const params = { phoneId: { type: sql.Int, value: phoneId } };

    for (const [k, v] of Object.entries(updates)) {
        params[k] = { type: (k === 'LocalNumber' || k === 'Note') ? sql.VarChar : sql.Bit, value: v };
    }

    await query(`UPDATE tblPhone SET ${setClause} WHERE PhoneId = @phoneId`, params);
}

module.exports = { findByEntityId, create, update };
