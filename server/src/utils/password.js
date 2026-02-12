/**
 * =============================================================================
 * MyNaati Backend — Password Utility
 * =============================================================================
 * 
 * Provides bcrypt-based password hashing and comparison functions.
 * Used during user registration (hash) and login (compare).
 * 
 * Maps to tblUser.Password column in the database.
 */

const bcrypt = require('bcryptjs');

/** Number of salt rounds for bcrypt hashing (12 = good balance of security/speed) */
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt.
 * Used when creating a new user or changing a password.
 * 
 * @param {string} plainPassword - The plaintext password to hash
 * @returns {Promise<string>} The bcrypt hash string
 */
async function hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 * Used during login to verify the user's password.
 * 
 * @param {string} plainPassword - The plaintext password provided by the user
 * @param {string} hashedPassword - The stored bcrypt hash from tblUser.Password
 * @returns {Promise<boolean>} True if the password matches the hash
 */
async function comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePassword,
};
