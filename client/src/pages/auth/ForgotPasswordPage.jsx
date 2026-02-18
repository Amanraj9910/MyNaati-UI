/**
 * =============================================================================
 * MyNaati Frontend — Forgot Password Page
 * =============================================================================
 * 
 * Allows users to request a password reset by entering their email.
 * Always shows a success message to prevent email enumeration attacks.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../../services/auth.service';
import toast from 'react-hot-toast';

function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await forgotPassword(formData.email);
            setSubmitted(true);
            toast.success('If the email exists, a reset link has been sent.');
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <Mail size={32} />
                    </div>
                    <h1>Reset Password</h1>
                    <p>Enter your email to receive a password reset link</p>
                </div>

                {submitted ? (
                    /* Success state — show confirmation */
                    <div className="auth-success">
                        <p>If an account exists with that email, we've sent a password reset link to it. Please check your inbox.</p>
                        <Link to="/login" className="btn btn-primary btn-full">
                            <ArrowLeft size={16} /> Return to Login
                        </Link>
                    </div>
                ) : (
                    /* Email input form */
                    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your registered email"
                                className={errors.email ? 'input-error' : ''}
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                            />
                            {errors.email && (
                                <span className="field-error"><AlertCircle size={14} /> {errors.email.message}</span>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                {!submitted && (
                    <div className="auth-footer">
                        <p>
                            <Link to="/login" className="auth-link">
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <ArrowLeft size={14} /> Back to Login
                                </span>
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
