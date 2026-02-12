/**
 * =============================================================================
 * MyNaati Backend — JWT Authentication Middleware
 * =============================================================================
 * 
 * Verifies JWT access tokens from the Authorization header.
 * Attaches the decoded user info (userId, personId, roles) to req.user.
 * 
 * Usage in routes:
 *   router.get('/protected', authenticate, (req, res) => {
 *     console.log(req.user.userId); // Available after auth
 *   });
 */

const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Express middleware that validates the JWT access token.
 * 
 * Expects the token in the Authorization header:
 *   Authorization: Bearer <token>
 * 
 * On success: attaches decoded payload to req.user and calls next()
 * On failure: returns 401 Unauthorized response
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticate(req, res, next) {
    try {
        // Extract token from "Bearer <token>" header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token and extract payload
        const decoded = verifyAccessToken(token);

        // Check if this is an MFA-pending token (shouldn't be used for normal auth)
        if (decoded.mfaPending) {
            return res.status(401).json({
                success: false,
                message: 'MFA verification required. Please complete MFA.',
            });
        }

        // Attach user info to request object for downstream handlers
        req.user = {
            userId: decoded.userId,
            personId: decoded.personId,
            roles: decoded.roles || [],
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please refresh your token.',
                code: 'TOKEN_EXPIRED',
            });
        }

        logger.warn('Invalid token attempt:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid token.',
        });
    }
}

module.exports = { authenticate };
