import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { updateProfile } from '../../services/dashboard.service';
import toast from 'react-hot-toast';

export default function CredentialsList({ credentials }) {
    const [localCreds, setLocalCreds] = useState(credentials || []);

    useEffect(() => {
        setLocalCreds(credentials || []);
    }, [credentials]);

    const getStatus = (c) => {
        if (c.TerminationDate) return { label: 'Terminated', cls: 'status-terminated' };
        if (c.EffectiveTo && new Date(c.EffectiveTo) < new Date()) return { label: 'Expired', cls: 'status-expired' };
        return { label: 'Active', cls: 'status-active' };
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

    const toggleDirectory = async (id, currentVal) => {
        // Optimistic update
        setLocalCreds(prev => prev.map(c =>
            c.CredentialId === id ? { ...c, ShowInOnlineDirectory: !currentVal } : c
        ));
        try {
            await updateProfile({ type: 'credential_update', data: { CredentialId: id, ShowInOnlineDirectory: !currentVal } });
            toast.success('Updated visibility');
        } catch (error) {
            // Revert on error
            setLocalCreds(prev => prev.map(c =>
                c.CredentialId === id ? { ...c, ShowInOnlineDirectory: currentVal } : c
            ));
            toast.error('Failed to update');
        }
    };

    const getLanguagePair = (c) => {
        if (c.Language1 && c.Language2) return `${c.Language1} ↔ ${c.Language2}`;
        if (c.Language1) return c.Language1;
        return null;
    };

    if (!localCreds || localCreds.length === 0) {
        return (
            <div className="credentials-list-empty">
                <p>No active credentials found.</p>
            </div>
        );
    }

    return (
        <div className="credentials-list">
            {localCreds.map(c => {
                const status = getStatus(c);
                const langPair = getLanguagePair(c);
                return (
                    <div key={c.CredentialId} className="credential-card">
                        <div className="credential-header">
                            <div className="credential-title-group">
                                <div className="credential-icon">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h4 className="credential-name">{c.CredentialName || `Credential #${c.CredentialId}`}</h4>
                                    {langPair && <span className="credential-lang">{langPair}</span>}
                                </div>
                            </div>
                            <span className={`status-badge ${status.cls}`}>
                                {status.label}
                            </span>
                        </div>

                        <div className="credential-grid">
                            <div className="credential-field">
                                <span className="field-label">Credential ID</span>
                                <span className="field-value">{c.CredentialId}</span>
                            </div>
                            <div className="credential-field">
                                <span className="field-label">Valid From</span>
                                <span className="field-value">{formatDate(c.EffectiveFrom)}</span>
                            </div>
                            <div className="credential-field">
                                <span className="field-label">Expires</span>
                                <span className="field-value">{formatDate(c.EffectiveTo)}</span>
                            </div>
                            {c.TerminationDate && (
                                <div className="credential-field">
                                    <span className="field-label">Terminated</span>
                                    <span className="field-value" style={{ color: '#ef4444' }}>{formatDate(c.TerminationDate)}</span>
                                </div>
                            )}
                            {c.CredentialLevel && (
                                <div className="credential-field">
                                    <span className="field-label">Level</span>
                                    <span className="field-value">{c.CredentialLevel}</span>
                                </div>
                            )}
                            <div className="credential-field">
                                <span className="field-label">Online Directory</span>
                                <span className="field-value">{c.ShowInOnlineDirectory ? '✅ Visible' : '❌ Hidden'}</span>
                            </div>
                        </div>

                        <div className="credential-footer">
                            <label className="checkbox-label" style={{ fontSize: '0.9rem' }}>
                                <input
                                    type="checkbox"
                                    checked={!!c.ShowInOnlineDirectory}
                                    onChange={() => toggleDirectory(c.CredentialId, c.ShowInOnlineDirectory)}
                                />
                                <span>Show in Online Directory</span>
                            </label>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
