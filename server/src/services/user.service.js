/**
 * =============================================================================
 * MyNaati Backend — User Service
 * =============================================================================
 * 
 * Business logic for user management (admin functions).
 * Handles user search, registration management, and account administration.
 * 
 * Used by the admin routes for user management functionality.
 */

const UserModel = require('../models/User');
const logger = require('../utils/logger');

/**
 * Search for users (admin function).
 * Searches by username, full name, or email with pagination.
 * 
 * @param {Object} options
 * @param {string} [options.searchQuery] - Search term
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Results per page
 * @returns {Promise<Object>} { users, total, page, limit, totalPages }
 */
async function searchUsers({ searchQuery = '', page = 1, limit = 20 }) {
    const result = await UserModel.search({ searchQuery, page, limit });

    return {
        users: result.users,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
    };
}

/**
 * Get a single user's details by ID (admin function).
 * 
 * @param {number} userId - The UserId to look up
 * @returns {Promise<Object>} User details
 * @throws {Error} If user not found
 */
async function getUserById(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return user;
}

/**
 * Unlock a locked user account (admin function).
 * Resets failed attempt counter and removes lockout.
 * 
 * @param {number} userId - The UserId to unlock
 */
async function unlockUserAccount(userId) {
    await UserModel.unlockUser(userId);
    logger.info(`Admin unlocked user account: ${userId}`);
}

module.exports = {
    searchUsers,
    getUserById,
    unlockUserAccount,
};
