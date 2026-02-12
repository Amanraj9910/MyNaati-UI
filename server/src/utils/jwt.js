/**
 * =============================================================================
 * MyNaati Backend — JWT Utility
 * =============================================================================
 * 
 * Provides helper functions for generating and verifying JSON Web Tokens.
 * Used for authentication: access tokens (short-lived) and refresh tokens
 * (long-lived).
 * 
 * Access Token  — 15 minutes, used in Authorization header
 * Refresh Token — 7 days, used to get new access tokens
 */

const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate an access token for an authenticated user.
 * Contains user ID, person ID, and roles for authorization.
 * 
 * @param {Object} payload - Token payload
 * @param {number} payload.userId - The user's ID from tblUser
 * @param {number} payload.personId - The user's person ID from tblPerson
 * @param {string[]} payload.roles - Array of role names from tblSecurityRole
 * @returns {string} Signed JWT access token
 */
function generateAccessToken(payload) {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

/**
 * Generate a refresh token for token renewal.
 * Contains only the user ID for minimal exposure.
 * 
 * @param {number} userId - The user's ID from tblUser
 * @returns {string} Signed JWT refresh token
 */
function generateRefreshToken(userId) {
    return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

/**
 * Verify and decode an access token.
 * 
 * @param {string} token - The JWT access token to verify
 * @returns {Object} Decoded payload { userId, personId, roles }
 * @throws {jwt.JsonWebTokenError} If token is invalid
 * @throws {jwt.TokenExpiredError} If token has expired
 */
function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_SECRET);
}

/**
 * Verify and decode a refresh token.
 * 
 * @param {string} token - The JWT refresh token to verify
 * @returns {Object} Decoded payload { userId }
 * @throws {jwt.JsonWebTokenError} If token is invalid
 * @throws {jwt.TokenExpiredError} If token has expired
 */
function verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_SECRET);
}

/**
 * Generate a temporary MFA token (short-lived, used between login and MFA verification).
 * 
 * @param {number} userId - The user's ID
 * @returns {string} Signed JWT valid for 5 minutes
 */
function generateMfaToken(userId) {
    return jwt.sign({ userId, mfaPending: true }, ACCESS_SECRET, { expiresIn: '5m' });
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateMfaToken,
};
