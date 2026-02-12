/**
 * =============================================================================
 * MyNaati Frontend — Protected Route Guard
 * =============================================================================
 * 
 * Route wrapper that restricts access to authenticated users.
 * Optionally restricts to specific roles (e.g., Admin-only pages).
 * Redirects unauthenticated users to /login.
 * 
 * Usage:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 *   <Route path="/admin" element={<ProtectedRoute roles={['Admin']}><AdminPage /></ProtectedRoute>} />
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component — guards routes requiring authentication.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected page component
 * @param {string[]} [props.roles] - Optional required roles for access
 * @returns {React.ReactNode} The children if authorized, or a redirect
 */
function ProtectedRoute({ children, roles = [] }) {
    const { isAuthenticated, loading, user, hasRole } = useAuth();
    const location = useLocation();

    // Show loading spinner while auth state is being determined
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated (preserve intended destination)
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role requirements if specified
    if (roles.length > 0 && !roles.some((role) => hasRole(role))) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}

export default ProtectedRoute;
