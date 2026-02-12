/**
 * =============================================================================
 * MyNaati Frontend — Dashboard Page (Redesigned)
 * =============================================================================
 * 
 * Candidate dashboard with real data from 7 DB-connected sections.
 * Shows welcome banner, summary stat cards, and 7 section tiles.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardSummary } from '../../services/dashboard.service';
import {
    User, Award, FileText, ClipboardList, Receipt,
    CreditCard, BookOpen, ArrowRight, TrendingUp,
    Calendar, AlertCircle, Loader2
} from 'lucide-react';

const SECTION_CONFIG = [
    {
        id: 'profile', title: 'My Account', path: '/profile',
        icon: User, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)',
        description: 'View and update your personal details',
        statKey: null,
    },
    {
        id: 'credentials', title: 'My Credentials', path: '/credentials',
        icon: Award, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)',
        description: 'View your current certifications',
        statKey: 'activeCredentials', statLabel: 'Active',
    },
    {
        id: 'tests', title: 'Manage My Tests', path: '/tests',
        icon: ClipboardList, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)',
        description: 'View your scheduled and past tests',
        statKey: 'upcomingTests', statLabel: 'Upcoming',
    },
    {
        id: 'invoices', title: 'My Invoices', path: '/invoices',
        icon: Receipt, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)',
        description: 'View and pay outstanding invoices',
        statKey: 'unpaidInvoices', statLabel: 'Unpaid',
    },
    {
        id: 'bills', title: 'My Bills', path: '/bills',
        icon: CreditCard, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)',
        description: 'View your transaction history',
        statKey: null,
    },
    {
        id: 'logbook', title: 'My Logbook', path: '/logbook',
        icon: BookOpen, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)',
        description: 'Log professional development activities',
        statKey: 'pdActivities', statLabel: 'Activities',
    },
    {
        id: 'apply', title: 'Apply for Certification', path: '/applications',
        icon: FileText, color: '#009382', bg: 'rgba(0, 147, 130, 0.1)',
        description: 'Start a new credential application',
        statKey: 'activeApplications', statLabel: 'In Progress',
    },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                setLoading(true);
                const response = await getDashboardSummary();
                setDashboard(response.data || response);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="page-container">
                <div className="dashboard-loading">
                    <Loader2 className="spin" size={40} />
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = dashboard?.stats || {};
    const greeting = dashboard?.greeting || `Welcome, ${user?.givenName || 'User'}! 👋`;
    const naatiNumber = dashboard?.naatiNumber || user?.naatiNumber;

    return (
        <div className="page-container">
            {/* Welcome Banner */}
            <div className="dash-banner">
                <div className="dash-banner-content">
                    <div className="dash-banner-text">
                        <h1>{greeting}</h1>
                        {naatiNumber && (
                            <span className="dash-naati-badge">NAATI #{naatiNumber}</span>
                        )}
                        <p className="dash-banner-sub">
                            Manage your credentials, tests, and professional development all in one place.
                        </p>
                    </div>
                    <div className="dash-banner-avatar">
                        <div className="dash-avatar">
                            {(dashboard?.givenName || user?.givenName || 'U')[0].toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="dash-stats-row">
                <StatCard
                    icon={<Award size={22} />}
                    label="Active Credentials"
                    value={stats.activeCredentials ?? 0}
                    color="#10b981"
                />
                <StatCard
                    icon={<Calendar size={22} />}
                    label="Upcoming Tests"
                    value={stats.upcomingTests ?? 0}
                    color="#f59e0b"
                />
                <StatCard
                    icon={<AlertCircle size={22} />}
                    label="Unpaid Invoices"
                    value={stats.unpaidInvoices ?? 0}
                    color="#ef4444"
                    extra={stats.totalOwed > 0 ? `$${Number(stats.totalOwed).toFixed(2)} owed` : null}
                />
                <StatCard
                    icon={<TrendingUp size={22} />}
                    label="PD Hours"
                    value={stats.pdHours ?? 0}
                    color="#06b6d4"
                    extra={`${stats.pdActivities ?? 0} activities`}
                />
            </div>

            {/* Section Tiles */}
            <h2 className="dash-section-heading">Your Dashboard</h2>
            <div className="dash-tiles-grid">
                {SECTION_CONFIG.map((section) => {
                    const Icon = section.icon;
                    const statVal = section.statKey ? stats[section.statKey] : null;
                    return (
                        <Link to={section.path} key={section.id} className="dash-tile">
                            <div className="dash-tile-icon" style={{ background: section.bg, color: section.color }}>
                                <Icon size={24} />
                            </div>
                            <div className="dash-tile-body">
                                <h3>{section.title}</h3>
                                <p>{section.description}</p>
                            </div>
                            {statVal !== null && statVal !== undefined && (
                                <div className="dash-tile-badge" style={{ background: section.bg, color: section.color }}>
                                    {statVal} {section.statLabel}
                                </div>
                            )}
                            <ArrowRight className="dash-tile-arrow" size={18} />
                        </Link>
                    );
                })}
            </div>

            {error && <p className="dash-error">{error}</p>}
        </div>
    );
}

function StatCard({ icon, label, value, color, extra }) {
    return (
        <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: `${color}15`, color }}>
                {icon}
            </div>
            <div className="dash-stat-info">
                <span className="dash-stat-value" style={{ color }}>{value}</span>
                <span className="dash-stat-label">{label}</span>
                {extra && <span className="dash-stat-extra">{extra}</span>}
            </div>
        </div>
    );
}
