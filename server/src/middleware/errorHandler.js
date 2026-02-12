/**
 * =============================================================================
 * MyNaati Backend — Global Error Handler Middleware
 * =============================================================================
 * 
 * Provides centralized error handling for the entire Express application.
 * Catches all unhandled errors and returns a consistent JSON error response.
 * Also includes a 404 handler for undefined routes.
 */

const logger = require('../utils/logger');

/**
 * 404 Not Found handler.
 * Catches requests to routes that don't exist and forwards a 404 error.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function notFoundHandler(req, res, next) {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}

/**
 * Global error handler middleware.
 * Must have 4 parameters (err, req, res, next) for Express to recognize it.
 * 
 * In development: returns full error message and stack trace.
 * In production: returns generic message for 500 errors (security).
 * 
 * @param {Error} err - The error object
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const isDev = process.env.NODE_ENV !== 'production';

    // Log the error (always log 500s as errors, others as warnings)
    if (statusCode >= 500) {
        logger.error(`[${statusCode}] ${err.message}`, { stack: err.stack });
    } else {
        logger.warn(`[${statusCode}] ${err.message}`);
    }

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 && !isDev
            ? 'Internal server error'
            : err.message,
        // Include stack trace only in development
        ...(isDev && { stack: err.stack }),
    });
}

module.exports = { notFoundHandler, errorHandler };
