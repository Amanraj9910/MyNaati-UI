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

/**
 * LoginPage component — renders the login form with validation.
 * Redirects to the originally intended page after successful login.
 */
function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /** react-hook-form setup with validation rules */
    const { register, handleSubmit, formState: { errors } } = useForm();

    /** Where to redirect after login (defaults to /dashboard) */
    const redirectTo = location.state?.from?.pathname || '/dashboard';

    /**
     * Handle form submission — calls the auth service login function.
     * On success: toast notification + redirect to dashboard.
     * On error: toast notification with error message.
     */
    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await login(formData.username, formData.password);
            toast.success('Welcome back!');
            navigate(redirectTo, { replace: true });
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
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
                    <h1>Welcome Back</h1>
                    <p>Sign in to your MyNaati account</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Registration link */}
                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">Create one here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
