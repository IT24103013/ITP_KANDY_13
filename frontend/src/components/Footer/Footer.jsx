import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-column">
                    <h3 className="footer-logo">SAMARASINGHE MOTORS</h3>
                    <p>Premium Vehicle Rentals & Sales</p>
                    <p>123 Peradeniya Road, Kandy, Sri Lanka</p>
                    <p>+94 71 135 7818</p>
                    <a href="mailto:support@samarasinghemotors.lk" className="footer-link">support@samarasinghemotors.lk</a>
                </div>

                <div className="footer-column">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/" className="footer-link">Home</Link></li>
                        <li><Link to="/buy" className="footer-link">Browse Rental Fleet</Link></li>
                        <li><Link to="/buy" className="footer-link">Vehicles for Sale</Link></li>
                        <li><Link to="/" className="footer-link">Special Offers</Link></li>
                        <li><Link to="/login" className="footer-link">Admin Login</Link></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Support & Legal</h4>
                    <ul>
                        <li><Link to="/" className="footer-link">FAQ</Link></li>
                        <li><Link to="/" className="footer-link">Rental Terms & Conditions</Link></li>
                        <li><Link to="/" className="footer-link">Cancellation Policy</Link></li>
                        <li><Link to="/" className="footer-link">Privacy Policy</Link></li>
                        <li><Link to="/" className="footer-link">Submit a Complaint</Link></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Newsletter</h4>
                    <p>Subscribe to receive the latest promo codes and offers.</p>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Email address" />
                        <button type="submit">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        </button>
                    </form>
                    <div className="social-icons">
                        <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Samarasinghe Motors. All Rights Reserved.</p>
                <p>Powered by <a href="#" className="footer-link">DriveConnect</a></p>
            </div>
        </footer>
    );
}

export default Footer;