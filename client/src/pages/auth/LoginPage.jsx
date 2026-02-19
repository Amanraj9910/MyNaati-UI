/**
 * =============================================================================
 * MyNaati Frontend — Login Page
 * =============================================================================
 * 
 * Authentication form for existing users.
 * Uses react-hook-form for form state management and validation.
 * On success, stores JWT tokens via AuthContext and redirects to dashboard.
 * On failure, displays the error message from the API.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import * as authService from '../../services/auth.service'; // Import authService

/**
 * LoginPage component — renders the login form with validation.
 * Redirects to the originally intended page after successful login.
 */
function LoginPage() {
    const { login, completeLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // MFA State
    const [mfaStep, setMfaStep] = useState(false);
    const [tempToken, setTempToken] = useState(null);

    /** react-hook-form setup with validation rules */
    const { register, handleSubmit, formState: { errors } } = useForm();

    // Separate form for MFA to avoid conflicts? 
    // Actually, we can just use the same form instance if we clear it, but cleaner to have inputs conditional.
    // Or render different forms.

    /** Where to redirect after login (defaults to /dashboard) */
    const redirectTo = location.state?.from?.pathname || '/dashboard';

    /**
     * Handle login form submission
     */
    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            if (mfaStep) {
                // Verify MFA
                // Clean the code (remove spaces)
                const cleanCode = formData.code.replace(/\s+/g, '');
                const response = await authService.verifyMfaLogin(tempToken, cleanCode);
                completeLogin(response.data); // Ensure we pass the 'data' part if wrapper returns it
                // Wait, authService.verifyMfaLogin returns `data` directly (unwrapped from axios).
                // But the backend `verifyMfaLogin` returns `{ accessToken, ... }` inside `data` property of response?
                // Backend: `res.json({ success: true, data: result })`
                // Service: `const { data } = await api.post... return data;`
                // So service returns `{ success: true, data: { accessToken... } }`
                // So we need `response.data`.

                toast.success('Authentication verified!');
                navigate(redirectTo, { replace: true });
            } else {
                // Initial Login
                const result = await login(formData.username, formData.password);

                if (result.mfaRequired) {
                    setTempToken(result.tempToken);
                    setMfaStep(true);
                    toast.success('Two-factor authentication required.');
                } else {
                    toast.success('Welcome back!');
                    navigate(redirectTo, { replace: true });
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
            if (mfaStep) {
                // If MFA fails, maybe allow retry. 
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Header */}
                <div className="auth-header">
                    <div className="auth-icon">
                        <LogIn size={32} />
                    </div>
                    <h1>{mfaStep ? 'Security Verification' : 'Welcome Back'}</h1>
                    <p>{mfaStep ? 'Enter the code from your authenticator app' : 'Sign in to your MyNaati account'}</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">

                    {!mfaStep && (
                        <>
                            {/* Username field */}
                            <div className="form-group">
                                <label htmlFor="username">Username / Email</label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username or email"
                                    className={errors.username ? 'input-error' : ''}
                                    {...register('username', {
                                        required: 'Username is required',
                                        maxLength: { value: 50, message: 'Username must be 50 characters or less' }
                                    })}
                                />
                                {errors.username && (
                                    <span className="field-error">
                                        <AlertCircle size={14} /> {errors.username.message}
                                    </span>
                                )}
                            </div>

                            {/* Password field with show/hide toggle */}
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        className={errors.password ? 'input-error' : ''}
                                        {...register('password', {
                                            required: 'Password is required',
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
                                {errors.password && (
                                    <span className="field-error">
                                        <AlertCircle size={14} /> {errors.password.message}
                                    </span>
                                )}
                            </div>

                            {/* Forgot password link */}
                            <div className="form-actions-row">
                                <Link to="/forgot-password" className="forgot-password-link">
                                    Forgot your password?
                                </Link>
                            </div>
                        </>
                    )}

                    {mfaStep && (
                        <div className="form-group">
                            <label htmlFor="code">Authenticator Code</label>
                            <input
                                id="code"
                                type="text"
                                placeholder="000 000"
                                maxLength={7} // Allow for a space
                                className={errors.code ? 'input-error' : ''}
                                style={{ letterSpacing: '0.2em', fontSize: '1.2rem', textAlign: 'center' }}
                                {...register('code', {
                                    required: 'Code is required',
                                    validate: (value) => {
                                        const clean = value.replace(/\s+/g, '');
                                        return /^[0-9]{6}$/.test(clean) || 'Must be 6 digits';
                                    }
                                })}
                                autoFocus
                                onChange={(e) => {
                                    // Optional: Auto-format with space? For now just let them type.
                                    // We could strip non-digits here if we wanted strict control.
                                }}
                            />
                            {errors.code && (
                                <span className="field-error">
                                    <AlertCircle size={14} /> {errors.code.message}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Verifying...' : (mfaStep ? 'Verify Code' : 'Sign In')}
                    </button>
                </form>

                {/* Footer links */}
                <div className="auth-footer">
                    {!mfaStep ? (
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link">Create one here</Link>
                        </p>
                    ) : (
                        <button onClick={() => setMfaStep(false)} className="btn btn-link">
                            Back to Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
