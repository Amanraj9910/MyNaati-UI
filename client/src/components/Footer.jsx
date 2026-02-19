/**
 * =============================================================================
 * MyNaati Frontend — Footer Component
 * =============================================================================
 * 
 * Site-wide footer displayed at the bottom of every page.
 * Contains copyright, privacy links, and NAATI contact information.
 */

import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

/**
 * Footer component — consistent bottom section across all pages.
 */
function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h4 className="footer-title">MyNaati Portal</h4>
                    <p className="footer-text">
                        National Accreditation Authority for Translators and Interpreters
                    </p>
                </div>

                <div className="footer-section">
                    <h4 className="footer-title">Quick Links</h4>
                    <ul className="footer-links">
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/learn-more">Learn More</Link></li>
                        <li><a href="https://www.naati.com.au" target="_blank" rel="noreferrer">NAATI Website <ExternalLink size={12} /></a></li>
                        <li><a href="https://www.naati.com.au/contact-us/" target="_blank" rel="noreferrer">Contact Us</a></li>
                        <li><a href="https://www.naati.com.au/privacy-policy/" target="_blank" rel="noreferrer">Privacy Policy</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-title">Support</h4>
                    <p className="footer-text">
                        Need help? Contact NAATI support at<br />
                        <a href="mailto:info@naati.com.au">info@naati.com.au</a>
                    </p>
                </div>

                <div className="footer-bottom">
                    <p>© {currentYear} NAATI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
