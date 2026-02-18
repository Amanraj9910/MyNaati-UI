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
                IsPrimary: address?.IsPrimary || false
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin size={20} style={{ color: '#009382' }} />
                        {isEditing ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Street Details</label>
                        <textarea
                            {...register('StreetDetails', { required: 'Required' })}
                            rows={3}
                            placeholder="Unit 1, 123 Example St, Suburb, State 2000"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all resize-none"
                            style={{ '--tw-ring-color': '#009382' }}
                        />
                        {errors.StreetDetails && <span className="text-xs text-red-500">{errors.StreetDetails.message}</span>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <input
                            {...register('Note')}
                            placeholder="E.g., delivery instructions"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all"
                            style={{ '--tw-ring-color': '#009382' }}
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isPrimary"
                            {...register('IsPrimary')}
                            className="w-4 h-4 border-gray-300 rounded"
                            style={{ accentColor: '#009382' }}
                        />
                        <label htmlFor="isPrimary" className="text-sm text-gray-700 cursor-pointer">Set as Primary Address</label>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                            style={{ background: '#009382' }}
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Address
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
