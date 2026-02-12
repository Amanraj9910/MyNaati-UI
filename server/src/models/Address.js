/**
 * Address Model — tblAddress
 * Queries addresses linked to an entity (via EntityId).
 */
const { query, sql } = require('../config/database');

async function findByEntityId(entityId) {
    const result = await query(
        `SELECT a.AddressId, a.EntityId, a.AddressLine1, a.AddressLine2,
                a.Suburb, a.State, a.PostCode, a.Country,
                a.AddressTypeId, a.IsPrimary
         FROM tblAddress a
         WHERE a.EntityId = @entityId
         ORDER BY a.IsPrimary DESC, a.AddressId DESC`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset;
}

module.exports = { findByEntityId };
