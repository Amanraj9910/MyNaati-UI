/**
 * Phone Model — tblPhone
 * Schema: (mirroring tblEmail pattern) PhoneId, EntityId, Phone, Note, IncludeInPD, IsPreferred, Invalid, ExaminerCorrespondence
 * Note: Uses 'Phone' column name (not 'PhoneNumber'), following NCMS naming convention (like tblEmail uses 'Email').
 */
const { query, sql } = require('../config/database');

async function findByEntityId(entityId) {
    const result = await query(
        `SELECT * FROM tblPhone WHERE EntityId = @entityId`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset;
}

async function create(entityId, data) {
    const result = await query(
        `INSERT INTO tblPhone (EntityId, Phone, Note)
         VALUES (@entityId, @phone, @note);
         SELECT SCOPE_IDENTITY() AS PhoneId;`,
        {
            entityId: { type: sql.Int, value: entityId },
            phone: { type: sql.NVarChar, value: data.Phone || data.PhoneNumber || '' },
            note: { type: sql.NVarChar, value: data.Note || '' }
        }
    );
    return result.recordset[0].PhoneId;
}

module.exports = { findByEntityId, create };
