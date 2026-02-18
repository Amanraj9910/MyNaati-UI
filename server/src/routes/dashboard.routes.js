/**
 * =============================================================================
 * MyNaati Backend — Dashboard Routes
 * =============================================================================
 * 
 * API endpoints for the candidate dashboard.
 * All routes require authentication.
 * 
 * Routes:
 *   GET /api/dashboard/summary      — Dashboard summary stats
 *   GET /api/dashboard/credentials  — User's credentials list
 *   GET /api/dashboard/tests        — User's test sittings
 *   GET /api/dashboard/invoices     — User's invoices
 *   GET /api/dashboard/applications — User's credential applications
 *   GET /api/dashboard/logbook      — User's PD activities
 *   GET /api/dashboard/profile      — User's profile data
 */

const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboard.service');
const { authenticate } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(authenticate);

router.get('/summary', async (req, res, next) => {
    try {
        const data = await dashboardService.getDashboardSummary(req.user.userId);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

router.get('/credentials', async (req, res, next) => {
    try {
        const data = await dashboardService.getCredentials(req.user.userId);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

router.get('/tests', async (req, res, next) => {
    try {
        const data = await dashboardService.getTests(req.user.userId);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

router.get('/invoices', async (req, res, next) => {
    try {
        const data = await dashboardService.getInvoices(req.user.userId);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

router.get('/applications', async (req, res, next) => {
    try {
        const data = await dashboardService.getApplications(req.user.userId);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

router.get('/logbook', async (req, res, next) => {
    try {
        const data = await dashboardService.getLogbook(req.user.userId);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

router.get('/logbook/categories', async (req, res, next) => {
    try {
        const data = await dashboardService.getPDCategories();
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

router.post('/logbook', async (req, res, next) => {
    try {
        const data = await dashboardService.addLogbookEntry(req.user.userId, req.body);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

router.post('/applications', async (req, res, next) => {
    try {
        const data = await dashboardService.createApplication(req.user.userId, req.body.typeId);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

router.get('/profile', async (req, res, next) => {
    try {
        const data = await dashboardService.getProfile(req.user.userId);
    } catch (error) { next(error); }
});

router.put('/profile', async (req, res, next) => {
    try {
        const data = await dashboardService.updateProfile(req.user.userId, req.body);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

module.exports = router;
