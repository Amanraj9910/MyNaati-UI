/**
 * =============================================================================
 * MyNaati Frontend — Axios API Client
 * =============================================================================
 * 
 * Centralized HTTP client using Axios. All API calls go through this instance.
 * Automatically:
 *   - Attaches JWT access token to every request (Authorization header)
 *   - Handles 401 errors by attempting token refresh
 *   - Provides clean error handling
 * 
 * Usage:
 *   import api from '../services/api';
 *   const { data } = await api.get('/home/dashboard');
 */

import axios from 'axios';

/** Base API URL from environment variable (points to Node.js backend) */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/** Create a configured Axios instance for all API requests */
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
});

/**
 * Request interceptor — attaches JWT access token to every outgoing request.
 * Reads the token from localStorage where AuthContext stores it.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor — handles token expiration gracefully.
 * On 401 (TOKEN_EXPIRED):
 *   1. Attempt to refresh the token using the stored refresh token
 *   2. Retry the original request with the new token
 *   3. If refresh fails, redirect to login
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If we get a 401 and haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Call the refresh endpoint
                const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                    refreshToken,
                });

                const { accessToken } = response.data.data;

                // Store the new access token
                localStorage.setItem('accessToken', accessToken);

                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed — clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
