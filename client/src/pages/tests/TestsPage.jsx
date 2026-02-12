/**
 * Manage My Tests Page — Lists all test sittings from tblTestSitting.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTests } from '../../services/dashboard.service';
import { ClipboardList, ArrowLeft, Loader2, MapPin, Calendar } from 'lucide-react';

export default function TestsPage() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await getTests();
                setTests(res.data || res || []);
            } catch (err) {
                console.error('Failed to load tests', err);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    const isUpcoming = (date) => date && new Date(date) >= new Date();

    return (
        <div className="page-container">
            <div className="detail-page-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Dashboard</Link>
                <div className="detail-page-title">
                    <ClipboardList size={28} className="detail-page-icon" style={{ color: '#f59e0b' }} />
                    <h1>Manage My Tests</h1>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-loading"><Loader2 className="spin" size={32} /><p>Loading tests...</p></div>
            ) : tests.length === 0 ? (
                <div className="detail-empty">
                    <ClipboardList size={48} />
                    <h3>No Tests Found</h3>
                    <p>You don't have any scheduled or past tests.</p>
                </div>
            ) : (
                <div className="detail-cards-grid">
                    {tests.map((t) => (
                        <div key={t.TestSittingId} className={`detail-card ${isUpcoming(t.SittingDate) ? 'card-upcoming' : ''}`}>
                            <div className="detail-card-header">
                                <h3>{t.SessionName || 'Test Session'}</h3>
                                {isUpcoming(t.SittingDate) && <span className="status-badge status-upcoming">Upcoming</span>}
                            </div>
                            <div className="detail-card-meta">
                                <span><Calendar size={14} /> {t.SittingDate ? new Date(t.SittingDate).toLocaleDateString() : 'TBD'}</span>
                                {t.LocationName && <span><MapPin size={14} /> {t.LocationName}{t.City ? `, ${t.City}` : ''}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
