/**
 * =============================================================================
 * MyNaati Frontend — Main Navigation Bar
 * =============================================================================
 * 
 * Top navigation component shown on all pages.
 * Shows different links based on authentication state:
 *   - Public: About, Learn More, Login, Register
 *   - Authenticated: Dashboard, Profile, Logout
 *   - Admin: + Diagnostics, User Search
 * 
 * Uses NAATI brand colors and modern glassmorphism design.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home,
    LogIn,
    LogOut,
    UserPlus,
    Info,
    BookOpen,
    Activity,
    Users,
    Settings,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

/**
 * Navbar component — responsive top navigation bar.
 * Includes mobile hamburger menu for small screens.
 */
function Navbar() {
    const { isAuthenticated, user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    /** Handle logout — clear auth state and redirect to login */
    const handleLogout = () => {
        logout();
        navigate('/login');
        setMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo / Brand */}
                <Link to="/" className="navbar-brand">
                    <img src="/img/NAATIAltLogo.png" alt="MyNaati" style={{ height: '40px' }} />
                </Link>

                {/* Mobile hamburger toggle */}
                <button
                    className="navbar-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Navigation links */}
                <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
                    {/* Public links — always visible */}
                    <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>
                        <Info size={16} />
                        <span>About</span>
                    </Link>
                    <Link to="/learn-more" className="nav-link" onClick={() => setMenuOpen(false)}>
                        <BookOpen size={16} />
                        <span>Learn More</span>
                    </Link>

                    {isAuthenticated ? (
                        <>
                            {/* Authenticated user links */}
                            <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                                <Home size={16} />
                                <span>Dashboard</span>
                            </Link>

                            {/* Admin-only links */}
                            {hasRole('Admin') && (
                                <>
                                    <Link to="/admin/diagnostics" className="nav-link" onClick={() => setMenuOpen(false)}>
                                        <Activity size={16} />
                                        <span>Diagnostics</span>
                                    </Link>
                                    <Link to="/admin/users" className="nav-link" onClick={() => setMenuOpen(false)}>
                                        <Users size={16} />
                                        <span>Users</span>
                                    </Link>
                                </>
                            )}

                            {/* User menu */}
                            <div className="nav-user-section">
                                <span className="nav-username">
                                    {user?.givenName || user?.fullName || 'User'}
                                </span>
                                <Link to="/change-password" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    <Settings size={16} />
                                    <span>Settings</span>
                                </Link>
                                <button className="nav-link nav-logout-btn" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Public auth links */}
                            <Link to="/login" className="nav-link nav-link-primary" onClick={() => setMenuOpen(false)}>
                                <LogIn size={16} />
                                <span>Login</span>
                            </Link>
                            <Link to="/register" className="nav-link nav-link-accent" onClick={() => setMenuOpen(false)}>
                                <UserPlus size={16} />
                                <span>Register</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
