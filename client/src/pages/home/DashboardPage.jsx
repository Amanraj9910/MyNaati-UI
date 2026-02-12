/**
 * =============================================================================
 * MyNaati Frontend — Dashboard Page
 * =============================================================================
 * 
 * Main landing page for authenticated users.
 * Displays a personalized greeting (from tblPersonName) and quick action cards
 * that link to key MyNaati features.
 * 
 * Fetches data from GET /api/home/dashboard.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as homeService from '../../services/home.service';
import {
    FileText, ClipboardCheck, Award, BookOpen, Receipt, User, ChevronRight, Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';

/** Map icon names from the API to Lucide icon components */
const iconMap = {
    FileText, ClipboardCheck, Award, BookOpen, Receipt, User,
};

/**
 * DashboardPage component — personalized home page for logged-in users.
 * Shows welcome greeting and quick-action cards for navigation.
 */
function DashboardPage() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    /** Fetch dashboard data on mount */
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await homeService.getDashboard();
                setDashboardData(response.data);
            } catch (error) {
                toast.error('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-screen">
                    <Loader className="spinner-icon" size={40} />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Welcome Banner */}
            <div className="dashboard-banner">
                <div className="banner-content">
                    <h1>{dashboardData?.greeting || `Welcome, ${user?.givenName || 'User'}!`}</h1>
                    <p>What would you like to do today?</p>
                </div>
                <div className="banner-decoration" />
            </div>

            {/* Quick Action Cards */}
            <div className="dashboard-grid">
                {dashboardData?.quickActions?.map((action) => {
                    const IconComponent = iconMap[action.icon] || FileText;
                    return (
                        <Link key={action.id} to={action.path} className="action-card">
                            <div className="action-card-icon">
                                <IconComponent size={28} />
                            </div>
                            <div className="action-card-content">
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </div>
                            <ChevronRight size={20} className="action-card-arrow" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default DashboardPage;
