import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, Mail } from 'lucide-react';
import { updateProfile } from '../../services/dashboard.service';
import toast from 'react-hot-toast';

export default function EditEmailModal({ isOpen, onClose, onUpdate }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await updateProfile({
                type: 'email',
                data: { email: data.email }
            });
            toast.success('Email added successfully');
            reset();
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add email');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3 className="modal-title">
                        <div className="modal-icon-wrapper">
                            <Mail size={20} />
                        </div>
                        Add Email Address
                    </h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                {...register('email', {
                                    required: 'Required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                className={errors.email ? 'input-error' : ''}
                                placeholder="name@example.com"
                            />
                            {errors.email && <span className="field-error">{errors.email.message}</span>}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
