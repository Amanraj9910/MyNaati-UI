/**
 * =============================================================================
 * MyNaati Frontend — Auth Service
 * =============================================================================
 * 
 * API functions for authentication endpoints.
 * Each function maps to a backend auth route.
 * Returns the response data (unwrapped from Axios).
 */

import api from './api';

/**
 * Login with username and password.
 * POST /api/auth/login
 * 
 * @param {string} username - The login username
 * @param {string} password - The user's password
 * @returns {Promise<Object>} { accessToken, refreshToken, user }
 */
export const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    return data;
};

/**
 * Register a new user account.
 * POST /api/auth/register
 * 
 * @param {Object} userData - Registration form data
 * @returns {Promise<Object>} Created user info
 */
export const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
};

/**
 * Get the current authenticated user's profile.
 * GET /api/auth/me
 * 
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
    const { data } = await api.get('/auth/me');
    return data;
};

/**
 * Request a password reset email.
 * POST /api/auth/forgot-password
 * 
 * @param {string} email - The user's email address
 * @returns {Promise<Object>} Success message
 */
export const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
};

/**
 * Reset password using a valid token.
 * POST /api/auth/reset-password
 * 
 * @param {string} token - The reset token from the email link
 * @param {string} newPassword - The new password
 * @param {string} confirmNewPassword - Password confirmation
 * @returns {Promise<Object>} Success message
 */
export const resetPassword = async (token, newPassword, confirmNewPassword) => {
    const { data } = await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmNewPassword,
    });
    return data;
};

/**
 * Change the current user's password.
 * POST /api/auth/change-password
 * 
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @param {string} confirmNewPassword - Password confirmation
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
    const { data } = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
    });
    return data;
};

/**
 * Refresh the access token.
 * POST /api/auth/refresh-token
 * 
 * @param {string} refreshToken - The stored refresh token
 * @returns {Promise<Object>} New access token
 */
export const refreshAccessToken = async (refreshToken) => {
    const { data } = await api.post('/auth/refresh-token', { refreshToken });
    return data;
};
