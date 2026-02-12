/**
 * My Logbook Page — Lists PD activities from tblProfessionalDevelopmentActivity.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLogbook } from '../../services/dashboard.service';
import { BookOpen, ArrowLeft, Loader2, Clock, Tag } from 'lucide-react';

export default function LogbookPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await getLogbook();
                setActivities(res.data || res || []);
            } catch (err) {
                console.error('Failed to load logbook', err);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    const totalHours = activities.reduce((sum, a) => sum + (a.Hours || 0), 0);

    return (
        <div className="page-container">
            <div className="detail-page-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Dashboard</Link>
                <div className="detail-page-title">
                    <BookOpen size={28} className="detail-page-icon" style={{ color: '#06b6d4' }} />
                    <h1>My Logbook</h1>
                </div>
            </div>

            {!loading && activities.length > 0 && (
                <div className="logbook-summary">
                    <div className="logbook-stat">
                        <span className="logbook-stat-value">{activities.length}</span>
                        <span className="logbook-stat-label">Activities</span>
                    </div>
                    <div className="logbook-stat">
                        <span className="logbook-stat-value">{totalHours.toFixed(1)}</span>
                        <span className="logbook-stat-label">Total Hours</span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="dashboard-loading"><Loader2 className="spin" size={32} /><p>Loading logbook...</p></div>
            ) : activities.length === 0 ? (
                <div className="detail-empty">
                    <BookOpen size={48} />
                    <h3>No Activities Logged</h3>
                    <p>Start logging your professional development activities.</p>
                </div>
            ) : (
                <div className="detail-cards-grid">
                    {activities.map((a) => (
                        <div key={a.ProfessionalDevelopmentActivityId} className="detail-card">
                            <div className="detail-card-header">
                                <h3>{a.Description || 'PD Activity'}</h3>
                                {a.Hours && <span className="hours-badge"><Clock size={14} /> {a.Hours}h</span>}
                            </div>
                            <div className="detail-card-meta">
                                <span>{a.ActivityDate ? new Date(a.ActivityDate).toLocaleDateString() : '—'}</span>
                                {a.CategoryName && <span><Tag size={14} /> {a.CategoryName}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
