/**
 * =============================================================================
 * MyNaati Frontend — Dashboard Service
 * =============================================================================
 * 
 * API calls for the candidate dashboard endpoints.
 * Maps to backend /api/dashboard/* routes.
 */

import api from './api';

/** GET /api/dashboard/summary — Dashboard summary with counts */
export const getDashboardSummary = async () => {
    const { data } = await api.get('/dashboard/summary');
    return data;
};

/** GET /api/dashboard/credentials — User's credentials list */
export const getCredentials = async () => {
    const { data } = await api.get('/dashboard/credentials');
    return data;
};

/** GET /api/dashboard/tests — User's test sittings */
export const getTests = async () => {
    const { data } = await api.get('/dashboard/tests');
    return data;
};

/** GET /api/dashboard/invoices — User's invoices */
export const getInvoices = async () => {
    const { data } = await api.get('/dashboard/invoices');
    return data;
};

/** GET /api/dashboard/applications — User's credential applications */
export const getApplications = async () => {
    const { data } = await api.get('/dashboard/applications');
    return data;
};

/** GET /api/dashboard/logbook — User's PD activities */
export const getLogbook = async () => {
    const { data } = await api.get('/dashboard/logbook');
    return data;
};

/** GET /api/dashboard/profile — User's profile data */
export const getProfile = async () => {
    const response = await api.get('/dashboard/profile');
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.put('/dashboard/profile', data);
    return response.data;
};

export const getPDCategories = async () => {
    const response = await api.get('/dashboard/logbook/categories');
    return response.data;
};

export const addLogbookEntry = async (data) => {
    const response = await api.post('/dashboard/logbook', data);
    return response.data;
};

export const createApplication = async (typeId) => {
    const response = await api.post('/dashboard/applications', { typeId });
    return response.data;
};

/** GET /api/dashboard/test-results — User's test results */
export const getTestResults = async () => {
    const { data } = await api.get('/dashboard/test-results');
    return data;
};

/** GET /api/dashboard/test-results/:id — Single test result with components */
export const getTestResultDetails = async (id) => {
    const { data } = await api.get(`/dashboard/test-results/${id}`);
    return data;
};
