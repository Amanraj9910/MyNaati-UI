/**
 * =============================================================================
 * MyNaati Frontend — Digital ID Card Component
 * =============================================================================
 * 
 * Interactive 3D flip-card displaying the practitioner's digital credential.
 * Front: Photo, name, NAATI number, QR code
 * Back: List of all active credentials with types, languages, and expiry dates
 * 
 * Click/tap the card to flip between front and back views.
 */

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
    CreditCard, Award, Globe, Calendar,
    Shield, RotateCcw, Fingerprint
} from 'lucide-react';

export default function DigitalIdCard({ data }) {
    const [isFlipped, setIsFlipped] = useState(false);

    if (!data) {
        return (
            <div className="idcard-empty">
                <CreditCard size={40} />
                <p>No active credentials to display</p>
                <span>Your digital ID card will appear here once you have active certifications.</span>
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
        hasActiveCredentials,
    } = data;

    const initials = `${(givenName || 'N')[0]}${(surname || 'A')[0]}`.toUpperCase();
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="idcard-section">
            <div className="idcard-section-header">
                <div className="idcard-section-title">
                    <Fingerprint size={22} />
                    <h2>My Digital ID Card</h2>
                </div>
                <button
                    className="idcard-flip-hint"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <RotateCcw size={16} />
                    {isFlipped ? 'View Front' : 'View Credentials'}
                </button>
            </div>

            <div className="idcard-perspective" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`idcard-inner ${isFlipped ? 'idcard-flipped' : ''}`}>
                    {/* ==================== FRONT ==================== */}
                    <div className="idcard-face idcard-front">
                        {/* Top Gradient Header */}
                        <div className="idcard-front-header">
                            <div className="idcard-logo-row">
                                <Shield size={20} className="idcard-shield" />
                                <span className="idcard-logo-text">NAATI</span>
                            </div>
                            <span className="idcard-card-label">Practitioner ID</span>
                        </div>

                        {/* Photo + Identity */}
                        <div className="idcard-front-body">
                            <div className="idcard-photo-ring">
                                {photoUrl ? (
                                    <img src={photoUrl} alt={fullName} className="idcard-photo" />
                                ) : (
                                    <div className="idcard-photo-placeholder">{initials}</div>
                                )}
                                <div className="idcard-verified-dot" title="Verified">✓</div>
                            </div>

                            <h3 className="idcard-name">{fullName}</h3>
                            <span className="idcard-practitioner-num">
                                {practitionerNumber || `NAATI #${naatiNumber}`}
                            </span>

                            {hasActiveCredentials && credentials[0] && (
                                <span className="idcard-primary-cred">
                                    <Award size={14} />
                                    {credentials[0].credentialType}
                                </span>
                            )}
                        </div>

                        {/* QR Code */}
                        <div className="idcard-qr-area">
                            {verificationUrl ? (
                                <div className="idcard-qr-wrapper">
                                    <QRCodeSVG
                                        value={verificationUrl}
                                        size={100}
                                        bgColor="transparent"
                                        fgColor="#005C5D"
                                        level="Q"
                                        includeMargin={false}
                                    />
                                    <span className="idcard-qr-label">Scan to verify</span>
                                </div>
                            ) : (
                                <div className="idcard-qr-placeholder">
                                    <Globe size={20} />
                                    <span>QR not available</span>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="idcard-front-footer">
                            <span>Verified Practitioner</span>
                        </div>
                    </div>

                    {/* ==================== BACK ==================== */}
                    <div className="idcard-face idcard-back">
                        <div className="idcard-back-header">
                            <div className="idcard-logo-row">
                                <Shield size={20} className="idcard-shield" />
                                <span className="idcard-logo-text">NAATI</span>
                            </div>
                            <span className="idcard-card-label">Active Credentials</span>
                        </div>

                        <div className="idcard-back-body">
                            {credentials.length > 0 ? (
                                <div className="idcard-creds-list">
                                    {credentials.map((cred, i) => (
                                        <div key={cred.credentialId || i} className="idcard-cred-item">
                                            <div className="idcard-cred-icon">
                                                <Award size={16} />
                                            </div>
                                            <div className="idcard-cred-info">
                                                <span className="idcard-cred-type">{cred.credentialType}</span>
                                                {cred.languagePair && (
                                                    <span className="idcard-cred-lang">
                                                        <Globe size={12} />
                                                        {cred.languagePair}
                                                    </span>
                                                )}
                                                <span className="idcard-cred-expiry">
                                                    <Calendar size={12} />
                                                    Expires: {formatDate(cred.expiryDate)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="idcard-no-creds">
                                    <p>No active credentials</p>
                                </div>
                            )}
                        </div>

                        <div className="idcard-back-footer">
                            <span className="idcard-naati-num">NAATI #{naatiNumber}</span>
                            <span className="idcard-verify-text">naati.com.au</span>
                        </div>
                    </div>
                </div>
            </div>
            <p className="idcard-tap-hint">Click card to flip</p>
        </div>
    );
}
