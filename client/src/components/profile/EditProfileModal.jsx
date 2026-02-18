import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2 } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Personal Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Given Name</label>
                            <input
                                {...register('GivenName', { required: 'Required' })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all"
                                style={{ '--tw-ring-color': '#009382' }}
                            />
                            {errors.GivenName && <span className="text-xs text-red-500">{errors.GivenName.message}</span>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Middle Name</label>
                            <input
                                {...register('MiddleName')}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all"
                                style={{ '--tw-ring-color': '#009382' }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Surname</label>
                        <input
                            {...register('Surname', { required: 'Required' })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all"
                            style={{ '--tw-ring-color': '#009382' }}
                        />
                        {errors.Surname && <span className="text-xs text-red-500">{errors.Surname.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                                type="date"
                                {...register('dateOfBirth', { required: 'Required' })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all"
                                style={{ '--tw-ring-color': '#009382' }}
                            />
                            {errors.dateOfBirth && <span className="text-xs text-red-500">{errors.dateOfBirth.message}</span>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Gender</label>
                            <select
                                {...register('gender')}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all bg-white"
                                style={{ '--tw-ring-color': '#009382' }}
                            >
                                <option value="">Select...</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="X">Non-binary / Other</option>
                            </select>
                        </div>
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
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
