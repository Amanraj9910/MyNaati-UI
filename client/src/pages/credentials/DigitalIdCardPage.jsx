import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDigitalIdCard } from '../../services/dashboard.service';
import { Loader2, Calendar, Shield, Clock, CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './digitalIdCard.css';

export default function DigitalIdCardPage() {
    const { user } = useAuth();
    const [idCardData, setIdCardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchCard() {
            try {
                const res = await getDigitalIdCard();
                setIdCardData(res.data || res || null);
            } catch (err) {
                console.error('Failed to load ID Card:', err);
                setError('Failed to load ID Card');
            } finally {
                setLoading(false);
            }
        }
        fetchCard();
    }, []);

    const renderInitials = (givenName, surname) => {
        return `${(givenName || 'N')[0]}${(surname || 'A')[0]}`.toUpperCase();
    };

    const formatDate = (dateString, format = 'long') => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        if (format === 'year') return d.getFullYear();
        return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
    };

    if (loading) {
        return (
            <div className="page-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#009383' }}>
                    <Loader2 className="spin" size={40} />
                    <p>Loading your Credentials...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca', marginTop: '2rem' }}>
                    {error}
                </div>
            </div>
        );
    }

    if (!idCardData) {
        return (
            <div className="page-container">
                <p>No data found.</p>
            </div>
        );
    }

    const {
        fullName,
        givenName,
        surname,
        naatiNumber,
        practitionerNumber,
        photoUrl,
        credentials,
        qrCodeGuid,
        verificationUrl,
    } = idCardData;

    // Derived states
    const validCredentialsCount = credentials.filter(c => new Date(c.expiryDate) > new Date()).length;
    // Assuming PD Points might default to 120/120 for mock / currently unknown mapping
    const pdPoints = "120/120";

    // Using dummy issue date since backend does not currently send it, and renewal is expiry of first one
    const dummyIssueDate = "12 JAN 2023";
    const nextRenewal = credentials.length > 0 ? formatDate(credentials[0].expiryDate) : "—";


    return (
        <div className="cred-page-container">
            {/* Header */}
            <div className="cred-header">
                <div className="cred-header-content">
                    <h1>Credentials</h1>
                    <p>Management of your active professional certifications and digital practitioner identification.</p>
                </div>
                <div className="cred-badge-verified">
                    VERIFIED ACCOUNT
                </div>
            </div>

            {/* Top Grid */}
            <div className="cred-top-grid">
                {/* Practitioner ID Card */}
                <div className="cred-id-card">
                    <div className="cred-id-left">
                        <div><div className="cred-id-title">
                            Digital Practitioner ID
                        </div>
                            {verificationUrl ? (
                                <div className="cred-id-qr-large">
                                    <QRCodeSVG
                                        value={verificationUrl}
                                        size={100}
                                        bgColor="#005C5D"
                                        fgColor="#FFF"
                                        level="Q"
                                        includeMargin={false}
                                    />
                                </div>
                            ) : (
                                <div className="cred-id-qr">
                                    <QrCode size={40} color="#FFF" />
                                </div>
                            )}

                        </div>

                        {/* <div className="cred-id-status-badge">
                            <span className="dot"></span> ACTIVE
                        </div> */}

                    </div>

                    <div className="cred-id-right">
                        <div className="cred-profile-row">
                            <div className="cred-profile-info">
                                {photoUrl ? (
                                    <img src={photoUrl} alt={fullName} className="cred-profile-img" />
                                ) : (
                                    <div className="cred-profile-img">
                                        {renderInitials(givenName, surname)}
                                    </div>
                                )}
                                <div className="cred-profile-text">
                                    <h2>{fullName}</h2>
                                    <p>NAATI ID: {naatiNumber}</p>
                                </div>
                            </div>
                            <div className="cred-icon-verified">
                                <CheckCircle2 fill="#dbeae9" color="#005C5D" size={24} />
                            </div>
                        </div>

                        <div className="cred-dates-row">
                            <div className="cred-date-box">
                                <div className="cred-date-label">ISSUE DATE</div>
                                <div className="cred-date-value">{dummyIssueDate}</div>
                            </div>
                            <div className="cred-date-box">
                                <div className="cred-date-label">RENEWAL</div>
                                <div className="cred-date-value">{nextRenewal}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Overview Card */}
                <div className="cred-status-card">
                    <div className="cred-status-title">STATUS OVERVIEW</div>

                    <div className="cred-status-row">
                        <span>Valid Credentials</span>
                        <span className="cred-status-val green">{validCredentialsCount.toString().padStart(2, '0')}</span>
                    </div>

                    <div className="cred-status-row">
                        <span>Pending Renewals</span>
                        <span className="cred-status-val">00</span>
                    </div>

                    <div className="cred-status-row">
                        <span>PD Points</span>
                        <span className="cred-status-val">{pdPoints}</span>
                    </div>

                    <div className="cred-status-footer">
                        {/* <button className="cred-btn-secondary">
                            View Full Transcript
                        </button> */}
                    </div>
                </div>
            </div>

            {/* Active Certifications */}
            <div className="cred-certs-section">
                <h3>Active Certifications</h3>

                {credentials.length > 0 ? (
                    credentials.map((cred, i) => {
                        const isProvisional = cred.credentialType.toLowerCase().includes("provisional");

                        return (
                            <div key={cred.credentialId || i} className="cred-cert-card">
                                <div className="cred-cert-left">
                                    <div className={`cred-cert-icon ${isProvisional ? 'light' : ''}`}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                            文A
                                        </span>
                                    </div>
                                    <div className="cred-cert-info">
                                        <h4>
                                            {cred.credentialType}
                                            {isProvisional && <span className="cred-cert-level">LEVEL 1</span>}
                                        </h4>
                                        {cred.languagePair && (
                                            <div className="cred-cert-lang">
                                                {cred.languagePair}
                                            </div>
                                        )}
                                        <div className="cred-cert-meta">
                                            <div className="cred-meta-item">
                                                <Calendar size={14} />
                                                <span>Expires: <strong>{formatDate(cred.expiryDate)}</strong></span>
                                            </div>
                                            {practitionerNumber && !isProvisional && (
                                                <div className="cred-meta-item">
                                                    <Shield size={14} />
                                                    <span>Auth No: <strong>{practitionerNumber}</strong></span>
                                                </div>
                                            )}
                                            {isProvisional && (
                                                <div className="cred-meta-item">
                                                    <Clock size={14} />
                                                    <span>Last renewal: <strong>{formatDate(cred.expiryDate, 'year') - 3}</strong></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="cred-cert-right">
                                    <button className="cred-btn-outline">
                                        View Certificate
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '16px', color: '#666' }}>
                        No active certifications found.
                    </div>
                )}
            </div>

        </div>
    );
}
