/**
 * My Account / Profile Page — Displays personal details from tblPerson + tblAddress + tblEmail.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfile } from '../../services/dashboard.service';
import { User, ArrowLeft, Loader2, MapPin, Mail, Hash, Calendar } from 'lucide-react';

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await getProfile();
                setProfile(res.data || res);
            } catch (err) {
                console.error('Failed to load profile', err);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="page-container">
                <div className="dashboard-loading"><Loader2 className="spin" size={32} /><p>Loading profile...</p></div>
            </div>
        );
    }

    const name = profile?.name;
    const person = profile?.person;
    const addresses = profile?.addresses || [];
    const emails = profile?.emails || [];

    return (
        <div className="page-container">
            <div className="detail-page-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Dashboard</Link>
                <div className="detail-page-title">
                    <User size={28} className="detail-page-icon" style={{ color: '#6366f1' }} />
                    <h1>My Account</h1>
                </div>
            </div>

            {/* Profile Card */}
            <div className="profile-card">
                <div className="profile-avatar">
                    {(name?.GivenName || 'U')[0].toUpperCase()}
                </div>
                <div className="profile-info">
                    <h2>{[name?.GivenName, name?.MiddleName, name?.Surname].filter(Boolean).join(' ') || 'User'}</h2>
                    {profile?.naatiNumber && (
                        <span className="profile-badges">
                            <span className="profile-badge naati"><Hash size={12} /> NAATI #{profile.naatiNumber}</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="profile-grid">
                {/* Personal Details */}
                <div className="profile-section">
                    <h3><User size={18} /> Personal Details</h3>
                    <div className="profile-items">
                        <div className="profile-item">
                            <span className="profile-label">Date of Birth</span>
                            <span className="profile-value">
                                {person?.DateOfBirth ? new Date(person.DateOfBirth).toLocaleDateString() : 'Not recorded'}
                            </span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Gender ID</span>
                            <span className="profile-value">{person?.GenderId || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="profile-section">
                    <h3><Mail size={18} /> Email Addresses</h3>
                    {emails.length > 0 ? (
                        <div className="profile-list">
                            {emails.map((e) => (
                                <div key={e.EmailId} className="profile-list-item">
                                    <span className="profile-list-value">{e.Email}</span>
                                    {e.IsPreferredEmail && <span className="status-badge status-active">Primary</span>}
                                </div>
                            ))}
                        </div>
                    ) : <p className="profile-empty">No email addresses on file.</p>}
                </div>

                {/* Addresses */}
                <div className="profile-section full-width">
                    <h3><MapPin size={18} /> Addresses</h3>
                    {addresses.length > 0 ? (
                        <div className="profile-list">
                            {addresses.map((a) => (
                                <div key={a.AddressId} className="profile-list-item">
                                    <div className="address-content">
                                        <span className="profile-list-value">
                                            {[a.AddressLine1, a.AddressLine2].filter(Boolean).join(', ')}
                                        </span>
                                        <span className="profile-list-sub">
                                            {[a.Suburb, a.State, a.PostCode, a.Country].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                    {a.IsPrimary && <span className="status-badge status-active">Primary</span>}
                                </div>
                            ))}
                        </div>
                    ) : <p className="profile-empty">No addresses on file.</p>}
                </div>
            </div>
        </div>
    );
}
