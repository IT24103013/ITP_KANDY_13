import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomePage.css';
import PromoBanner from '../Promotion/PromoBanner';

function HomePage() {
    const navigate = useNavigate();

    const handleAction = (type) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (type === 'rent') {
            if (user && user.token) {
                navigate('/rent');
            } else {
                navigate('/login', { state: { from: '/rent' } });
            }
        } else if (type === 'buy') {
            navigate('/buy');
        }
    };

    const features = [
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
            ),
            title: 'Rental Estimates',
            description: 'Calculate your vehicle rental costs instantly with our live promotion rules & long-term discounts.',
            cta: 'Try Calculator',
            action: () => handleAction('rent'),
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ),
            title: 'Client Feedback',
            description: 'Read verified owner experiences and testimonials from the Samarasinghe Motors community.',
            cta: 'View Reviews',
            action: () => navigate('/'),
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
            ),
            title: 'Buy Vehicles',
            description: 'Browse our premium vehicle showroom and find your perfect car to purchase.',
            cta: 'Browse Fleet',
            action: () => handleAction('buy'),
        },
    ];

    const stats = [
        { value: '500+', label: 'Vehicles Available' },
        { value: '2,000+', label: 'Happy Clients' },
        { value: '15+', label: 'Years of Service' },
        { value: '4.9★', label: 'Average Rating' },
    ];

    return (
        <div className="home-container">
            <PromoBanner />

            {/* ── HERO ── */}
            <section className="hero-section">
                <div className="hero-glow" />
                <div className="hero-inner">
                    <p className="hero-eyebrow">Premium Vehicle Rentals &amp; Sales</p>
                    <h1 className="hero-title">
                        Samarasinghe<span className="hero-title-gold">Motors</span>
                    </h1>
                    <p className="hero-subtitle">
                        Welcome to the premium portal for Samarasinghe Motors. Manage your
                        rentals, view client testimonials, and access administrative tools
                        seamlessly.
                    </p>
                    <div className="hero-actions">
                        <button className="hero-btn hero-btn-primary" onClick={() => handleAction('rent')}>
                            Rent a Vehicle
                            <svg className="btn-arrow" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                            </svg>
                        </button>
                        <button className="hero-btn hero-btn-outline" onClick={() => handleAction('buy')}>
                            Browse for Sale
                        </button>
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ── */}
            <section className="stats-bar">
                {stats.map((s, i) => (
                    <div key={i} className="stat-item">
                        <span className="stat-value">{s.value}</span>
                        <span className="stat-label">{s.label}</span>
                    </div>
                ))}
            </section>

            {/* ── FEATURE CARDS ── */}
            <section className="features-section">
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div key={i} className="feature-card">
                            <div className="feature-icon-wrap">
                                {f.icon}
                            </div>
                            <h2 className="feature-title">{f.title}</h2>
                            <p className="feature-desc">{f.description}</p>
                            <button className="feature-cta" onClick={f.action}>
                                {f.cta}
                                <svg className="cta-arrow" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default HomePage;
