/**
 * =============================================================================
 * MyNaati Backend — Route Index
 * =============================================================================
 * 
 * Central router that mounts all API route modules under their prefixes.
 * This file is imported by app.js and mounted under /api.
 * 
 * API Structure:
 *   /api/auth/*      → Authentication & Account routes
 *   /api/home/*      → Home / Dashboard routes
 *   /api/users/*     → User management routes (admin)
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const homeRoutes = require('./home.routes');
const userRoutes = require('./user.routes');

// Mount routes
router.use('/auth', authRoutes);     // /api/auth/login, /api/auth/register, etc.
router.use('/home', homeRoutes);     // /api/home/dashboard, /api/home/about, etc.
router.use('/users', userRoutes);    // /api/users/search, /api/users/:id, etc.

module.exports = router;
