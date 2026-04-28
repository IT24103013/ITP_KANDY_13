import React from 'react';
import { useNavigate } from 'react-router-dom';
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

    return (
        <div className="home-container">
            <PromoBanner />
            <div className="hero-section">
                <div className="action-buttons-container">
                    <button 
                        className="hero-btn rent-btn"
                        onClick={() => handleAction('rent')}
                    >
                        Rent Vehicles
                    </button>
                    <button 
                        className="hero-btn buy-btn"
                        onClick={() => handleAction('buy')}
                    >
                        Buy Vehicles
                    </button>
                </div>
            </div>
            <div className="hero-divider"></div>
            <div className="bottom-section">
                {/* Future content goes here */}
            </div>
        </div>
    );
}

export default HomePage;
