import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, MapPin } from 'lucide-react';
import { updateProfile } from '../../services/dashboard.service';
import toast from 'react-hot-toast';

export default function EditAddressModal({ isOpen, onClose, address, onUpdate }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const isEditing = !!address;

    useEffect(() => {
        if (isOpen) {
            reset({
                StreetDetails: address?.StreetDetails || '',
                Note: address?.Note || '',
                IsPrimary: address?.IsPrimary || false,
                CountryId: address?.CountryId || 1 // Default to 1 (Australia)
            });
        }
    }, [isOpen, address, reset]);

    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await updateProfile({
                type: 'address',
                data: { ...formData, addressId: address?.AddressId }
            });
            toast.success(`Address ${isEditing ? 'updated' : 'added'} successfully`);
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save address');
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
                            <MapPin size={20} />
                        </div>
                        {isEditing ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="modal-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <input type="hidden" {...register('CountryId')} />
                    <div className="modal-body">
                        {/* Street Details */}
                        <div className="form-group">
                            <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                                <label htmlFor="StreetDetails">Street Details</label>
                                <span className="text-xs text-muted">Required</span>
                            </div>
                            <textarea
                                id="StreetDetails"
                                {...register('StreetDetails', { required: 'Street details are required' })}
                                rows={3}
                                placeholder="Unit 1, 123 Example St&#10;Suburb, State 2000"
                                className={errors.StreetDetails ? 'input-error' : ''}
                                style={{ resize: 'none' }}
                            />
                            {errors.StreetDetails && (
                                <span className="field-error">
                                    {errors.StreetDetails.message}
                                </span>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="form-group">
                            <label htmlFor="Note">Notes <span className="text-muted font-normal">(Optional)</span></label>
                            <input
                                id="Note"
                                {...register('Note')}
                                placeholder="E.g., delivery instructions"
                            />
                        </div>

                        {/* Primary Checkbox */}
                        <label
                            className="checkbox-wrapper"
                            htmlFor="isPrimary"
                        >
                            <input
                                type="checkbox"
                                id="isPrimary"
                                {...register('IsPrimary')}
                                className="custom-checkbox"
                            />
                            <span className="cursor-pointer select-none" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text)' }}>
                                Set as Primary Address
                            </span>
                        </label>
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
                            Save Address
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
