import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiFetch from '../../services/api';
import './VehicleSaleDetails.css';

function VehicleSaleDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [negotiateMessage, setNegotiateMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchVehicleDetails();
        // eslint-disable-next-line
    }, [id]);

    const fetchVehicleDetails = async () => {
        try {
            setLoading(true);
            const response = await apiFetch(`/api/vehicles/public/sale/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Vehicle not found or no longer available.");
                }
                throw new Error("Failed to fetch vehicle details.");
            }
            const data = await response.json();
            setVehicle(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const initiateBuyNow = () => {
        if (!user || !user.token) {
            alert("You must be logged in to inquire about a vehicle.");
            navigate('/login');
            return;
        }
        setShowConfirmModal(true);
    };

    const handleConfirmBuyNow = async () => {
        await executeInquiryPost("I am ready to proceed with documentation and purchase.", 'BUY_NOW');
        setShowConfirmModal(false);
    };

    const handleNegotiateSubmit = async () => {
        if (!user || !user.token) {
            alert("You must be logged in to inquire about a vehicle.");
            navigate('/login');
            return;
        }
        if (!negotiateMessage.trim()) {
            alert("Validation Error: Please enter a message or proposed price.");
            return;
        }
        await executeInquiryPost(negotiateMessage.trim(), 'NEGOTIATION');
    };

    const executeInquiryPost = async (messagePayload, inquiryType) => {
        const loggedInUserId = user?.userId || user?.id;
        if (!loggedInUserId) return;

        setSubmitting(true);
        try {
            const res = await apiFetch('/api/inquiries/customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    customerId: loggedInUserId,
                    vehicleSaleId: vehicle.id,
                    inquiryType: inquiryType,
                    message: messagePayload
                })
            });
            
            if(res.ok) {
                alert(`Your ${inquiryType === 'BUY_NOW' ? 'Purchase Request' : 'Negotiation Inquiry'} has been submitted securely.`);
                setNegotiateMessage('');
                navigate('/buy');
            } else {
                alert("Failed to submit. " + await res.text());
            }
        } catch(err) {
            alert("Network Error. Please try again.");
        }
        setSubmitting(false);
    };

    if (loading) return <div className="detail-loader">Loading vehicle specifications...</div>;
    if (error) return (
        <div className="detail-error">
            <h2>{error}</h2>
            <button className="back-btn" onClick={() => navigate('/buy')}>← Return to Gallery</button>
        </div>
    );
    if (!vehicle) return null;

    return (
        <div className="vehicle-details-page">
            <header className="details-header">
                <div>
                    <h1>Vehicle <span>Details</span></h1>
                    <p>Complete specifications and purchase options.</p>
                </div>
                <button className="back-btn" onClick={() => navigate('/buy')}>← Back to Browse</button>
            </header>

            <div className="details-grid-layout">
                {/* Left Core Panel */}
                <div className="details-core-panel">
                    <div className="image-presentation">
                        {vehicle.imageUrl ? (
                            <img src={vehicle.imageUrl} alt={vehicle.name} className="hero-img" />
                        ) : (
                            <div className="placeholder-img">Test Image</div>
                        )}
                    </div>

                    <div className="core-info-header">
                        <div className="title-block">
                            <h2>{vehicle.brand} {vehicle.name} {vehicle.yom || vehicle.yearReg || ''}</h2>
                            <p>{vehicle.brand} • {vehicle.name} • {vehicle.model || 'Standard Edition'}</p>
                        </div>
                        <div className="price-block">
                            <span className="price-label">ASKING PRICE</span>
                            <span className="price-value">Rs. {vehicle.price ? (vehicle.price / 1000000).toFixed(1) + 'M' : 'N/A'}</span>
                        </div>
                    </div>

                    <div className="tech-specs-section">
                        <h3>Technical Specifications</h3>
                        <div className="specs-grid">
                            <div className="spec-box">
                                <label>MAKE / MODEL</label>
                                <span>{vehicle.brand} {vehicle.name}</span>
                            </div>
                            <div className="spec-box">
                                <label>EDITION</label>
                                <span>{vehicle.model || 'Standard'}</span>
                            </div>
                            <div className="spec-box">
                                <label>CONDITION</label>
                                <span>{vehicle.vehicleCondition || 'Used'}</span>
                            </div>
                            <div className="spec-box">
                                <label>YOM / YOR</label>
                                <span>{vehicle.yom || vehicle.yearReg || 'N/A'}</span>
                            </div>
                            <div className="spec-box">
                                <label>TRANSMISSION</label>
                                <span>{vehicle.transmission || 'N/A'}</span>
                            </div>
                            <div className="spec-box">
                                <label>MILEAGE</label>
                                <span>{vehicle.mileage ? vehicle.mileage.toLocaleString() + ' km' : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="description-section">
                        <h3>Description</h3>
                        <div className="description-box">
                            {vehicle.description || "No detailed description provided by the seller."}
                        </div>
                    </div>

                    <div className="scan-report-section">
                        <button 
                            className={`scan-report-btn ${!vehicle.scanReportUrl ? 'disabled' : ''}`}
                            onClick={() => vehicle.scanReportUrl && window.open(vehicle.scanReportUrl, '_blank')}
                            disabled={!vehicle.scanReportUrl}
                        >
                            📄 View Scan Report
                        </button>
                    </div>
                </div>

                {/* Right Action Panel */}
                <div className="details-action-panel">
                    <div className="action-card primary-action">
                        <div className="action-icon">🛒</div>
                        <h3>Ready to Purchase?</h3>
                        <p>Initiate the buying process today. Our team will contact you to finalize the paperwork.</p>
                        <button 
                            className="buy-now-btn" 
                            onClick={initiateBuyNow}
                            disabled={submitting}
                        >
                            {submitting ? 'Processing...' : 'Buy Now'}
                        </button>
                    </div>

                    <div className="action-card secondary-action">
                        <div className="action-icon-small">💬</div>
                        <h3>Negotiate Price</h3>
                        <textarea 
                            placeholder="E.g. My budget is Rs. 12M. Let me know if we can negotiate."
                            value={negotiateMessage}
                            onChange={(e) => setNegotiateMessage(e.target.value)}
                            rows="4"
                        ></textarea>
                        <button 
                            className="negotiate-btn"
                            onClick={handleNegotiateSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Sending...' : 'Send Inquiry'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm Purchase Modal */}
            {showConfirmModal && (
                <div className="buy-confirm-modal-overlay">
                    <div className="buy-confirm-box">
                        <div className="confirm-icon-circle">✓</div>
                        <h3>Confirm Purchase Interest</h3>
                        <p className="confirm-subtitle">You are about to initiate the purchase for <br/><span>{vehicle.brand} {vehicle.name} {vehicle.yom || vehicle.yearReg || ''}</span></p>

                        <div className="confirm-price-box">
                            <span className="box-label">Vehicle Price</span>
                            <span className="box-val">Rs. {vehicle.price ? (vehicle.price / 1000000).toFixed(1) + 'M' : 'N/A'}</span>
                        </div>

                        <p className="confirm-disclaimer">
                            *By clicking confirm, an official purchase inquiry will be sent to our administration. 
                            The vehicle owner or car sale company will contact you via your registered phone number.
                        </p>

                        <button 
                            className="confirm-purchase-btn" 
                            onClick={handleConfirmBuyNow}
                            disabled={submitting}
                        >
                            {submitting ? 'Confirming...' : 'Confirm Purchase Request'}
                        </button>
                        
                        <button className="cancel-confirm-btn" onClick={() => setShowConfirmModal(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VehicleSaleDetails;
