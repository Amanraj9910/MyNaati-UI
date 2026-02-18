import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, BookOpen } from 'lucide-react';
import { addLogbookEntry, getPDCategories } from '../../services/dashboard.service';
import toast from 'react-hot-toast';

export default function AddLogbookEntryModal({ isOpen, onClose, onAdd }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (isOpen) {
            reset();
            getPDCategories().then(res => setCategories(res.data || res)).catch(console.error);
        }
    }, [isOpen, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await addLogbookEntry(data);
            toast.success('Activity logged successfully');
            onAdd();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to log activity');
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
                        <BookOpen size={20} style={{ color: '#009382' }} />
                        Log New Activity
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Activity Date</label>
                        <input
                            type="date"
                            {...register('ActivityDate', { required: 'Required' })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all"
                            style={{ '--tw-ring-color': '#009382' }}
                        />
                        {errors.ActivityDate && <span className="text-xs text-red-500">{errors.ActivityDate.message}</span>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select
                            {...register('CategoryId', { required: 'Required' })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all bg-white"
                            style={{ '--tw-ring-color': '#009382' }}
                        >
                            <option value="">Select Category...</option>
                            {categories.map(c => (
                                <option key={c.ProfessionalDevelopmentCategoryId} value={c.ProfessionalDevelopmentCategoryId}>
                                    {c.Name}
                                </option>
                            ))}
                        </select>
                        {errors.CategoryId && <span className="text-xs text-red-500">{errors.CategoryId.message}</span>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            {...register('Description', { required: 'Required' })}
                            rows={3}
                            placeholder="Details of the activity..."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all resize-none"
                            style={{ '--tw-ring-color': '#009382' }}
                        />
                        {errors.Description && <span className="text-xs text-red-500">{errors.Description.message}</span>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Hours / Points</label>
                        <input
                            type="number"
                            step="0.5"
                            {...register('Hours', { required: 'Required', min: 0 })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all"
                            style={{ '--tw-ring-color': '#009382' }}
                        />
                        {errors.Hours && <span className="text-xs text-red-500">{errors.Hours.message}</span>}
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
                            Save Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
