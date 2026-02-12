/**
 * =============================================================================
 * MyNaati Frontend — Registration Page
 * =============================================================================
 * 
 * New user registration form.
 * Collects given name, surname, email, and password.
 * Creates a full entity chain in the backend:
 *   tblEntity → tblPerson → tblPersonName → tblUser → tblMyNaatiUser
 * 
 * On success, redirects to login page with a success message.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * RegisterPage component — renders the registration form.
 * Includes password strength validation (uppercase, lowercase, number, min length).
 */
function RegisterPage() {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const watchPassword = watch('password');

    /**
     * Handle form submission — calls register via AuthContext.
     * On success: shows success toast and redirects to login.
     */
    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await registerUser(formData);
            toast.success('Account created successfully! Please log in.');
            navigate('/login');
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-wide">
                {/* Header */}
                <div className="auth-header">
                    <div className="auth-icon">
                        <UserPlus size={32} />
                    </div>
                    <h1>Create Account</h1>
                    <p>Register for a new MyNaati account</p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    {/* Name fields — two columns */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="givenName">Given Name *</label>
                            <input
                                id="givenName"
                                type="text"
                                placeholder="Enter your given name"
                                className={errors.givenName ? 'input-error' : ''}
                                {...register('givenName', {
                                    required: 'Given name is required',
                                    maxLength: { value: 100, message: 'Max 100 characters' }
                                })}
                            />
                            {errors.givenName && (
                                <span className="field-error"><AlertCircle size={14} /> {errors.givenName.message}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="surname">Surname *</label>
                            <input
                                id="surname"
                                type="text"
                                placeholder="Enter your surname"
                                className={errors.surname ? 'input-error' : ''}
                                {...register('surname', {
                                    required: 'Surname is required',
                                    maxLength: { value: 100, message: 'Max 100 characters' }
                                })}
                            />
                            {errors.surname && (
                                <span className="field-error"><AlertCircle size={14} /> {errors.surname.message}</span>
                            )}
                        </div>
                    </div>

                    {/* Email field */}
                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
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

                    {/* Password field */}
                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a strong password"
                                className={errors.password ? 'input-error' : ''}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 8, message: 'At least 8 characters' },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: 'Must contain uppercase, lowercase, and number'
                                    }
                                })}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="field-error"><AlertCircle size={14} /> {errors.password.message}</span>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password *</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            className={errors.confirmPassword ? 'input-error' : ''}
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (value) =>
                                    value === watchPassword || 'Passwords do not match'
                            })}
                        />
                        {errors.confirmPassword && (
                            <span className="field-error"><AlertCircle size={14} /> {errors.confirmPassword.message}</span>
                        )}
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* Login link */}
                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
