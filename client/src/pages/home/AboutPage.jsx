/**
 * =============================================================================
 * MyNaati Frontend — About NAATI Page
 * =============================================================================
 * 
 * Public page displaying information about NAATI.
 * Fetches content from GET /api/home/about.
 */

import { useEffect, useState } from 'react';
import * as homeService from '../../services/home.service';
import { Info, Loader, Target, Star, Award } from 'lucide-react';

function AboutPage() {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await homeService.getAboutContent();
                setContent(response.data);
            } catch (error) {
                console.error('Failed to load about content');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) {
        return <div className="page-container"><div className="loading-screen"><Loader className="spinner-icon" size={40} /><p>Loading...</p></div></div>;
    }

    return (
        <div className="page-container">
            <div className="content-card">
                <div className="card-header">
                    <Info size={28} />
                    <h1>{content?.title || 'About NAATI'}</h1>
                </div>
                <p className="content-text">{content?.content}</p>

                {/* Info sections */}
                <div className="info-sections">
                    {content?.sections?.map((section, index) => (
                        <div key={index} className="info-section">
                            <h3>{section.title}</h3>
                            <p>{section.content}</p>
                            {section.items && (
                                <ul className="info-list">
                                    {section.items.map((item, i) => (
                                        <li key={i}><Award size={14} /> {item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AboutPage;
