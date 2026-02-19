/**
 * =============================================================================
 * MyNaati Backend — Auth Routes
 * =============================================================================
 * 
 * API route definitions for Module 2: Account & Authentication.
 * 
 * Routes:
 *   POST   /api/auth/login             - Authenticate user (public)
 *   POST   /api/auth/register          - Create new account (public)
 *   POST   /api/auth/refresh-token     - Refresh access token (public)
 *   POST   /api/auth/forgot-password   - Request password reset (public)
 *   POST   /api/auth/reset-password    - Reset password with token (public)
 *   POST   /api/auth/change-password   - Change password (authenticated)
 *   GET    /api/auth/me                - Get current user profile (authenticated)
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { authenticate } = require('../middleware/auth');
const { authRateLimiter, passwordResetRateLimiter } = require('../middleware/rateLimiter');
const {
    validate,
    loginValidation,
    registerValidation,
    changePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
} = require('../middleware/validator');
const logger = require('../utils/logger');

/**
 * POST /api/auth/login
 * Authenticate a user with username and password.
 * Rate-limited to prevent brute force attacks.
 * Returns JWT access & refresh tokens on success.
 */
router.post('/login', authRateLimiter, loginValidation, validate, async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);

        res.json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/register
 * Create a new user account.
 * Creates Entity → Person → PersonName → User → MyNaatiUser chain.
 * Rate-limited to prevent spam registrations.
 */
router.post('/register', authRateLimiter, registerValidation, validate, async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please log in.',
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/refresh-token
 * Get a new access token using a valid refresh token.
 * Called when the frontend detects an expired access token (401 response).
 */
router.post('/refresh-token', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
        }

        const result = await authService.refreshAccessToken(refreshToken);

        res.json({
            success: true,
            message: 'Token refreshed',
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/forgot-password
 * Initiate password reset by sending a reset email.
 * Always returns success to prevent email enumeration.
 * Rate-limited more strictly (5 per hour).
 */
router.post('/forgot-password', passwordResetRateLimiter, forgotPasswordValidation, validate, async (req, res, next) => {
    try {
        const result = await authService.forgotPassword(req.body.email);

        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/reset-password
 * Reset password using a valid reset token from the email link.
 * The token is short-lived (5 minutes).
 */
router.post('/reset-password', passwordResetRateLimiter, resetPasswordValidation, validate, async (req, res, next) => {
    try {
        await authService.resetPassword(req.body.token, req.body.newPassword);

        res.json({
            success: true,
            message: 'Password reset successful. Please log in with your new password.',
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/change-password
 * Change password for the currently authenticated user.
 * Requires the current password for verification.
 */
router.post('/change-password', authenticate, changePasswordValidation, validate, async (req, res, next) => {
    try {
        await authService.changePassword(
            req.user.userId,
            req.body.currentPassword,
            req.body.newPassword
        );

        res.json({
            success: true,
            message: 'Password changed successfully.',
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Get the current authenticated user's profile.
 * Returns user info, person details, and roles.
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user.userId, req.user.personId);

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/mfa/setup
 * Start MFA setup -> Generate secret & QR code.
 */
router.post('/mfa/setup', authenticate, async (req, res, next) => {
    try {
        const result = await authService.setupMfa(req.user.userId);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/mfa/enable
 * Finalize MFA setup -> Verify code & activate.
 */
router.post('/mfa/enable', authenticate, async (req, res, next) => {
    try {
        const result = await authService.enableMfa(req.user.userId, req.body.code);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/mfa/disable
 * Disable MFA for the user.
 */
router.post('/mfa/disable', authenticate, async (req, res, next) => {
    try {
        const result = await authService.disableMfa(req.user.userId);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/mfa/verify
 * Complete login by verifying MFA code.
 * Requires the tempToken received from the login step.
 */
router.post('/mfa/verify', async (req, res, next) => {
    try {
        const { tempToken, code } = req.body;
        const result = await authService.verifyMfaLogin(tempToken, code);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
