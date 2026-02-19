/**
 * Manage My Tests Page — Enhanced with credential type, skill, venue, status, and actions.
 * Data: tblTestSitting + tblTestSession + tblCredentialRequest + tblCredentialType + tblSkill + tblVenue
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTests } from '../../services/dashboard.service';
import { ClipboardList, ArrowLeft, Loader2, MapPin, Calendar, Award, Languages, AlertTriangle, X, Filter } from 'lucide-react';

export default function TestsPage() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [popup, setPopup] = useState(null);

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

    const filteredTests = tests.filter(t => {
        if (activeTab === 'upcoming') return t.IsUpcoming && !t.Rejected;
        if (activeTab === 'completed') return (t.IsPast || t.Sat) && !t.Rejected;
        if (activeTab === 'rejected') return t.Rejected;
        return !t.Rejected; // All tab shows active (non-rejected) tests
    });

    const getStatusBadge = (t) => {
        if (t.Rejected) return { label: 'Rejected', className: 'status-badge status-rejected' };

        if (t.OverallResult) {
            const lower = t.OverallResult.toLowerCase();
            if (lower.includes('pass')) return { label: t.OverallResult, className: 'status-badge result-pass' };
            if (lower.includes('fail')) return { label: t.OverallResult, className: 'status-badge result-fail' };
        }

        if (t.Sat) return { label: 'Completed', className: 'status-badge status-completed' };
        if (t.IsUpcoming) return { label: 'Upcoming', className: 'status-badge status-upcoming' };
        if (t.Supplementary) return { label: 'Supplementary', className: 'status-badge status-supplementary' };
        return { label: t.RequestStatusName || 'Scheduled', className: 'status-badge status-default' };
    };

    const formatSkill = (t) => {
        const parts = [t.Language1, t.Language2].filter(Boolean);
        return parts.length > 0 ? parts.join(' ↔ ') : null;
    };

    const handleUnavailableAction = (actionName) => {
        setPopup(actionName);
    };

    return (
        <div className="page-container">
            <div className="detail-page-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Dashboard</Link>
                <div className="detail-page-title">
                    <ClipboardList size={28} className="detail-page-icon" style={{ color: '#f59e0b' }} />
                    <h1>Manage My Tests</h1>
                </div>
            </div>

            {/* Tab Filters */}
            <div className="tab-filters">
                <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    <Filter size={14} /> All ({tests.filter(t => !t.Rejected).length})
                </button>
                <button className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
                    <Calendar size={14} /> Upcoming ({tests.filter(t => t.IsUpcoming && !t.Rejected).length})
                </button>
                <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
                    <ClipboardList size={14} /> Completed ({tests.filter(t => (t.IsPast || t.Sat) && !t.Rejected).length})
                </button>
                <button className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>
                    <X size={14} /> Rejected ({tests.filter(t => t.Rejected).length})
                </button>
            </div>

            {loading ? (
                <div className="dashboard-loading"><Loader2 className="spin" size={32} /><p>Loading tests...</p></div>
            ) : filteredTests.length === 0 ? (
                <div className="detail-empty">
                    <ClipboardList size={48} />
                    <h3>No Tests Found</h3>
                    <p>{activeTab === 'all' ? "You don't have any scheduled or past tests." : `No ${activeTab} tests found.`}</p>
                </div>
            ) : (
                <div className="detail-cards-grid">
                    {filteredTests.map((t) => {
                        const status = getStatusBadge(t);
                        const skill = formatSkill(t);
                        return (
                            <div key={t.TestSittingId} className={`detail-card ${t.IsUpcoming ? 'card-upcoming' : ''}`}>
                                <div className="detail-card-header">
                                    <h3>{t.CredentialTypeName || t.SessionName || 'Test Session'}</h3>
                                    <span className={status.className}>{status.label}</span>
                                </div>

                                {skill && (
                                    <div className="detail-card-skill">
                                        <Languages size={14} />
                                        <span>{skill}</span>
                                    </div>
                                )}

                                <div className="detail-card-meta">
                                    <span style={{ fontWeight: 600, color: '#475569' }}>
                                        Attendance ID: {t.TestSittingId}
                                    </span>
                                    <span><Calendar size={14} /> {t.TestDateTime ? new Date(t.TestDateTime).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                                    {t.VenueName && <span><MapPin size={14} /> {t.VenueName}{t.LocationName ? `, ${t.LocationName}` : ''}</span>}
                                </div>

                                {t.Supplementary && (
                                    <div className="detail-card-badge supplementary-badge">
                                        <Award size={14} /> Supplementary Test
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="detail-card-actions">
                                    {t.CanSelectTestSession && (
                                        <button className="btn btn-sm btn-outline" onClick={() => handleUnavailableAction('Select Test Session')}>
                                            Select Test Session
                                        </button>
                                    )}
                                    {t.CanRequestRefund && (
                                        <button className="btn btn-sm btn-outline-warning" onClick={() => handleUnavailableAction('Request Refund')}>
                                            Request Refund
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Unavailable Feature Popup */}
            {popup && (
                <div className="modal-overlay" onClick={() => setPopup(null)}>
                    <div className="modal-content popup-unavailable" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setPopup(null)}><X size={20} /></button>
                        <div className="popup-unavailable-icon">
                            <AlertTriangle size={48} />
                        </div>
                        <h3>Feature Not Available</h3>
                        <p>The <strong>"{popup}"</strong> functionality is not available in this version of MyNaati.</p>
                        <p className="popup-unavailable-sub">Please contact NAATI directly for assistance with this request.</p>
                        <button className="btn btn-primary" onClick={() => setPopup(null)}>OK, Got It</button>
                    </div>
                </div>
            )}
        </div>
    );
}
