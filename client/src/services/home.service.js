/**
 * =============================================================================
 * MyNaati Frontend — Home Service
 * =============================================================================
 * 
 * API functions for Home/Dashboard endpoints.
 * Maps to the backend /api/home/* routes.
 */

import api from './api';

/**
 * Get personalized dashboard data (greeting, quick actions).
 * GET /api/home/dashboard
 * Requires authentication.
 * 
 * @returns {Promise<Object>} Dashboard data
 */
export const getDashboard = async () => {
    const { data } = await api.get('/home/dashboard');
    return data;
};

/**
 * Get the About NAATI page content.
 * GET /api/home/about
 * Public endpoint.
 * 
 * @returns {Promise<Object>} About content
 */
export const getAboutContent = async () => {
    const { data } = await api.get('/home/about');
    return data;
};

/**
 * Get the Learn More page content.
 * GET /api/home/learn-more
 * Public endpoint.
 * 
 * @returns {Promise<Object>} Learn more content
 */
export const getLearnMoreContent = async () => {
    const { data } = await api.get('/home/learn-more');
    return data;
};

/**
 * Get system diagnostics data (admin only).
 * GET /api/home/diagnostics
 * Requires Admin role.
 * 
 * @returns {Promise<Object>} Diagnostics data
 */
export const getDiagnostics = async () => {
    const { data } = await api.get('/home/diagnostics');
    return data;
};

/**
 * Get all system configuration values (admin only).
 * GET /api/home/system-values
 * Requires Admin role.
 * 
 * @returns {Promise<Object>} System values array
 */
export const getSystemValues = async () => {
    const { data } = await api.get('/home/system-values');
    return data;
};
