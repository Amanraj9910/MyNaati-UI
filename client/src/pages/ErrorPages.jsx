/**
 * =============================================================================
 * MyNaati Frontend — Error Pages (404, 403, 500)
 * =============================================================================
 * 
 * Reusable error page components for various HTTP error states.
 * Displayed when routes are not found, access is denied, or server errors occur.
 */

import { Link } from 'react-router-dom';
import { Home, AlertTriangle, ShieldOff, ServerOff } from 'lucide-react';

/**
 * NotFoundPage — displayed when a route doesn't match any defined paths.
 */
export function NotFoundPage() {
    return (
        <div className="error-page">
            <AlertTriangle size={64} className="error-icon" />
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist or has been moved.</p>
            <Link to="/" className="btn btn-primary">
                <Home size={16} /> Go to Home
            </Link>
        </div>
    );
}

/**
 * ForbiddenPage — displayed when user lacks permissions (RBAC guard).
 */
export function ForbiddenPage() {
    return (
        <div className="error-page">
            <ShieldOff size={64} className="error-icon" />
            <h1>403</h1>
            <h2>Access Denied</h2>
            <p>You don't have permission to access this page.</p>
            <Link to="/dashboard" className="btn btn-primary">
                <Home size={16} /> Go to Dashboard
            </Link>
        </div>
    );
}

/**
 * ServerErrorPage — displayed on unexpected server errors.
 */
export function ServerErrorPage() {
    return (
        <div className="error-page">
            <ServerOff size={64} className="error-icon" />
            <h1>500</h1>
            <h2>Server Error</h2>
            <p>Something went wrong on our end. Please try again later.</p>
            <Link to="/" className="btn btn-primary">
                <Home size={16} /> Go to Home
            </Link>
        </div>
    );
}
