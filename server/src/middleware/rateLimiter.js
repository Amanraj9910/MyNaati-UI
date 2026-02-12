/**
 * =============================================================================
 * MyNaati Backend — Rate Limiter Middleware
 * =============================================================================
 * 
 * Applies rate limiting to authentication endpoints to prevent brute-force
 * attacks on login, registration, and password reset routes.
 * 
 * Uses express-rate-limit with in-memory store (suitable for single-instance).
 * For multi-instance deployments, switch to a Redis-based store.
 */

const rateLimit = require('express-rate-limit');

/**
 * Auth rate limiter — limits login/register attempts.
 * 
 * Configuration:
 *   - 15-minute window
 *   - Max 15 requests per IP per window
 *   - Returns 429 Too Many Requests on exceed
 */
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 15,                     // Max 15 requests per window per IP
    standardHeaders: true,       // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,        // Disable legacy `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests. Please try again after 15 minutes.',
    },
});

/**
 * Password reset rate limiter — stricter limits for sensitive operations.
 * 
 * Configuration:
 *   - 1-hour window
 *   - Max 5 requests per IP per window
 */
const passwordResetRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 5,                     // Max 5 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset attempts. Please try again in an hour.',
    },
});

module.exports = { authRateLimiter, passwordResetRateLimiter };
