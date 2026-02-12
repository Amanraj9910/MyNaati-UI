/**
 * =============================================================================
 * MyNaati Frontend — Learn More Page
 * =============================================================================
 * 
 * Public page with expandable sections about NAATI services.
 * Fetches content from GET /api/home/learn-more.
 */

import { useEffect, useState } from 'react';
import * as homeService from '../../services/home.service';
import { BookOpen, ChevronDown, ChevronUp, Loader } from 'lucide-react';

function LearnMorePage() {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openSection, setOpenSection] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await homeService.getLearnMoreContent();
                setContent(response.data);
            } catch (error) {
                console.error('Failed to load learn more content');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    /** Toggle accordion section open/close */
    const toggleSection = (id) => {
        setOpenSection(openSection === id ? null : id);
    };

    if (loading) {
        return <div className="page-container"><div className="loading-screen"><Loader className="spinner-icon" size={40} /><p>Loading...</p></div></div>;
    }

    return (
        <div className="page-container">
            <div className="content-card">
                <div className="card-header">
                    <BookOpen size={28} />
                    <h1>{content?.title || 'Learn More'}</h1>
                </div>

                {/* Accordion sections */}
                <div className="accordion">
                    {content?.sections?.map((section) => (
                        <div key={section.id} className={`accordion-item ${openSection === section.id ? 'active' : ''}`}>
                            <button className="accordion-header" onClick={() => toggleSection(section.id)}>
                                <span>{section.title}</span>
                                {openSection === section.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {openSection === section.id && (
                                <div className="accordion-body">
                                    <p>{section.content}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LearnMorePage;
