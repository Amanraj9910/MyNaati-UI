/**
 * Apply for Certification Page — Lists credential applications from tblCredentialApplication.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApplications } from '../../services/dashboard.service';
import { FileText, ArrowLeft, Loader2, Clock, CheckCircle, XCircle, Plus, Globe, Volume2 } from 'lucide-react';
import NewApplicationModal from '../../components/applications/NewApplicationModal';

export default function ApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchApplications = async () => {
        try {
            const res = await getApplications();
            setApplications(res.data || res || []);
        } catch (err) {
            console.error('Failed to load applications', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    return (
        <div className="page-container">
            <div className="detail-page-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Dashboard</Link>
                <div className="detail-page-title">
                    <FileText size={28} className="detail-page-icon" style={{ color: '#009382' }} />
                    <h1>Apply for Certification</h1>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> New Application
                </button>
            </div>

            {loading ? (
                <div className="dashboard-loading"><Loader2 className="spin" size={32} /><p>Loading applications...</p></div>
            ) : applications.length === 0 ? (
                <div className="detail-empty">
                    <FileText size={48} />
                    <h3>No Applications Found</h3>
                    <p>You haven't submitted any credential applications yet.</p>
                </div>
            ) : (
                <div className="detail-table-card">
                    <table className="detail-table">
                        <thead>
                            <tr>
                                <th>Reference #</th>
                                <th>Application Type</th>
                                <th>Date Submitted</th>
                                <th>Last Modified</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.CredentialApplicationId}>
                                    <td className="detail-primary-cell">{app.ReferenceNumber || app.CredentialApplicationId}</td>
                                    <td>{app.ApplicationTypeName || 'Application'}</td>
                                    <td>{app.ApplicationDate ? new Date(app.ApplicationDate).toLocaleDateString() : '—'}</td>
                                    <td>{app.LastModifiedDate ? new Date(app.LastModifiedDate).toLocaleDateString() : '—'}</td>
                                    <td>
                                        <span className="status-badge status-pending">
                                            <Clock size={14} /> In Progress
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <NewApplicationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
