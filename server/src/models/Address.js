/**
 * Address Model — tblAddress
 * Schema: AddressId, EntityId, StreetDetails, PostcodeId, CountryId, Note,
 *         StartDate, EndDate, PrimaryContact, Invalid, SubscriptionExpiryDate,
 *         SubscriptionRenewSentDate, ContactPerson, ValidateInExternalTool,
 *         ExaminerCorrespondence, ODAddressVisibilityTypeId
 * Note: No AddressLine1, AddressLine2, Suburb, State, PostCode, Country, FreeForm*, AddressTypeId, IsPrimary columns.
 * Uses StreetDetails for address text, PostcodeId links to tblPostcode, CountryId for country.
 * PrimaryContact (bit) serves as the "is primary" flag.
 */
const { query, sql } = require('../config/database');

async function findByEntityId(entityId) {
    const result = await query(
        `SELECT a.AddressId, a.EntityId, a.StreetDetails,
                a.PostcodeId, a.CountryId, a.Note,
                a.PrimaryContact AS IsPrimary, a.ContactPerson,
                p.Postcode, p.SuburbId
         FROM tblAddress a
         LEFT JOIN tblPostcode p ON a.PostcodeId = p.PostcodeId
         WHERE a.EntityId = @entityId AND a.Invalid = 0
         ORDER BY a.PrimaryContact DESC, a.AddressId DESC`,
        { entityId: { type: sql.Int, value: entityId } }
    );
    return result.recordset;
}

async function create(entityId, data) {
    const result = await query(
        `INSERT INTO tblAddress (EntityId, StreetDetails, PostcodeId, CountryId, PrimaryContact, Invalid, Note, StartDate, ODAddressVisibilityTypeId)
         VALUES (@entityId, @streetDetails, @postcodeId, @countryId, @isPrimary, 0, @note, GETDATE(), 1);
         SELECT SCOPE_IDENTITY() AS AddressId;`,
        {
            entityId: { type: sql.Int, value: entityId },
            streetDetails: { type: sql.NVarChar, value: data.StreetDetails || data.AddressLine1 || '' },
            postcodeId: { type: sql.Int, value: data.PostcodeId || null },
            countryId: { type: sql.Int, value: data.CountryId || null },
            isPrimary: { type: sql.Bit, value: data.IsPrimary ? 1 : 0 },
            note: { type: sql.NVarChar, value: data.Note || '' }
        }
    );
    return result.recordset[0].AddressId;
}

async function update(addressId, data) {
    const result = await query(
        `UPDATE tblAddress 
         SET StreetDetails = @streetDetails,
             PostcodeId = @postcodeId,
             CountryId = @countryId,
             PrimaryContact = @isPrimary,
             Note = @note
         WHERE AddressId = @addressId`,
        {
            addressId: { type: sql.Int, value: addressId },
            streetDetails: { type: sql.NVarChar, value: data.StreetDetails || data.AddressLine1 || '' },
            postcodeId: { type: sql.Int, value: data.PostcodeId || null },
            countryId: { type: sql.Int, value: data.CountryId || null },
            isPrimary: { type: sql.Bit, value: data.IsPrimary ? 1 : 0 },
            note: { type: sql.NVarChar, value: data.Note || '' }
        }
    );
    return result;
}

async function findById(addressId) {
    const result = await query(
        `SELECT * FROM tblAddress WHERE AddressId = @addressId`,
        { addressId: { type: sql.Int, value: addressId } }
    );
    return result.recordset[0];
}

module.exports = { findByEntityId, create, update, findById };
