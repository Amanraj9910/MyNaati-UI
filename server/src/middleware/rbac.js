/**
 * =============================================================================
 * MyNaati Backend — Role-Based Access Control (RBAC) Middleware
 * =============================================================================
 * 
 * Restricts route access to users with specific roles.
 * Must be used AFTER the authenticate middleware (req.user must be set).
 * 
 * Roles are loaded from tblSecurityRole via tblUserRole.
 * 
 * Usage:
 *   router.get('/admin/users', authenticate, requireRole('Admin'), handler);
 *   router.get('/reports', authenticate, requireRole('Admin', 'Manager'), handler);
 */

const logger = require('../utils/logger');

/**
 * Creates middleware that checks if the authenticated user has at least
 * one of the required roles.
 * 
 * @param {...string} allowedRoles - One or more role names that grant access
 * @returns {Function} Express middleware function
 * 
 * @example
 *   // Single role
 *   requireRole('Admin')
 * 
 *   // Multiple roles (user needs at least one)
 *   requireRole('Admin', 'SystemAdmin')
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        // Ensure authenticate middleware has run first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
        }

        const userRoles = req.user.roles || [];

        // Check if user has at least one of the allowed roles
        const hasRole = allowedRoles.some((role) =>
            userRoles.includes(role)
        );

        if (!hasRole) {
            logger.warn(
                `Access denied: User ${req.user.userId} attempted to access ` +
                `route requiring roles [${allowedRoles.join(', ')}] but has [${userRoles.join(', ')}]`
            );
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
            });
        }

        next();
    };
}

module.exports = { requireRole };
