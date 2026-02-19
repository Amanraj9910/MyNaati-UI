/**
 * =============================================================================
 * MyNaati Frontend — My Account Page
 * =============================================================================
 * 
 * Consolidates Profile, Change Password, and MFA settings.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Shield, ArrowLeft, Loader2, MapPin, Mail, Phone, Hash, Globe, Edit2, Plus, AlertCircle, CheckCircle, XCircle, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, getCredentials, updateProfile } from '../../services/dashboard.service';
import * as authService from '../../services/auth.service';
import EditProfileModal from '../../components/profile/EditProfileModal';
import EditAddressModal from '../../components/profile/EditAddressModal';
import EditPhoneModal from '../../components/profile/EditPhoneModal';
import EditEmailModal from '../../components/profile/EditEmailModal';
import CredentialsList from '../../components/dashboard/CredentialsList';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Profile Modal State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [editingPhone, setEditingPhone] = useState(null);
    const [credentials, setCredentials] = useState([]);

    const fetchProfile = async () => {
        try {
            const res = await getProfile();
            setProfile(res.data || res);
            const creds = await getCredentials();
            setCredentials(creds.data || creds);
        } catch (err) {
            console.error('Failed to load profile', err);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="page-container">
                <div className="dashboard-loading"><Loader2 className="spinner-icon" size={32} /><p>Loading account details...</p></div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="detail-page-header">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={18} /> Dashboard</Link>
                <div className="detail-page-title">
                    <User size={28} className="detail-page-icon" style={{ color: '#009382' }} />
                    <h1>My Account</h1>
                </div>
            </div>

            <div className="account-tabs">
                <button
                    className={`account-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={18} /> My Profile
                </button>
                <button
                    className={`account-tab ${activeTab === 'credentials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('credentials')}
                >
                    <Award size={18} /> My Credentials
                </button>
                <button
                    className={`account-tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <Shield size={18} /> Security & Password
                </button>
            </div>

            <div className="account-content">
                {activeTab === 'profile' && (
                    <ProfileSection
                        profile={profile}
                        refreshProfile={fetchProfile}

                        openProfileModal={() => setIsProfileModalOpen(true)}
                        openAddressModal={(addr) => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                        openPhoneModal={(ph) => { setEditingPhone(ph); setIsPhoneModalOpen(true); }}
                        openEmailModal={() => setIsEmailModalOpen(true)}
                    />
                )}

                {activeTab === 'credentials' && (
                    <CredentialsList credentials={credentials} />
                )}

                {activeTab === 'security' && (
                    <SecuritySection user={profile?.user} refreshProfile={fetchProfile} />
                )}
            </div>

            {/* Modals */}
            <EditProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={{ ...profile?.person, ...profile?.name }}
                onUpdate={fetchProfile}
            />

            <EditAddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                address={editingAddress}
                onUpdate={fetchProfile}
            />

            <EditPhoneModal
                isOpen={isPhoneModalOpen}
                onClose={() => setIsPhoneModalOpen(false)}
                phone={editingPhone}
                onUpdate={fetchProfile}
            />

            <EditEmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                onUpdate={fetchProfile}
            />
        </div>
    );
}

function ProfileSection({ profile, openProfileModal, openAddressModal, openPhoneModal, openEmailModal }) {
    const name = profile?.name;
    const person = profile?.person;
    const addresses = profile?.addresses || [];
    const emails = profile?.emails || [];
    const phones = profile?.phones || [];
    const website = profile?.website;

    return (
        <div className="fade-in">
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
                        <button onClick={openProfileModal} className="btn-icon">
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3><Mail size={18} /> Email Addresses</h3>
                        <button className="btn-icon-primary" onClick={openEmailModal} title="Add Email">
                            <Plus size={16} /> Add
                        </button>
                    </div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3><Phone size={18} /> Phone Numbers</h3>
                        <button className="btn-icon-primary" onClick={() => openPhoneModal(null)} title="Add Phone">
                            <Plus size={16} /> Add
                        </button>
                    </div>
                    {phones.length > 0 ? (
                        <div className="profile-list">
                            {phones.map((p, i) => (
                                <div key={p.PhoneId || i} className="profile-list-item">
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="profile-list-value">{p.Number || p.Phone || '—'}</span>
                                        <span className="profile-list-sub">
                                            {p.PrimaryContact && <span className="status-badge status-active">Primary</span>}
                                            {p.IncludeInPD && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#666' }}>Public</span>}
                                        </span>
                                    </div>
                                    <button onClick={() => openPhoneModal(p)} className="btn-icon" style={{ border: 'none' }}>
                                        <Edit2 size={16} />
                                    </button>
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
                        <button onClick={() => openAddressModal(null)} className="btn-icon">
                            <Plus size={16} /> Add
                        </button>
                    </div>
                    {addresses.length > 0 ? (
                        <div className="profile-list">
                            {addresses.map((a) => (
                                <div key={a.AddressId} className="profile-list-item">
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="profile-list-value">
                                            {a.StreetDetails || [a.AddressLine1, a.AddressLine2].filter(Boolean).join(', ') || 'No street details'}
                                        </span>
                                        <span className="profile-list-sub">
                                            {a.Postcode ? `Postcode: ${a.Postcode}` : ''}
                                            {a.ContactPerson ? ` • Contact: ${a.ContactPerson}` : ''}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {a.IsPrimary && <span className="status-badge status-active">Primary</span>}
                                        <button onClick={() => openAddressModal(a)} className="btn-icon" style={{ border: 'none' }}>
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="profile-empty">No addresses on file.</p>}
                </div>
            </div>
        </div>
    );
}

function SecuritySection() {
    return (
        <div className="fade-in profile-grid">
            <ChangePasswordCard />
            <MfaCard />
        </div>
    );
}



function ChangePasswordCard() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // Watch logic matching ChangePasswordPage
    // ...

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await authService.changePassword(data.currentPassword, data.newPassword, data.confirmNewPassword);
            toast.success('Password updated successfully');
            reset();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="profile-section">
            <div className="profile-section-header">
                <h3><Lock size={18} /> Change Password</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                    <label>Current Password</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showCurrent ? "text" : "password"}
                            {...register("currentPassword", { required: "Required" })}
                        />
                        <button type="button" className="password-toggle" onClick={() => setShowCurrent(!showCurrent)}>
                            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.currentPassword && <span className="field-error">{errors.currentPassword.message}</span>}
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showNew ? "text" : "password"}
                            {...register("newPassword", {
                                required: "Required",
                                minLength: { value: 8, message: "Min 8 chars" },
                                pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: "Use Upper, Lower, Number" }
                            })}
                        />
                        <button type="button" className="password-toggle" onClick={() => setShowNew(!showNew)}>
                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.newPassword && <span className="field-error">{errors.newPassword.message}</span>}
                </div>

                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        {...register("confirmNewPassword", { required: "Required" })}
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}

import { Eye, EyeOff } from 'lucide-react';

function MfaCard() {
    const { user } = useAuth();
    const [isMfaEnabled, setIsMfaEnabled] = useState(false);
    const [setupData, setSetupData] = useState(null); // { secret, qrCodeUrl }
    const [step, setStep] = useState('status'); // 'status', 'setup', 'verify'
    const [verifyCode, setVerifyCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsMfaEnabled(user?.mfaEnabled);
        if (user?.mfaEnabled) setStep('status');
    }, [user]);

    const startSetup = async () => {
        try {
            const res = await authService.setupMfa();
            setSetupData(res.data);
            setStep('setup');
        } catch (error) {
            toast.error('Failed to start MFA setup');
        }
    };

    const confirmSetup = async () => {
        const cleanCode = verifyCode.replace(/\s+/g, '');
        if (cleanCode.length !== 6) return toast.error('Enter 6-digit code');
        setIsSubmitting(true);
        try {
            await authService.enableMfa(cleanCode);
            toast.success('MFA Enabled Successfully!');
            setIsMfaEnabled(true);
            setStep('status');
            // Optimistically update user context if possible, or reload page
            // For now, next login will enforce it.
        } catch (error) {
            toast.error('Invalid code. Try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const disableMfa = async () => {
        if (!window.confirm('Are you sure you want to disable MFA? Your account will be less secure.')) return;
        setIsSubmitting(true);
        try {
            await authService.disableMfa();
            toast.success('MFA Disabled');
            setIsMfaEnabled(false);
        } catch (error) {
            toast.error('Failed to disable MFA');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="profile-section">
            <div className="profile-section-header">
                <h3><Shield size={18} /> Multi-Factor Authentication</h3>
                <span className={`status-badge ${isMfaEnabled ? 'status-active' : 'status-pending'}`}>
                    {isMfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    Protect your account by requiring a code from your authenticator app when logging in.
                </p>

                {step === 'status' && !isMfaEnabled && (
                    <button onClick={startSetup} className="btn btn-outline">
                        Setup MFA
                    </button>
                )}

                {step === 'status' && isMfaEnabled && (
                    <button onClick={disableMfa} className="btn btn-danger-outline" disabled={isSubmitting}>
                        Disable MFA
                    </button>
                )}

                {step === 'setup' && setupData && (
                    <div className="mfa-setup-box">
                        <p>1. Scan this QR code with your authenticator app (Google Authenticator, Microsoft Authenticator).</p>
                        <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                            <img src={setupData.qrCodeUrl} alt="MFA QR Code" style={{ border: '1px solid #ddd', padding: '0.5rem', borderRadius: '8px' }} />
                        </div>
                        <p>2. Enter the 6-digit code below to verify.</p>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <input
                                type="text"
                                value={verifyCode}
                                onChange={(e) => setVerifyCode(e.target.value)}
                                placeholder="000 000"
                                maxLength={7}
                                style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.2rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={confirmSetup} className="btn btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Verifying...' : 'Verify & Enable'}
                            </button>
                            <button onClick={() => setStep('status')} className="btn btn-ghost">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
