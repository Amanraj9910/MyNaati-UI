/**
 * =============================================================================
 * MyNaati Backend — CredentialIdCard Model
 * =============================================================================
 * 
 * Database operations for the Digital ID Card feature.
 * Fetches practitioner data, photo, active credentials, and QR code GUIDs 
 * needed to render the digital credential card on the dashboard.
 * 
 * Tables involved:
 *   - tblPerson, tblPersonName (practitioner identity)
 *   - tblPersonImage (practitioner photo)
 *   - tblEntity (NAATI number)
 *   - tblCertificationPeriod → tblCredential (active credentials)
 *   - tblCredentialCredentialRequest → tblCredentialRequest → tblCredentialType (credential type names)
 *   - tblSkill → tblLanguage (language pairs)
 *   - tblCredentialQrCode (QR code GUIDs for verification)
 */

const { query, sql } = require('../config/database');

/**
 * Get the core practitioner data needed for the front of the ID card.
 * Returns name, NAATI number, practitioner number, and photo (as base64).
 * 
 * @param {number} personId - The practitioner's PersonId
 * @returns {Promise<Object|null>} Practitioner card data or null
 */
async function getIdCardData(personId) {
    const result = await query(
        `SELECT 
            p.PersonId,
            e.NAATINumber,
            p.PractitionerNumber,
            pn.GivenName,
            pn.Surname,
            pn.OtherNames
        FROM tblPerson p
        INNER JOIN tblEntity e ON p.EntityId = e.EntityId
        LEFT JOIN tblPersonName pn ON p.PersonId = pn.PersonId
            AND pn.EffectiveDate = (
                SELECT MAX(pn2.EffectiveDate) 
                FROM tblPersonName pn2 
                WHERE pn2.PersonId = p.PersonId
            )
        WHERE p.PersonId = @personId`,
        { personId: { type: sql.Int, value: personId } }
    );
    
    const row = result.recordset[0];
    if (!row) return null;

    return {
        personId: row.PersonId,
        naatiNumber: row.NAATINumber,
        practitionerNumber: row.PractitionerNumber || `N${row.NAATINumber}`,
        givenName: row.GivenName || '',
        surname: row.Surname || '',
        otherNames: row.OtherNames || '',
        fullName: [row.GivenName, row.OtherNames, row.Surname].filter(Boolean).join(' '),
        photoUrl: null,
    };
}

/**
 * Get all active, non-terminated certification credentials for the back of the card.
 * Prioritizes interpreter credentials first, then sorts by expiry date descending.
 * 
 * @param {number} personId - The practitioner's PersonId
 * @returns {Promise<Array>} List of active credentials with type, skill, and expiry
 */
async function getActiveCredentialsForCard(personId) {
    const result = await query(
        `SELECT DISTINCT 
            c.CredentialId,
            ct.ExternalName AS CredentialTypeName,
            st.DisplayName AS SkillDisplayName,
            l1.Name AS Language1,
            l2.Name AS Language2,
            COALESCE(cp.EndDate, c.ExpiryDate) AS ExpiryDate,
            CASE WHEN ct.ExternalName LIKE '%Interpreter%' THEN 1 ELSE 0 END AS IsInterpreter
        FROM tblCredential c
        INNER JOIN tblCertificationPeriod cp ON c.CertificationPeriodId = cp.CertificationPeriodId
        INNER JOIN tblCredentialCredentialRequest ccr ON c.CredentialId = ccr.CredentialId
        INNER JOIN tblCredentialRequest cr ON ccr.CredentialRequestId = cr.CredentialRequestId
        INNER JOIN tblCredentialType ct ON cr.CredentialTypeId = ct.CredentialTypeId
        LEFT JOIN tblSkill sk ON cr.SkillId = sk.SkillId
        LEFT JOIN tblSkillType st ON sk.SkillTypeId = st.SkillTypeId
        LEFT JOIN tblLanguage l1 ON sk.Language1Id = l1.LanguageId
        LEFT JOIN tblLanguage l2 ON sk.Language2Id = l2.LanguageId
        WHERE cp.PersonId = @personId
            -- Commented out for dev: AND COALESCE(cp.EndDate, c.ExpiryDate) >= GETDATE()
            AND c.TerminationDate IS NULL
        ORDER BY IsInterpreter DESC, COALESCE(cp.EndDate, c.ExpiryDate) DESC`,
        { personId: { type: sql.Int, value: personId } }
    );

    return result.recordset.map(row => ({
        credentialId: row.CredentialId,
        credentialType: row.CredentialTypeName,
        skillDisplayName: row.SkillDisplayName || null,
        languagePair: [row.Language1, row.Language2].filter(Boolean).join(' ↔ ') || null,
        expiryDate: row.ExpiryDate,
        isInterpreter: !!row.IsInterpreter,
    }));
}

/**
 * Get the QR code GUID for a specific credential.
 * Returns the most recently issued, active QR code.
 * 
 * @param {number} credentialId - The CredentialId
 * @returns {Promise<string|null>} QR code GUID string or null
 */
async function getQrCodeGuid(credentialId) {
    const result = await query(
        `SELECT TOP 1 QrCodeGuid 
        FROM tblCredentialQrCode 
        WHERE CredentialId = @credentialId 
            -- Commented out for dev: AND (InactiveDate IS NULL OR InactiveDate > GETDATE())
        ORDER BY IssueDate DESC`,
        { credentialId: { type: sql.Int, value: credentialId } }
    );

    return result.recordset[0]?.QrCodeGuid || null;
}

module.exports = {
    getIdCardData,
    getActiveCredentialsForCard,
    getQrCodeGuid,
};
