/**
 * =============================================================================
 * MyNaati Backend — Home Routes
 * =============================================================================
 * 
 * API route definitions for Module 1: Home / Dashboard.
 * 
 * Routes:
 *   GET  /api/home/dashboard        - Personalized dashboard data (authenticated)
 *   GET  /api/home/about            - About NAATI content (public)
 *   GET  /api/home/learn-more       - Learn More content (public)
 *   GET  /api/home/diagnostics      - System diagnostics (admin only)
 *   GET  /api/home/system-values    - System configuration values (admin only)
 */

const express = require('express');
const router = express.Router();
const homeService = require('../services/home.service');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

/**
 * GET /api/home/dashboard
 * Get personalized dashboard data for the logged-in user.
 * Includes welcome greeting (using person's name), quick actions, etc.
 * Requires authentication.
 */
router.get('/dashboard', authenticate, async (req, res, next) => {
    try {
        const data = await homeService.getDashboardData(req.user.personId);

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/home/about
 * Get the "About NAATI" page content.
 * Public endpoint — no authentication required.
 */
router.get('/about', (req, res) => {
    const data = homeService.getAboutContent();

    res.json({
        success: true,
        data,
    });
});

/**
 * GET /api/home/learn-more
 * Get the "Learn More" page content.
 * Public endpoint — no authentication required.
 */
router.get('/learn-more', (req, res) => {
    const data = homeService.getLearnMoreContent();

    res.json({
        success: true,
        data,
    });
});

/**
 * GET /api/home/diagnostics
 * Get system diagnostics (DB status, server uptime, memory usage).
 * Admin-only endpoint — requires authentication and Admin role.
 */
router.get('/diagnostics', authenticate, requireRole('Admin', 'SystemAdmin'), async (req, res, next) => {
    try {
        const data = await homeService.getDiagnostics();

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/home/system-values
 * Get all system configuration values from tblSystemValue.
 * Admin-only endpoint for viewing/managing system settings.
 */
router.get('/system-values', authenticate, requireRole('Admin', 'SystemAdmin'), async (req, res, next) => {
    try {
        const data = await homeService.getSystemValues();

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
