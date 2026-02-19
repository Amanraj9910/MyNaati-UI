/**
 * My Test Results Page — Displays test outcomes with Pass/Fail, eligibility actions, and component details.
 * Data: tblTestResult + tblTestSitting + tblTestSession + tblCredentialType + tblSkill + tblVenue + tluResultType
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTestResults, getTestResultDetails } from '../../services/dashboard.service';
import {
    BarChart3, ArrowLeft, Loader2, MapPin, Calendar, Languages, Award,
    CheckCircle2, XCircle, ChevronDown, ChevronUp, Filter, AlertTriangle, X, FileSearch
} from 'lucide-react';

export default function TestResultsPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [componentData, setComponentData] = useState({});
    const [loadingDetails, setLoadingDetails] = useState(null);
    const [popup, setPopup] = useState(null);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await getTestResults();
                setResults(res.data || res || []);
            } catch (err) {
                console.error('Failed to load test results', err);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    const filteredResults = results.filter(r => {
        if (activeTab === 'passed') return r.OverallResult?.toLowerCase().includes('pass');
        if (activeTab === 'failed') return r.OverallResult?.toLowerCase().includes('fail');
        return true;
    });

    const handleExpand = async (testResultId) => {
        if (expandedId === testResultId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(testResultId);

        if (!componentData[testResultId]) {
            setLoadingDetails(testResultId);
            try {
                const res = await getTestResultDetails(testResultId);
                const data = res.data || res;
                setComponentData(prev => ({ ...prev, [testResultId]: data?.Components || [] }));
            } catch (err) {
                console.error('Failed to load component results', err);
                setComponentData(prev => ({ ...prev, [testResultId]: [] }));
            } finally {
                setLoadingDetails(null);
            }
        }
    };

    const handleUnavailableAction = (actionName) => {
        setPopup(actionName);
    };

    const getResultBadge = (result) => {
        if (!result) return { label: 'Pending', className: 'result-badge result-pending', icon: null };
        const lower = result.toLowerCase();
        if (lower.includes('pass')) return { label: result, className: 'result-badge result-pass', icon: <CheckCircle2 size={16} /> };
        if (lower.includes('fail')) return { label: result, className: 'result-badge result-fail', icon: <XCircle size={16} /> };
        return { label: result, className: 'result-badge result-other', icon: null };
    };

    return (
        <div className="page-container">
            <div className="detail-page-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Dashboard</Link>
                <div className="detail-page-title">
                    <BarChart3 size={28} className="detail-page-icon" style={{ color: '#8b5cf6' }} />
                    <h1>My Test Results</h1>
                </div>
            </div>

            {/* Tab Filters */}
            <div className="tab-filters">
                <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    <Filter size={14} /> All ({results.length})
                </button>
                <button className={`tab-btn ${activeTab === 'passed' ? 'active' : ''}`} onClick={() => setActiveTab('passed')}>
                    <CheckCircle2 size={14} /> Passed ({results.filter(r => r.OverallResult?.toLowerCase().includes('pass')).length})
                </button>
                <button className={`tab-btn ${activeTab === 'failed' ? 'active' : ''}`} onClick={() => setActiveTab('failed')}>
                    <XCircle size={14} /> Failed ({results.filter(r => r.OverallResult?.toLowerCase().includes('fail')).length})
                </button>
            </div>

            {loading ? (
                <div className="dashboard-loading"><Loader2 className="spin" size={32} /><p>Loading test results...</p></div>
            ) : filteredResults.length === 0 ? (
                <div className="detail-empty">
                    <BarChart3 size={48} />
                    <h3>No Test Results Found</h3>
                    <p>{activeTab === 'all' ? "You don't have any test results yet." : `No ${activeTab} results found.`}</p>
                </div>
            ) : (
                <div className="detail-cards-grid">
                    {filteredResults.map((r) => {
                        const badge = getResultBadge(r.OverallResult);
                        const isExpanded = expandedId === r.TestResultId;
                        const components = componentData[r.TestResultId] || [];

                        return (
                            <div key={r.TestResultId} className={`detail-card result-card ${r.OverallResult?.toLowerCase().includes('pass') ? 'card-pass' : r.OverallResult?.toLowerCase().includes('fail') ? 'card-fail' : ''}`}>
                                <div className="detail-card-header">
                                    <h3>{r.CredentialTypeName || 'Test Result'}</h3>
                                    <span className={badge.className}>
                                        {badge.icon} {badge.label}
                                    </span>
                                </div>

                                {r.Skill && (
                                    <div className="detail-card-skill">
                                        <Languages size={14} />
                                        <span>{r.Skill}</span>
                                    </div>
                                )}

                                <div className="detail-card-meta">
                                    <span style={{ fontWeight: 600, color: '#475569' }}>
                                        Attendance ID: {r.AttendanceId || r.TestSittingId}
                                    </span>
                                    <span>
                                        <Calendar size={14} />
                                        {r.TestDateTime
                                            ? new Date(r.TestDateTime).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
                                            : 'Date unavailable'}
                                        {r.TestDateTime && `, ${new Date(r.TestDateTime).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}`}
                                    </span>
                                    {r.VenueName && (
                                        <span><MapPin size={14} /> {r.VenueName}{r.LocationName ? `, ${r.LocationName}` : ''}</span>
                                    )}
                                </div>

                                {r.ProcessedDate && (
                                    <div className="detail-card-processed">
                                        <FileSearch size={14} />
                                        <span>Result processed: {new Date(r.ProcessedDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                )}

                                {/* Eligibility Actions */}
                                <div className="detail-card-actions">
                                    {r.EligibleForPaidTestReview && (
                                        <button className="btn btn-sm btn-outline-purple" onClick={() => handleUnavailableAction('Apply for Paid Test Review')}>
                                            <Award size={14} /> Apply for Paid Test Review
                                        </button>
                                    )}
                                    {r.EligibleForSupplementary && (
                                        <button className="btn btn-sm btn-outline" onClick={() => handleUnavailableAction('Apply for Supplementary Test')}>
                                            Apply for Supplementary
                                        </button>
                                    )}
                                </div>

                                {/* Expand/Collapse Component Details */}
                                <button className="btn btn-sm btn-ghost expand-btn" onClick={() => handleExpand(r.TestResultId)}>
                                    {isExpanded ? <><ChevronUp size={14} /> Hide Details</> : <><ChevronDown size={14} /> View Details</>}
                                </button>

                                {isExpanded && (
                                    <div className="component-details">
                                        {loadingDetails === r.TestResultId ? (
                                            <div className="component-loading"><Loader2 className="spin" size={20} /> Loading component results...</div>
                                        ) : components.length === 0 ? (
                                            <p className="component-empty">No component-level results available.</p>
                                        ) : (
                                            <table className="component-table">
                                                <thead>
                                                    <tr>
                                                        <th>Component</th>
                                                        <th>Mark</th>
                                                        <th>Max</th>
                                                        <th>Result</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {components.map((c, idx) => (
                                                        <tr key={c.TestComponentResultId || idx}>
                                                            <td>{c.ComponentName || `Component ${idx + 1}`}</td>
                                                            <td>{c.Mark ?? '—'}</td>
                                                            <td>{c.MaxMark ?? '—'}</td>
                                                            <td>
                                                                <span className={`component-result ${c.ComponentResult?.toLowerCase().includes('pass') ? 'comp-pass' : c.ComponentResult?.toLowerCase().includes('fail') ? 'comp-fail' : ''}`}>
                                                                    {c.ComponentResult || '—'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
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
