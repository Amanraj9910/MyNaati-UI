/**
 * My Account / Profile Page — Displays personal details from tblPerson + tblAddress + tblEmail.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfile } from '../../services/dashboard.service';
import { User, ArrowLeft, Loader2, MapPin, Mail, Phone, Hash, Calendar, Edit2, Plus, Globe } from 'lucide-react';
import EditProfileModal from '../../components/profile/EditProfileModal';
import EditAddressModal from '../../components/profile/EditAddressModal';

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const fetchProfile = async () => {
        try {
            const res = await getProfile();
            setProfile(res.data || res);
        } catch (err) {
            console.error('Failed to load profile', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setIsAddressModalOpen(true);
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setIsAddressModalOpen(true);
    };

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
    const phones = profile?.phones || [];
    const website = profile?.website;

    return (
        <div className="page-container">
            <div className="detail-page-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Dashboard</Link>
                <div className="detail-page-title">
                    <User size={28} className="detail-page-icon" style={{ color: '#009382' }} />
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
                    <div className="profile-section-header">
                        <h3><User size={18} /> Personal Details</h3>
                        <button onClick={() => setIsProfileModalOpen(true)} className="btn-icon">
                            <Edit2 size={16} /> Edit
                        </button>
                    </div>
                    <div className="profile-items">
                        <div className="profile-item">
                            <span className="profile-label">Date of Birth</span>
                            <span className="profile-value">
                                {person?.BirthDate ? new Date(person.BirthDate).toLocaleDateString() : 'Not recorded'}
                            </span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Gender</span>
                            <span className="profile-value">
                                {person?.Gender === 'M' ? 'Male' : person?.Gender === 'F' ? 'Female' : person?.Gender === 'X' ? 'Non-binary' : person?.Gender || '—'}
                            </span>
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

                {/* Phone Numbers */}
                <div className="profile-section">
                    <h3><Phone size={18} /> Phone Numbers</h3>
                    {phones.length > 0 ? (
                        <div className="profile-list">
                            {phones.map((p, i) => (
                                <div key={p.PhoneId || i} className="profile-list-item">
                                    <span className="profile-list-value">{p.Phone || p.PhoneNumber || '—'}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="profile-empty">No phone numbers on file.</p>}
                </div>

                {/* Website */}
                {website && (
                    <div className="profile-section">
                        <h3><Globe size={18} /> Website</h3>
                        <div className="profile-list">
                            <div className="profile-list-item">
                                <a href={website.startsWith('http') ? website : `https://${website}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="profile-list-value" style={{ color: '#009382', textDecoration: 'underline' }}>
                                    {website}
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Addresses */}
                <div className="profile-section full-width">
                    <div className="profile-section-header">
                        <h3><MapPin size={18} /> Addresses</h3>
                        <button onClick={handleAddAddress} className="btn-icon">
                            <Plus size={16} /> Add
                        </button>
                    </div>
                    {addresses.length > 0 ? (
                        <div className="profile-list">
                            {addresses.map((a) => (
                                <div key={a.AddressId} className="profile-list-item">
                                    <div className="address-content">
                                        <span className="profile-list-value">
                                            {a.StreetDetails || [a.AddressLine1, a.AddressLine2].filter(Boolean).join(', ') || 'No street details'}
                                        </span>
                                        <span className="profile-list-sub">
                                            {a.Postcode ? `Postcode: ${a.Postcode}` : ''}
                                            {a.ContactPerson ? ` • Contact: ${a.ContactPerson}` : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {a.IsPrimary && <span className="status-badge status-active">Primary</span>}
                                        <button onClick={() => handleEditAddress(a)} className="text-gray-400 hover:text-teal-600">
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="profile-empty">No addresses on file.</p>}
                </div>
            </div>

            <EditProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={{ ...person, ...name }}
                onUpdate={fetchProfile}
            />

            <EditAddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                address={editingAddress}
                onUpdate={fetchProfile}
            />
        </div>
    );
}
