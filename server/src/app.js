/**
 * =============================================================================
 * MyNaati Backend — Express Application Setup
 * =============================================================================
 * 
 * Configures Express with all middleware (CORS, Helmet, Morgan, JSON parsing)
 * and mounts all API route handlers under their respective prefixes.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------

/** Helmet — sets various HTTP security headers */
app.use(helmet());

/** CORS — allow requests from the React dev server and production origins */
app.use(cors({
    origin: [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:3000',  // Alternate dev port
    ],
    credentials: true,  // Allow cookies for refresh tokens
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ---------------------------------------------------------------------------
// Body Parsing Middleware
// ---------------------------------------------------------------------------

/** Parse incoming JSON request bodies (limit 10MB for file metadata) */
app.use(express.json({ limit: '10mb' }));

/** Parse URL-encoded form data */
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Logging Middleware
// ---------------------------------------------------------------------------

/** Morgan HTTP request logger — 'dev' format for development */
app.use(morgan('dev'));

// ---------------------------------------------------------------------------
// Health Check Endpoint
// ---------------------------------------------------------------------------

/**
 * GET /api/health
 * Simple health check endpoint to verify the API is running.
 * No authentication required.
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'MyNaati API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

/** Mount all API routes under /api prefix */
app.use('/api', routes);

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------

/** Handle 404 — route not found */
app.use(notFoundHandler);

/** Global error handler — catches all unhandled errors */
app.use(errorHandler);

module.exports = app;
