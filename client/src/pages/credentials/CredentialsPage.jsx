/**
 * My Credentials Page — Lists all user credentials from tblCredential.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCredentials } from '../../services/dashboard.service';
import CredentialsList from '../../components/dashboard/CredentialsList';
import { Award, ArrowLeft, Loader2 } from 'lucide-react';

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
                <CredentialsList credentials={credentials} />
            )}
        </div>
    );
}
