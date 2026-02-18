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
        <div className="modal-overlay">
            <div className="modal-container">
                {/* Header */}
                <div className="modal-header">
                    <h3 className="modal-title">
                        <div className="modal-icon-wrapper">
                            <BookOpen size={20} />
                        </div>
                        Log New Activity
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
                        {/* Date & Category Row */}
                        <div className="grid-2">
                            <div className="form-group">
                                <label htmlFor="ActivityDate">Date</label>
                                <input
                                    id="ActivityDate"
                                    type="date"
                                    {...register('ActivityDate', { required: 'Required' })}
                                    className={errors.ActivityDate ? 'input-error' : ''}
                                />
                                {errors.ActivityDate && <span className="field-error">{errors.ActivityDate.message}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="CategoryId">Category</label>
                                <div className="relative">
                                    <select
                                        id="CategoryId"
                                        {...register('CategoryId', { required: 'Required' })}
                                        className={errors.CategoryId ? 'input-error' : ''}
                                    >
                                        <option value="">Select...</option>
                                        {categories.map(c => (
                                            <option key={c.ProfessionalDevelopmentCategoryId} value={c.ProfessionalDevelopmentCategoryId}>
                                                {c.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.CategoryId && <span className="field-error">{errors.CategoryId.message}</span>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label htmlFor="Description">Description</label>
                            <textarea
                                id="Description"
                                {...register('Description', { required: 'Required' })}
                                rows={3}
                                placeholder="Describe the activity..."
                                className={errors.Description ? 'input-error' : ''}
                                style={{ resize: 'none' }}
                            />
                            {errors.Description && <span className="field-error">{errors.Description.message}</span>}
                        </div>

                        {/* Hours/Points */}
                        <div className="form-group">
                            <label htmlFor="Hours">Hours / Points</label>
                            <input
                                id="Hours"
                                type="number"
                                step="0.5"
                                {...register('Hours', { required: 'Required', min: 0 })}
                                placeholder="0.0"
                                className={errors.Hours ? 'input-error' : ''}
                            />
                            {errors.Hours && <span className="field-error">{errors.Hours.message}</span>}
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
                            Save Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
