/**
 * =============================================================================
 * MyNaati Frontend — Change Password Page
 * =============================================================================
 * 
 * Authenticated page for changing the current user's password.
 * Requires the current password for verification before allowing the change.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import * as authService from '../../services/auth.service';
import toast from 'react-hot-toast';

function ChangePasswordPage() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
    const watchNewPassword = watch('newPassword');

    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await authService.changePassword(
                formData.currentPassword,
                formData.newPassword,
                formData.confirmNewPassword
            );
            toast.success('Password changed successfully!');
            reset();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to change password.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="content-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="card-header">
                    <Lock size={24} />
                    <h2>Change Password</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    {/* Current Password */}
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="currentPassword"
                                type={showCurrentPassword ? 'text' : 'password'}
                                placeholder="Enter your current password"
                                className={errors.currentPassword ? 'input-error' : ''}
                                {...register('currentPassword', { required: 'Current password is required' })}
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.currentPassword && <span className="field-error"><AlertCircle size={14} /> {errors.currentPassword.message}</span>}
                    </div>

                    {/* New Password */}
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Enter your new password"
                                className={errors.newPassword ? 'input-error' : ''}
                                {...register('newPassword', {
                                    required: 'New password is required',
                                    minLength: { value: 8, message: 'At least 8 characters' },
                                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must contain uppercase, lowercase, and number' }
                                })}
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.newPassword && <span className="field-error"><AlertCircle size={14} /> {errors.newPassword.message}</span>}
                    </div>

                    {/* Confirm New Password */}
                    <div className="form-group">
                        <label htmlFor="confirmNewPassword">Confirm New Password</label>
                        <input
                            id="confirmNewPassword"
                            type="password"
                            placeholder="Confirm your new password"
                            className={errors.confirmNewPassword ? 'input-error' : ''}
                            {...register('confirmNewPassword', {
                                required: 'Please confirm your new password',
                                validate: (value) => value === watchNewPassword || 'Passwords do not match'
                            })}
                        />
                        {errors.confirmNewPassword && <span className="field-error"><AlertCircle size={14} /> {errors.confirmNewPassword.message}</span>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChangePasswordPage;
