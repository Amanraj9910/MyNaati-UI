/**
 * Credential Model — tblCredential
 * Schema: CredentialId, StartDate, ExpiryDate, TerminationDate, ShowInOnlineDirectory, CertificationPeriodId
 * Note: tblCredential has NO CredentialTypeId, CredentialStatusTypeId, or EntityId.
 * Link to person is via: tblCredential.CertificationPeriodId -> tblCertificationPeriod.PersonId
 */
const { query, sql } = require('../config/database');

async function findByPersonId(personId) {
    const result = await query(
        `SELECT DISTINCT c.CredentialId, ct.ExternalName AS CredentialName, 
                COALESCE(cp.StartDate, c.StartDate) AS EffectiveFrom, 
                COALESCE(cp.EndDate, c.ExpiryDate) AS EffectiveTo, 
                c.TerminationDate, c.ShowInOnlineDirectory,
                ct.Level AS CredentialLevel,
                l1.Name AS Language1, l2.Name AS Language2
         FROM tblCredential c
         INNER JOIN tblCertificationPeriod cp ON c.CertificationPeriodId = cp.CertificationPeriodId
         INNER JOIN tblCredentialCredentialRequest ccr ON c.CredentialId = ccr.CredentialId
         INNER JOIN tblCredentialRequest cr ON ccr.CredentialRequestId = cr.CredentialRequestId
         INNER JOIN tblCredentialType ct ON cr.CredentialTypeId = ct.CredentialTypeId
         LEFT JOIN tblSkill sk ON cr.SkillId = sk.SkillId
         LEFT JOIN tblLanguage l1 ON sk.Language1Id = l1.LanguageId
         LEFT JOIN tblLanguage l2 ON sk.Language2Id = l2.LanguageId
         WHERE cp.PersonId = @personId
         ORDER BY COALESCE(cp.EndDate, c.ExpiryDate) DESC`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset;
}

async function countActive(personId) {
    const result = await query(
        `SELECT COUNT(DISTINCT c.CredentialId) AS count 
         FROM tblCredential c
         INNER JOIN tblCertificationPeriod cp ON c.CertificationPeriodId = cp.CertificationPeriodId
         WHERE cp.PersonId = @personId
         AND COALESCE(cp.EndDate, c.ExpiryDate) >= GETDATE()
         AND c.TerminationDate IS NULL`,
        { personId: { type: sql.Int, value: personId } }
    );
    return result.recordset[0].count;
}

async function update(credentialId, data) {
    if (data.ShowInOnlineDirectory !== undefined) {
        await query(
            'UPDATE tblCredential SET ShowInOnlineDirectory = @val WHERE CredentialId = @id',
            {
                val: { type: sql.Bit, value: data.ShowInOnlineDirectory ? 1 : 0 },
                id: { type: sql.Int, value: credentialId }
            }
        );
    }
}

module.exports = { findByPersonId, countActive, update };
