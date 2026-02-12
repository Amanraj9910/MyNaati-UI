/**
 * My Credentials Page — Lists all user credentials from tblCredential.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCredentials } from '../../services/dashboard.service';
import { Award, ArrowLeft, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function CredentialsPage() {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await getCredentials();
                setCredentials(res.data || res || []);
            } catch (err) {
                console.error('Failed to load credentials', err);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    return (
        <div className="page-container">
            <div className="detail-page-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Dashboard</Link>
                <div className="detail-page-title">
                    <Award size={28} className="detail-page-icon" style={{ color: '#10b981' }} />
                    <h1>My Credentials</h1>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-loading"><Loader2 className="spin" size={32} /><p>Loading credentials...</p></div>
            ) : credentials.length === 0 ? (
                <div className="detail-empty">
                    <Award size={48} />
                    <h3>No Credentials Found</h3>
                    <p>You don't have any credentials yet. Apply for a certification to get started.</p>
                    <Link to="/applications" className="btn btn-primary">Apply for Certification</Link>
                </div>
            ) : (
                <div className="detail-table-card">
                    <table className="detail-table">
                        <thead>
                            <tr>
                                <th>Credential Type</th>
                                <th>Status</th>
                                <th>Effective From</th>
                                <th>Effective To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {credentials.map((c) => (
                                <tr key={c.CredentialId}>
                                    <td className="detail-primary-cell">{c.CredentialTypeName || 'Credential'}</td>
                                    <td>
                                        <span className={`status-badge ${c.IsActive ? 'status-active' : 'status-inactive'}`}>
                                            {c.IsActive ? <><CheckCircle size={14} /> Active</> : <><XCircle size={14} /> Inactive</>}
                                        </span>
                                    </td>
                                    <td>{c.EffectiveFrom ? new Date(c.EffectiveFrom).toLocaleDateString() : '—'}</td>
                                    <td>{c.EffectiveTo ? new Date(c.EffectiveTo).toLocaleDateString() : 'Ongoing'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
