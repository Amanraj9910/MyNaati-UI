import { useState } from 'react';
import { X, ArrowRight, Loader2, FileText, Globe, Volume2 } from 'lucide-react';
import { createApplication } from '../../services/dashboard.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function NewApplicationModal({ isOpen, onClose }) {
    const [selectedType, setSelectedType] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const applicationTypes = [
        { id: 1, title: 'Certified Translator', icon: Globe, description: 'Translate written documents.' },
        { id: 2, title: 'Certified Interpreter', icon: Volume2, description: 'Interpret spoken language.' },
        { id: 3, title: 'Recognized Practicing', icon: FileText, description: 'For emerging languages.' },
    ];

    const handleSubmit = async () => {
        if (!selectedType) return;
        setIsSubmitting(true);
        try {
            await createApplication(selectedType);
            toast.success('Application started successfully');
            onClose();
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create application');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Start New Application</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-500">Select the type of credential you wish to apply for:</p>

                    <div className="grid gap-3">
                        {applicationTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = selectedType === type.id;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all ${isSelected
                                        ? 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                        }`}
                                    style={isSelected ? { borderColor: '#009382', background: 'rgba(0, 147, 130, 0.05)' } : {}}
                                >
                                    <div className="p-2 rounded-lg"
                                        style={isSelected
                                            ? { background: 'rgba(0, 147, 130, 0.1)', color: '#009382' }
                                            : { background: '#f3f4f6', color: '#6b7280' }
                                        }>
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold" style={isSelected ? { color: '#005f54' } : { color: '#111827' }}>{type.title}</h4>
                                        <p className="text-sm text-gray-500">{type.description}</p>
                                    </div>
                                    {isSelected && <div style={{ color: '#009382' }}><ArrowRight size={20} /></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedType || isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: '#009382' }}
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Start Application'}
                    </button>
                </div>
            </div>
        </div>
    );
}
