import React, { useState, useEffect } from 'react';
import apiFetch from '../../services/api';
import { Calendar, History, Star, MessageCircle, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const RentalHistory = ({ currentUserId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Review Modal States
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hover, setHover] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await apiFetch(`/api/bookings/customer/${currentUserId}/history`);
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                } else {
                    setError("Failed to fetch rental history data.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (currentUserId) {
            fetchHistory();
        }
    }, [currentUserId]);

    const handleOpenReview = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowModal(true);
        setRating(0);
        setComment("");
    };

    const submitReview = async () => {
        if (rating === 0) return toast.error("Please select a rating.");
        setSubmitting(true);
        try {
            const res = await apiFetch('/api/reviews/submit', {
                method: 'POST',
                body: JSON.stringify({
                    vehicleRentId: selectedVehicle.vehicleRentId,
                    rating: rating,
                    comment: comment
                })
            });
            if (res.ok) {
                toast.success("Review posted successfully!");
                setShowModal(false);
            } else {
                toast.error("Failed to post review.");
            }
        } catch (err) {
            toast.error("An error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-state">Loading history...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="history-container">
            <div className="section-header" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={24} color="#c9a052" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a1a' }}>My Rental History</h2>
            </div>

            {history.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                    <p style={{ color: '#666' }}>No confirmed rental history found.</p>
                </div>
            ) : (
                <div className="user-table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Period</th>
                                <th>Total Cost</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(item => (
                                <tr key={item.bookingId}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {item.vehicleRent.images && item.vehicleRent.images.length > 0 ? (
                                                <img 
                                                    src={item.vehicleRent.images[0].imgUrl} 
                                                    alt="vehicle" 
                                                    style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} 
                                                />
                                            ) : (
                                                <div style={{ width: '80px', height: '50px', backgroundColor: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚗</div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{item.vehicleRent.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{item.vehicleRent.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem', color: '#333' }}>
                                            <Calendar size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                            {item.startDate} to {item.endDate}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 'bold', color: '#c9a052' }}>Rs. {item.totalCost.toLocaleString()}</div>
                                    </td>
                                    <td>
                                        <span className="status-pill active" style={{ backgroundColor: '#e6f4ea', color: '#1e7e34', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            Confirmed
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleOpenReview(item.vehicleRent)}
                                            style={{
                                                background: '#1a1a1a',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '8px 15px',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <MessageCircle size={14} /> Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* REVIEW MODAL - DARK THEME AS REQUESTED */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: '#121213',
                        width: '90%',
                        maxWidth: '550px',
                        borderRadius: '28px',
                        padding: '40px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        position: 'relative'
                    }}>
                        <button 
                            onClick={() => setShowModal(false)}
                            style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                            <div style={{ background: 'rgba(193, 163, 111, 0.15)', padding: '12px', borderRadius: '15px' }}>
                                <MessageCircle size={28} color="#c1a36f" />
                            </div>
                            <div>
                                <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: 0 }}>Review Your Experience</h3>
                                <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.9rem' }}>Booking ID: {selectedVehicle?.vehicleRentId}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '15px', fontWeight: '500' }}>Rate the vehicle condition & service</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star 
                                        key={s} 
                                        size={40} 
                                        style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                                        fill={(hover || rating) >= s ? "#c1a36f" : "none"}
                                        color={(hover || rating) >= s ? "#c1a36f" : "rgba(255,255,255,0.1)"}
                                        onMouseEnter={() => setHover(s)}
                                        onMouseLeave={() => setHover(0)}
                                        onClick={() => setRating(s)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '35px' }}>
                            <textarea 
                                style={{
                                    width: '100%',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    resize: 'none'
                                }}
                                rows="4"
                                placeholder="Tell others about your drive... (optional)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        <button 
                            onClick={submitReview}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                background: '#c1a36f',
                                color: '#000',
                                border: 'none',
                                padding: '18px',
                                borderRadius: '50px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                opacity: submitting ? 0.7 : 1
                            }}
                        >
                            <Send size={20} /> {submitting ? "Posting..." : "Post Feedback"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalHistory;
