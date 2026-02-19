import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, Phone } from 'lucide-react';
import { updateProfile } from '../../services/dashboard.service';
import toast from 'react-hot-toast';

export default function EditPhoneModal({ isOpen, onClose, phone, onUpdate }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const isEditMode = !!phone;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                reset({
                    Number: phone.Number || phone.Phone || '',
                    Note: phone.Note || '',
                    PrimaryContact: phone.PrimaryContact || false,
                    IncludeInPD: phone.IncludeInPD || false,
                    ExaminerCorrespondence: phone.ExaminerCorrespondence || false
                });
            } else {
                reset({
                    Number: '',
                    Note: '',
                    PrimaryContact: false,
                    IncludeInPD: false,
                    ExaminerCorrespondence: false
                });
            }
        }
    }, [isOpen, phone, isEditMode, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (isEditMode) {
                await updateProfile({
                    type: 'phone_update',
                    data: { PhoneId: phone.PhoneId, ...data }
                });
                toast.success('Phone updated successfully');
            } else {
                await updateProfile({
                    type: 'phone_create',
                    data: data
                });
                toast.success('Phone added successfully');
            }
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${isEditMode ? 'update' : 'add'} phone`);
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
                            <Phone size={20} />
                        </div>
                        {isEditMode ? 'Edit Phone Number' : 'Add Phone Number'}
                    </h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="Number">Phone Number</label>
                            <input
                                id="Number"
                                {...register('Number', { required: 'Required' })}
                                className={errors.Number ? 'input-error' : ''}
                            />
                            {errors.Number && <span className="field-error">{errors.Number.message}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="Note">Note (Optional)</label>
                            <input
                                id="Note"
                                {...register('Note')}
                                placeholder="e.g. Mobile, Work"
                            />
                        </div>

                        <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                            <label className="checkbox-label">
                                <input type="checkbox" {...register('PrimaryContact')} />
                                <span>Primary Contact Number</span>
                            </label>

                            <label className="checkbox-label">
                                <input type="checkbox" {...register('IncludeInPD')} />
                                <span>Show in Online Directory</span>
                            </label>

                            <label className="checkbox-label">
                                <input type="checkbox" {...register('ExaminerCorrespondence')} />
                                <span>For Examiner Correspondence</span>
                            </label>
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
