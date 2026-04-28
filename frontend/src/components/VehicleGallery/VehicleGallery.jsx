import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../../services/api';
import TripEstimatorModal from '../TripEstimator/TripEstimatorModal';
import './VehicleGallery.css';


function VehicleGallery() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estimatorModalOpen, setEstimatorModalOpen] = useState(false);
    const [estimatorVehicle, setEstimatorVehicle] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await apiFetch('/api/vehicles/rent');
            if (!response.ok) throw new Error("Failed to fetch vehicles");
            const data = await response.json();
            setVehicles(data);
        } catch (err) {
            console.error(err);
            setError("Could not load vehicles. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = (vehicleId) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            navigate(`/booking?vehicleId=${vehicleId}`);
        } else {
            navigate('/login', { state: { from: `/booking?vehicleId=${vehicleId}` } });
        }
    };

    if (loading) return (
        <div className="gallery-layout">
            <div className="gallery-loader">
                <div className="loader-spinner"></div>
                <p>Loading Premium Fleet...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="gallery-layout">
            <div className="gallery-error">
                <p>⚠️ {error}</p>
                <button onClick={fetchVehicles} className="book-btn" style={{ width: 'auto', marginTop: '20px' }}>Try Again</button>
            </div>
        </div>
    );

    const availableVehicles = vehicles.filter(vehicle => vehicle.status === 'Available');

    return (
        <div className="gallery-layout">
            <header className="gallery-header">
                <h1>Our Premium Fleet</h1>
                <p>Experience the ultimate in luxury and performance with our curated collection of high-end vehicles.</p>
                <div className="header-line"></div>
            </header>

            <div className="vehicle-grid">
                {availableVehicles.length > 0 ? (
                    availableVehicles.map(vehicle => (
                        <div key={vehicle.vehicleRentId} className="vehicle-card">
                            <div className="v-badge">{vehicle.type}</div>
                            <div className="v-image-container">
                                {vehicle.images && vehicle.images.length > 0 ? (
                                    <img
                                        src={vehicle.images[0].imgUrl}
                                        alt={vehicle.name}
                                        className="v-image"
                                    />
                                ) : (
                                    <div className="v-image-placeholder">
                                        <div className="img-icon">🚗</div>
                                    </div>
                                )}
                            </div>
                            <div className="v-content">
                                <h3>{vehicle.name} <span className="v-year">({vehicle.year})</span></h3>
                                <div className="v-price">
                                    LKR {vehicle.dailyRate?.toLocaleString()} <span>/ day</span>
                                </div>

                                <div className="v-specs">
                                    <div className="spec-item">
                                        <span>⛽</span>
                                        {vehicle.fuelType}
                                    </div>
                                    <div className="spec-item">
                                        <span>⚙️</span>
                                        {vehicle.gearType}
                                    </div>
                                    <div className="spec-item">
                                        <span>💺</span>
                                        {vehicle.seats} Seats
                                    </div>
                                </div>

                                <button
                                    className="book-btn"
                                    onClick={() => handleBookNow(vehicle.vehicleRentId)}
                                >
                                    Book Now
                                </button>
                                <button 
                                    className="book-btn estimate-btn" 
                                    style={{marginTop: '10px', background: 'transparent', border: '1px solid #c9a052', color: '#c9a052'}}
                                    onClick={() => {
                                        setEstimatorVehicle(vehicle);
                                        setEstimatorModalOpen(true);
                                    }}
                                >
                                    💡 Estimate Trip Budget
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-gallery">
                        <h3>All Vehicles Currently Booked</h3>
                        <p>Our premium fleet is currently in high demand. Please check back later or contact us for special requests.</p>
                    </div>
                )}
            </div>

            <TripEstimatorModal 
                isOpen={estimatorModalOpen} 
                onClose={() => setEstimatorModalOpen(false)} 
                vehicle={estimatorVehicle} 
            />
        </div>
    );
}

export default VehicleGallery;
