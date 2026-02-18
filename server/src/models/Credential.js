/**
 * Credential Model — tblCredential
 * Schema: CredentialId, StartDate, ExpiryDate, TerminationDate, ShowInOnlineDirectory, CertificationPeriodId
 * Note: tblCredential has NO CredentialTypeId, CredentialStatusTypeId, or EntityId.
 * Link to person is via: tblCredential.CertificationPeriodId -> tblCertificationPeriod.PersonId
 */
const { query, sql } = require('../config/database');

async function findByPersonId(personId) {
    const result = await query(
        `SELECT c.CredentialId, c.StartDate AS EffectiveFrom, c.ExpiryDate AS EffectiveTo,
                c.TerminationDate, c.ShowInOnlineDirectory, c.CertificationPeriodId
         FROM tblCredential c
         INNER JOIN tblCertificationPeriod cp ON c.CertificationPeriodId = cp.CertificationPeriodId
         WHERE cp.PersonId = @personId
         ORDER BY c.ExpiryDate DESC`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset;
}

async function countActive(personId) {
    const result = await query(
        `SELECT COUNT(c.CredentialId) AS count 
         FROM tblCredential c
         INNER JOIN tblCertificationPeriod cp ON c.CertificationPeriodId = cp.CertificationPeriodId
         WHERE cp.PersonId = @personId
         AND c.ExpiryDate >= GETDATE()
         AND c.TerminationDate IS NULL`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset[0].count;
}

module.exports = { findByPersonId, countActive };
