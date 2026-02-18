/**
 * =============================================================================
 * MyNaati Frontend — Reset Password Page
 * =============================================================================
 * 
 * Allows users to set a new password using the token from the email link.
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword } from '../../services/auth.service';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const newPassword = watch('newPassword');

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token.');
            navigate('/login');
        }
    }, [token, navigate]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await resetPassword(token, data.newPassword, data.confirmNewPassword);
            toast.success('Password reset successful! You can now login.');
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error(error.response?.data?.message || 'Failed to reset password. Link may be expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-icon">
                            <Lock size={32} />
                        </div>
                        <h1>Password Reset Successful</h1>
                        <p>Your password has been successfully updated.</p>
                    </div>

                    <div className="auth-success">
                        <p>You will be redirected to the login page shortly.</p>
                        <Link to="/login" className="btn btn-primary btn-full">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <Lock size={32} />
                    </div>
                    <h1>Set New Password</h1>
                    <p>Please enter your new password below</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                className={errors.newPassword ? 'input-error' : ''}
                                {...register('newPassword', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters'
                                    }
                                })}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <span className="field-error"><AlertCircle size={14} /> {errors.newPassword.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmNewPassword">Confirm New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="confirmNewPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                className={errors.confirmNewPassword ? 'input-error' : ''}
                                {...register('confirmNewPassword', {
                                    required: 'Please confirm your password',
                                    validate: value => value === newPassword || 'Passwords do not match'
                                })}
                            />
                        </div>
                        {errors.confirmNewPassword && (
                            <span className="field-error"><AlertCircle size={14} /> {errors.confirmNewPassword.message}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary btn-full"
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        <Link to="/login" className="auth-link">
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <ArrowLeft size={14} /> Back to Login
                            </span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
