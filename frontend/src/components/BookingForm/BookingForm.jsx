import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiFetch from '../../services/api';
import toast from 'react-hot-toast';
import ReviewSection from '../Review/ReviewSection';
import './BookingForm.css';

function BookingForm() {
    const [searchParams] = useSearchParams();
    const vehicleId = searchParams.get('vehicleId');
    const startParam = searchParams.get('start') || '';
    const endParam = searchParams.get('end') || '';
    const navigate = useNavigate();

    const [vehicle, setVehicle] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const [formData, setFormData] = useState({
        customerId: '',
        vehicleRentId: vehicleId || '',
        startDate: startParam,
        endDate: endParam
    });

    // Promo Code States
    const [promoCode, setPromoCode] = useState("");
    const [discountDetails, setDiscountDetails] = useState(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [promoError, setPromoError] = useState(null);

    const [error, setError] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setFormData(prev => ({ ...prev, customerId: user.userId }));
        }

        if (vehicleId) {
            fetchVehicleDetails();
        }
    }, [vehicleId]);

    const fetchVehicleDetails = async () => {
        try {
            const response = await apiFetch(`/api/vehicles/rent/${vehicleId}`);
            if (!response.ok) throw new Error("Vehicle not found");
            const data = await response.json();
            setVehicle(data);
        } catch (err) {
            console.error(err);
            setError("Could not load vehicle details.");
        }
    };

    const checkAvailability = async (start, end) => {
        if (!vehicleId || !start || !end) return;
        setCheckingAvailability(true);
        try {
            const response = await apiFetch(`/api/bookings/check-availability?vehicleId=${vehicleId}&startDate=${start}&endDate=${end}`);
            const available = await response.json();
            setIsAvailable(available);
            if (!available) {
                toast.error("This vehicle is already booked for the selected dates.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        // Reset discount if dates change as basic price changes
        if (name === 'startDate' || name === 'endDate') {
            setDiscountDetails(null);
            setPromoError(null);
            if (newFormData.startDate && newFormData.endDate) {
                checkAvailability(newFormData.startDate, newFormData.endDate);
            }
        }
    };

    const calculateTotalCost = () => {
        if (formData.startDate && formData.endDate && vehicle) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const timeDifference = end.getTime() - start.getTime();
            const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;

            if (dayDifference > 0) {
                return {
                    days: dayDifference,
                    total: dayDifference * vehicle.dailyRate
                };
            }
        }
        return null;
    };

    const costDetails = calculateTotalCost();

    const handleApplyPromo = async () => {
        if (!costDetails) {
            toast.error("Please select dates first.");
            return;
        }
        if (!promoCode) return;

        setIsApplyingPromo(true);
        setPromoError(null);
        try {
            const res = await apiFetch('/api/v1/promotions/calculate', {
                method: 'POST',
                body: JSON.stringify({
                    basePrice: costDetails.total,
                    promoCode: promoCode,
                    customerId: formData.customerId
                })
            });

            if (res.ok) {
                const data = await res.json();
                setDiscountDetails(data);
                toast.success("Promo code applied successfully!");
            } else {
                const errorData = await res.json();
                setDiscountDetails(null);
                setPromoError(errorData.message || "Invalid or expired promo code.");
            }
        } catch (err) {
            setPromoError("Error validating promo code.");
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAvailable) {
            toast.error("Cannot proceed. Vehicle is not available for these dates.");
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(formData.startDate);
        if (start < today) {
            toast.error("Start date cannot be in the past.");
            return;
        }
        if (costDetails === null) {
            toast.error("Return date must be at or after the Pick-up date.");
            return;
        }

        const finalTotalCost = discountDetails ? discountDetails.finalPrice : costDetails.total;

        const loadingToast = toast.loading("Processing your booking...");
        try {
            const response = await apiFetch('/api/bookings/create', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    totalCost: finalTotalCost,
                    promoCode: discountDetails ? discountDetails.appliedPromoCode : null
                }),
            });
            if (response.ok) {
                toast.success("Booking Request Sent Successfully!", { id: loadingToast });
                const data = await response.json();
                navigate('/payment', {
                    state: {
                        bookingId: data.bookingId,
                        totalCost: data.totalCost,
                        vehicleName: vehicle.name
                    }
                });
            } else {
                const errText = await response.text();
                toast.error(errText, { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error("Network error! Please check if the backend is running.", { id: loadingToast });
        }
    };

    if (!vehicle && !error) return <div className="booking-loader">Loading vehicle details...</div>;

    const currentTotal = discountDetails ? discountDetails.finalPrice : (costDetails ? costDetails.total : 0);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            <div className="booking-page-container">
                <div className="car-details-section">
                    <div className="car-breadcrumb">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        {vehicle?.type}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        {vehicle?.name}
                    </div>

                    <h1 className="car-title">{vehicle?.name}</h1>
                    <p className="car-subtitle">Premium {vehicle?.type} ℹ️</p>


                    <div className="features-container">
                        <span className="feature-badge">🕹️ {vehicle?.gearType}</span>
                        <span className="feature-badge">👤 {vehicle?.seats} seats</span>
                        <span className="feature-badge">⛽ {vehicle?.fuelType}</span>
                        <span className="feature-badge">❄️ Air Conditioning</span>
                    </div>

                    <div className="car-description-card">
                        <h3>About this vehicle</h3>
                        <p>{vehicle?.description}</p>
                    </div>

                    <div className="car-specs-grid">
                        <div className="spec-item">
                            <span className="spec-label">Fuel Efficiency</span>
                            <span className="spec-value">{vehicle?.avgFuelEfficiency}</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Fuel Type</span>
                            <span className="spec-value">{vehicle?.fuelType}</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Mileage Limit</span>
                            <span className="spec-value">{vehicle?.mileageLimit} km/day</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Year</span>
                            <span className="spec-value">{vehicle?.year}</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Extra Mileage</span>
                            <span className="spec-value">Rs. {vehicle?.extraMileageCharge}/km</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Transmission</span>
                            <span className="spec-value">{vehicle?.gearType}</span>
                        </div>
                    </div>

                    <div className="included-offers">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Included in your offer
                        </h3>
                        <ul>
                            {[
                                'Standard Insurance',
                                '24/7 Roadside Assistance',
                                'Clean and Sanitized Vehicle',
                                'Transparent Pricing'
                            ].map((item, i) => (
                                <li key={i}>
                                    <span className="check-mark">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="booking-card-section">
                    <div className="car-image-wrapper">
                        <img
                            src={vehicle?.images?.[0]?.imgUrl || "/car-placeholder.png"}
                            alt={vehicle?.name}
                            className="car-image"
                        />
                        <div className="price-tag">
                            <span className="price-amount">Rs. {vehicle?.dailyRate?.toLocaleString()}</span>
                            <span className="price-unit">per day</span>
                        </div>
                    </div>

                    <div className="booking-card">
                        <h2 className="booking-card-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Book this Vehicle
                        </h2>

                        {checkingAvailability && <p className="availability-notice">Checking availability...</p>}
                        {!isAvailable && !checkingAvailability && <p className="availability-error">🚫 Not available for these dates</p>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Pick-up Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Return Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    min={formData.startDate || new Date().toISOString().split("T")[0]}
                                />
                            </div>

                            {costDetails && (
                                <div className="price-summary-box">
                                    <div className="price-row">
                                        <span>Rs. {vehicle.dailyRate?.toLocaleString()} × {costDetails.days} days</span>
                                        <span>Rs. {costDetails.total.toLocaleString()}</span>
                                    </div>

                                    {discountDetails && (
                                        <div className="price-row discount-row">
                                            <span>Discount ({discountDetails.discountPercent}%)</span>
                                            <span>- Rs. {discountDetails.discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    {/* Promo Code Input Section */}
                                    <div className="promo-section">
                                        <div className="promo-input-group">
                                            <input
                                                type="text"
                                                className="form-input promo-input"
                                                placeholder="Enter Promo Code"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                disabled={discountDetails}
                                            />
                                            <button
                                                type="button"
                                                className="promo-apply-btn"
                                                onClick={handleApplyPromo}
                                                disabled={isApplyingPromo || discountDetails || !promoCode}
                                            >
                                                {isApplyingPromo ? "..." : "Apply"}
                                            </button>
                                        </div>
                                        {discountDetails && <div className="promo-msg promo-success">✓ Code {discountDetails.appliedPromoCode} applied!</div>}
                                        {promoError && <div className="promo-msg promo-error">✗ {promoError}</div>}
                                    </div>

                                    <hr className="price-divider" />

                                    <div className="price-row total-row">
                                        <span>Total Fee</span>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {discountDetails && <span className="strike-price">Rs. {costDetails.total.toLocaleString()}</span>}
                                            <span className="total-amount">Rs. {currentTotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="submit-btn" disabled={!isAvailable || checkingAvailability}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                                {checkingAvailability ? "Checking..." : "Book Now"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* INTEGRATED REVIEW SECTION - AT THE VERY BOTTOM */}
            <div style={{ width: '100%', marginTop: '60px' }}>
                <ReviewSection vehicleId={vehicleId} />
            </div>
        </div>
    );
}

export default BookingForm;