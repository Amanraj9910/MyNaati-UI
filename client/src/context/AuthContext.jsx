/**
 * =============================================================================
 * MyNaati Frontend — Authentication Context Provider
 * =============================================================================
 * 
 * Global auth state management using React Context.
 * Provides login/logout/register functions and user state to all components.
 * Persists auth tokens and user data in localStorage for session continuity.
 * 
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/auth.service';
import toast from 'react-hot-toast';

/** Auth context — stores user state and auth functions */
const AuthContext = createContext(null);

/**
 * AuthProvider component — wraps the app to provide auth state globally.
 * On mount, checks localStorage for existing session and validates it.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Initialize auth state from localStorage on app load.
     * Validates the stored token by calling /api/auth/me.
     */
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    // Validate the stored token by fetching current user
                    const response = await authService.getCurrentUser();
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch (error) {
                    // Token is invalid or expired — clear stored data
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    /**
     * Log in a user with username and password.
     * Stores tokens in localStorage and updates the user state.
     * 
     * @param {string} username
     * @param {string} password
     * @returns {Promise<Object>} The logged-in user data
     */
    const login = useCallback(async (username, password) => {
        const response = await authService.login(username, password);
        const { accessToken, refreshToken, user: userData } = response.data;

        // Persist tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        return userData;
    }, []);

    /**
     * Register a new user account.
     * Does NOT auto-login — user must log in after registration.
     * 
     * @param {Object} userData - Registration form data
     * @returns {Promise<Object>} Registration result
     */
    const register = useCallback(async (userData) => {
        const response = await authService.register(userData);
        return response;
    }, []);

    /**
     * Log out the current user.
     * Clears all stored tokens and user data.
     */
    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
    }, []);

    /** Whether the user is currently authenticated */
    const isAuthenticated = !!user;

    /**
     * Check if the user has a specific role.
     * Used for conditional rendering of admin-only UI.
     * 
     * @param {string} role - Role name to check (e.g., 'Admin')
     * @returns {boolean} True if user has the role
     */
    const hasRole = useCallback((role) => {
        return user?.roles?.includes(role) || false;
    }, [user]);

    // Context value provided to all children
    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to access auth context.
 * Must be used within an AuthProvider.
 * 
 * @returns {{ user, loading, login, register, logout, isAuthenticated, hasRole }}
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
