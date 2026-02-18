import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, User } from 'lucide-react';
import { updateProfile } from '../../services/dashboard.service';
import toast from 'react-hot-toast';

export default function EditProfileModal({ isOpen, onClose, user, onUpdate }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (isOpen && user) {
            reset({
                GivenName: user.GivenName || '',
                MiddleName: user.MiddleName || '',
                Surname: user.Surname || '',
                dateOfBirth: user.BirthDate ? new Date(user.BirthDate).toISOString().split('T')[0] : '',
                gender: user.Gender || ''
            });
        }
    }, [isOpen, user, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await updateProfile({ type: 'personal', data });
            toast.success('Profile updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                {/* Header */}
                <div className="modal-header">
                    <h3 className="modal-title">
                        <div className="modal-icon-wrapper">
                            <User size={20} />
                        </div>
                        Edit Personal Details
                    </h3>
                    <button
                        onClick={onClose}
                        className="modal-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="modal-body">
                        {/* Names Container */}
                        <div>
                            <h4 className="modal-section-title">Identity</h4>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label htmlFor="GivenName">Given Name</label>
                                    <input
                                        id="GivenName"
                                        {...register('GivenName', { required: 'Required' })}
                                        placeholder="First Name"
                                        className={errors.GivenName ? 'input-error' : ''}
                                    />
                                    {errors.GivenName && <span className="field-error">{errors.GivenName.message}</span>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="MiddleName">Middle Name</label>
                                    <input
                                        id="MiddleName"
                                        {...register('MiddleName')}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="form-group mt-2">
                                <label htmlFor="Surname">Surname</label>
                                <input
                                    id="Surname"
                                    {...register('Surname', { required: 'Required' })}
                                    placeholder="Last Name"
                                    className={errors.Surname ? 'input-error' : ''}
                                />
                                {errors.Surname && <span className="field-error">{errors.Surname.message}</span>}
                            </div>
                        </div>

                        {/* Demographics Container */}
                        <div>
                            <h4 className="modal-section-title">Demographics</h4>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label htmlFor="dateOfBirth">Date of Birth</label>
                                    <input
                                        id="dateOfBirth"
                                        type="date"
                                        {...register('dateOfBirth', { required: 'Required' })}
                                        className={errors.dateOfBirth ? 'input-error' : ''}
                                    />
                                    {errors.dateOfBirth && <span className="field-error">{errors.dateOfBirth.message}</span>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="gender">Gender</label>
                                    <div className="relative">
                                        <select
                                            id="gender"
                                            {...register('gender')}
                                        >
                                            <option value="">Select...</option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                            <option value="X">Non-binary / Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
