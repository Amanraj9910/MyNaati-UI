/**
 * =============================================================================
 * MyNaati Backend — User Admin Routes
 * =============================================================================
 * 
 * API route definitions for admin user management functions.
 * All endpoints require authentication + Admin role.
 * 
 * Routes:
 *   GET    /api/users/search      - Search users by name/email (admin)
 *   GET    /api/users/:id         - Get user details (admin)
 *   POST   /api/users/:id/unlock  - Unlock a locked user account (admin)
 */

const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { userSearchValidation, validate } = require('../middleware/validator');

/**
 * GET /api/users/search
 * Search for users by username, full name, or email.
 * Supports pagination with page and limit query parameters.
 * Admin-only endpoint.
 * 
 * Query params:
 *   - q: Search query string
 *   - page: Page number (default 1)
 *   - limit: Results per page (default 20, max 100)
 */
router.get('/search', authenticate, requireRole('Admin', 'SystemAdmin'), userSearchValidation, validate, async (req, res, next) => {
    try {
        const { q: searchQuery = '', page = 1, limit = 20 } = req.query;

        const result = await userService.searchUsers({
            searchQuery,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
        });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/users/:id
 * Get a specific user's details by ID.
 * Admin-only endpoint.
 */
router.get('/:id', authenticate, requireRole('Admin', 'SystemAdmin'), async (req, res, next) => {
    try {
        const user = await userService.getUserById(parseInt(req.params.id, 10));

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/users/:id/unlock
 * Unlock a user account that has been locked due to failed login attempts.
 * Resets the failed attempt counter and removes the lockout.
 * Admin-only endpoint.
 */
router.post('/:id/unlock', authenticate, requireRole('Admin', 'SystemAdmin'), async (req, res, next) => {
    try {
        await userService.unlockUserAccount(parseInt(req.params.id, 10));

        res.json({
            success: true,
            message: 'User account unlocked successfully.',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
