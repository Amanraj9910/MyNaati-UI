import { useState } from 'react';
import { X, ArrowRight, Loader2, FileText, Globe, Volume2 } from 'lucide-react';
import { createApplication } from '../../services/dashboard.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function NewApplicationModal({ isOpen, onClose }) {
    const [selectedType, setSelectedType] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            // In a real app we might redirect to the new application or refresh the list
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
        <div className="modal-overlay">
            <div className="modal-container">
                {/* Header */}
                <div className="modal-header">
                    <h3 className="modal-title">Start New Application</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <p className="text-sm text-muted">Select the type of credential you wish to apply for:</p>

                    <div className="application-type-grid">
                        {applicationTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = selectedType === type.id;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`app-type-card ${isSelected ? 'selected' : ''}`}
                                >
                                    <div className={`app-type-icon ${isSelected ? 'selected' : ''}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="app-type-content">
                                        <h4>{type.title}</h4>
                                        <p>{type.description}</p>
                                    </div>
                                    <div className={`app-type-check ${isSelected ? 'visible' : ''}`}>
                                        <ArrowRight size={20} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedType || isSubmitting}
                        className="btn btn-primary"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Start Application'}
                    </button>
                </div>
            </div>
            <style jsx>{`
                .application-type-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .app-type-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--border-radius);
                    background: #fff;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    text-align: left;
                    width: 100%;
                }
                .app-type-card:hover {
                    background-color: #f9fafb;
                    border-color: rgba(0, 147, 130, 0.5);
                }
                .app-type-card.selected {
                    background-color: rgba(0, 147, 130, 0.05);
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 1px var(--color-primary);
                }
                .app-type-icon {
                    padding: 0.625rem;
                    background: #f1f5f9;
                    border-radius: 0.5rem;
                    color: var(--color-text-muted);
                    transition: all var(--transition-fast);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .app-type-card:hover .app-type-icon {
                    background: #fff;
                    color: var(--color-primary);
                    box-shadow: var(--shadow-sm);
                }
                .app-type-icon.selected {
                    background: #fff;
                    color: var(--color-primary);
                    box-shadow: var(--shadow-sm);
                }
                .app-type-content {
                    flex: 1;
                }
                .app-type-content h4 {
                    font-weight: 700;
                    color: var(--color-text-heading);
                    font-size: 1rem;
                    margin-bottom: 0.125rem;
                }
                .app-type-card.selected .app-type-content h4 {
                    color: var(--color-primary);
                }
                .app-type-content p {
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                }
                .app-type-check {
                    color: var(--color-primary);
                    opacity: 0;
                    transform: translateX(-0.5rem);
                    transition: all var(--transition-fast);
                }
                .app-type-check.visible {
                    opacity: 1;
                    transform: translateX(0);
                }
            `}</style>
        </div>
    );
}
