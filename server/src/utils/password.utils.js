const crypto = require('crypto');

/**
 * =============================================================================
 * ASP.NET Membership Password Hasher
 * =============================================================================
 * 
 * Replicates the logic of standard ASP.NET SqlMembershipProvider.
 * Defaults to SHA1 + Salt + Base64, which is the legacy standard behavior.
 * 
 * Flow:
 * 1. Base64 Decode Salt
 * 2. Concatenate Salt + Password (Buffers)
 * 3. Hash (SHA1)
 * 4. Base64 Encode Result
 */

function generateSalt() {
    return crypto.randomBytes(16).toString('base64');
}

function hashPassword(password, saltBase64) {
    if (!password || !saltBase64) return null;

    try {
        const saltBuffer = Buffer.from(saltBase64, 'base64');
        const passwordBuffer = Buffer.from(password, 'utf16le'); // ASP.NET uses UTF-16LE for strings in hashing logic usually? 
        // WAIT: Standard ASP.NET Membership usually does:
        // byte[] bIn = Encoding.Unicode.GetBytes(pass);
        // byte[] bSalt = Convert.FromBase64String(salt);
        // byte[] bAll = new byte[bSalt.Length + bIn.Length];

        // Let's stick to the most common implementation:
        // 1. Salt bytes (from B64)
        // 2. Password bytes (Unicode/UTF-16LE)

        const combinedBuffer = Buffer.concat([
            saltBuffer,
            Buffer.from(password, 'utf16le')
        ]);

        // SHA1 is the default for legacy ASP.NET Membership
        const hash = crypto.createHash('sha1').update(combinedBuffer).digest('base64');
        return hash;
    } catch (error) {
        console.error('Hashing error:', error);
        return null;
    }
}

function validatePassword(password, saltBase64, storedHash) {
    const computedHash = hashPassword(password, saltBase64);
    return computedHash === storedHash;
}

module.exports = {
    generateSalt,
    hashPassword,
    validatePassword
};
