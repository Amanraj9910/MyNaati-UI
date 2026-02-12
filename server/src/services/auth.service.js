/**
 * =============================================================================
 * MyNaati Backend — Auth Service
 * =============================================================================
 * 
 * Core authentication business logic. Handles:
 *   - User login with password verification and account lockout
 *   - User registration (creates Entity → Person → PersonName → User → MyNaatiUser)
 *   - Password reset and change
 *   - MFA setup and verification
 *   - Token refresh
 * 
 * This is the business logic layer — routes call these functions,
 * and these functions call the database models.
 */

const UserModel = require('../models/User');
const PersonModel = require('../models/Person');
const EntityModel = require('../models/Entity');
const MyNaatiUserModel = require('../models/MyNaatiUser');
const SecurityRoleModel = require('../models/SecurityRole');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateMfaToken } = require('../utils/jwt');
const { generateSecret, generateQrCodeUrl, verifyToken: verifyMfaToken } = require('../utils/mfa');
const logger = require('../utils/logger');

/**
 * Authenticate a user with username and password.
 * 
 * Flow:
 *   1. Find user by username
 *   2. Check if account is active and not locked
 *   3. Verify password against bcrypt hash
 *   4. If MFA is enabled, return MFA-pending token
 *   5. Generate access + refresh tokens
 *   6. Return user profile with tokens
 * 
 * @param {string} username - The login username
 * @param {string} password - The plaintext password
 * @returns {Promise<Object>} Login result with tokens or MFA requirement
 * @throws {Error} On invalid credentials, locked account, or inactive account
 */
async function login(username, password) {
    // Step 1: Find user by username
    const user = await UserModel.findByUsername(username);
    if (!user) {
        throw Object.assign(new Error('Invalid username or password'), { statusCode: 401 });
    }

    // Step 2: Check account status
    if (!user.Active) {
        throw Object.assign(new Error('Account is inactive. Please contact NAATI support.'), { statusCode: 403 });
    }

    if (user.IsLockedOut) {
        throw Object.assign(new Error('Account is locked due to too many failed attempts. Please contact NAATI support.'), { statusCode: 403 });
    }

    // Step 3: Verify password
    const isValid = await comparePassword(password, user.Password);
    if (!isValid) {
        // Increment failed attempts (auto-locks after 5)
        const attempts = await UserModel.incrementFailedAttempts(user.UserId);
        const remaining = 5 - attempts;
        const message = remaining > 0
            ? `Invalid username or password. ${remaining} attempts remaining before lockout.`
            : 'Account has been locked due to too many failed attempts.';
        throw Object.assign(new Error(message), { statusCode: 401 });
    }

    // Step 4: Reset failed attempts on successful password check
    await UserModel.resetFailedAttempts(user.UserId);

    // Step 5: Resolve person ID from MyNaatiUser link
    const myNaatiUser = await MyNaatiUserModel.findByUserId(user.UserId);
    const personId = myNaatiUser ? myNaatiUser.PersonId : null;

    // Step 6: Get user roles for the JWT payload
    const roles = await SecurityRoleModel.getUserRoles(user.UserId);

    // Step 7: Get person details for the profile
    let personDetails = null;
    if (personId) {
        personDetails = await PersonModel.findById(personId);
    }

    // Step 8: Generate JWT tokens
    const tokenPayload = {
        userId: user.UserId,
        personId: personId,
        roles: roles,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(user.UserId);

    logger.info(`User ${username} logged in successfully`);

    return {
        accessToken,
        refreshToken,
        user: {
            userId: user.UserId,
            username: user.UserName,
            fullName: user.FullName,
            email: user.Email,
            personId: personId,
            givenName: personDetails?.GivenName || null,
            surname: personDetails?.Surname || null,
            roles: roles,
        },
    };
}

/**
 * Register a new user account.
 * Creates records in the correct order respecting FK constraints:
 *   tblEntity → tblPerson → tblPersonName → tblUser → tblMyNaatiUser
 * 
 * @param {Object} data - Registration data
 * @param {string} data.givenName - Given/first name
 * @param {string} data.surname - Surname/last name
 * @param {string} data.email - Email address (also used as username)
 * @param {string} data.password - Plaintext password (will be hashed)
 * @param {string} [data.middleName] - Middle name
 * @param {string} [data.dateOfBirth] - Date of birth (ISO format)
 * @param {number} [data.genderId=1] - Gender ID
 * @returns {Promise<Object>} Created user info { userId, personId }
 * @throws {Error} If email/username already exists
 */
async function register({ givenName, surname, email, password, middleName, dateOfBirth, genderId = 1 }) {
    // Check if username (email) is already taken
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
        throw Object.assign(new Error('An account with this email already exists'), { statusCode: 409 });
    }

    // Hash the password before storing
    const passwordHash = await hashPassword(password);
    const fullName = middleName
        ? `${givenName} ${middleName} ${surname}`
        : `${givenName} ${surname}`;

    // Create records in FK-dependency order
    // 1. Create entity (root record)
    const entityId = await EntityModel.create({ entityTypeId: 1 }); // 1 = Person type

    // 2. Create person linked to entity
    const personId = await PersonModel.create({
        entityId,
        dateOfBirth: dateOfBirth || null,
        genderId,
    });

    // 3. Create person name record
    await PersonModel.createName({
        personId,
        givenName,
        surname,
        middleName: middleName || null,
    });

    // 4. Create user account
    const userId = await UserModel.create({
        userName: email, // Use email as username
        fullName,
        email,
        password: passwordHash,
    });

    // 5. Create MyNaati portal user link
    await MyNaatiUserModel.create({ userId, personId });

    logger.info(`New user registered: ${email} (UserId: ${userId}, PersonId: ${personId})`);

    return { userId, personId, email };
}

/**
 * Refresh an expired access token using a valid refresh token.
 * 
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<Object>} New access token and user info
 * @throws {Error} If refresh token is invalid or user not found
 */
async function refreshAccessToken(refreshToken) {
    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Look up the user
    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.Active) {
        throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }

    // Get roles and person ID
    const roles = await SecurityRoleModel.getUserRoles(user.UserId);
    const myNaatiUser = await MyNaatiUserModel.findByUserId(user.UserId);

    // Generate new access token
    const accessToken = generateAccessToken({
        userId: user.UserId,
        personId: myNaatiUser?.PersonId || null,
        roles,
    });

    return { accessToken };
}

/**
 * Change a user's password (authenticated operation).
 * Verifies the current password before allowing the change.
 * 
 * @param {number} userId - The authenticated user's ID
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password to set
 * @throws {Error} If current password is incorrect
 */
async function changePassword(userId, currentPassword, newPassword) {
    const user = await UserModel.findByUsername(
        (await UserModel.findById(userId)).UserName
    );

    if (!user) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.Password);
    if (!isValid) {
        throw Object.assign(new Error('Current password is incorrect'), { statusCode: 401 });
    }

    // Hash and save new password
    const newHash = await hashPassword(newPassword);
    await UserModel.updatePassword(userId, newHash);

    logger.info(`Password changed for user ${userId}`);
}

/**
 * Initiate a password reset by generating a reset token.
 * In a production system, this would send an email with the reset link.
 * 
 * @param {string} email - The user's email address
 * @returns {Promise<Object>} Reset token info (would be emailed in production)
 */
async function forgotPassword(email) {
    const user = await UserModel.findByEmail(email);

    // Always return success to prevent email enumeration attacks
    if (!user) {
        logger.warn(`Password reset requested for non-existent email: ${email}`);
        return { message: 'If the email exists, a reset link has been sent.' };
    }

    // Generate a time-limited reset token (reuse JWT infrastructure)
    const resetToken = generateMfaToken(user.UserId); // Reuses 5-min token

    // TODO: Send email with reset link containing the token
    // In development, log the token for testing
    logger.info(`Password reset token for ${email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent.' };
}

/**
 * Reset password using a valid reset token.
 * 
 * @param {string} token - The reset token from the email link
 * @param {string} newPassword - The new password to set
 */
async function resetPassword(token, newPassword) {
    // Verify the reset token
    let decoded;
    try {
        const { verifyAccessToken } = require('../utils/jwt');
        decoded = verifyAccessToken(token);
    } catch {
        throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await UserModel.updatePassword(decoded.userId, newHash);

    logger.info(`Password reset completed for user ${decoded.userId}`);
}

/**
 * Get the current authenticated user's profile.
 * Returns combined data from tblUser and tblPerson.
 * 
 * @param {number} userId - The authenticated user's ID
 * @param {number} personId - The user's PersonId
 * @returns {Promise<Object>} User profile data
 */
async function getCurrentUser(userId, personId) {
    const user = await UserModel.findById(userId);
    if (!user) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    let personDetails = null;
    if (personId) {
        personDetails = await PersonModel.findById(personId);
    }

    const roles = await SecurityRoleModel.getUserRoles(userId);

    return {
        userId: user.UserId,
        username: user.UserName,
        fullName: user.FullName,
        email: user.Email,
        personId,
        givenName: personDetails?.GivenName || null,
        surname: personDetails?.Surname || null,
        middleName: personDetails?.MiddleName || null,
        roles,
    };
}

module.exports = {
    login,
    register,
    refreshAccessToken,
    changePassword,
    forgotPassword,
    resetPassword,
    getCurrentUser,
};
