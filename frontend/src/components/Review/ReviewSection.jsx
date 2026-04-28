import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, UserCheck, Trash2, Edit, X, Check, BadgeCheck, ListFilter } from 'lucide-react';
import apiFetch from '../../services/api';

const ReviewSection = ({ vehicleId }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // State for Editing
    const [editingId, setEditingId] = useState(null);
    const [editComment, setEditComment] = useState("");
    const [editRating, setEditRating] = useState(0);

    const user = JSON.parse(localStorage.getItem('user'));

    const fetchReviews = async () => {
        if (!vehicleId) return;
        try {
            const res = await apiFetch(`/api/reviews/vehicle/${vehicleId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) { 
            console.error("Failed to fetch reviews", error); 
        }
    };

    useEffect(() => { 
        fetchReviews(); 
    }, [vehicleId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Please login to post a review.");
        if (rating === 0) return alert("Please select a rating!");
        
        setLoading(true);
        try {
            const res = await apiFetch('/api/reviews/submit', {
                method: 'POST',
                body: JSON.stringify({ 
                    vehicleRentId: vehicleId, 
                    rating, 
                    comment 
                })
            });
            if (res.ok) {
                setComment(""); 
                setRating(0); 
                fetchReviews();
            }
        } catch (error) { 
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const sortedReviews = [...reviews].sort((a, b) => b.id - a.id);
    const averageRating = reviews.length 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : "0.0";

    const styles = {
        container: { 
            background: '#0a0a0b', 
            color: '#ffffff', 
            padding: '60px 50px', 
            width: '100%', 
            borderRadius: '40px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            fontFamily: "'Inter', sans-serif",
            boxSizing: 'border-box'
        },
        headerRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px'
        },
        ratingBadge: {
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '20px 30px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
        },
        avgText: {
            fontSize: '4.5rem',
            fontWeight: '800',
            lineHeight: '1',
            margin: 0
        },
        postBox: {
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '40px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '40px'
        },
        textarea: {
            width: '100%',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '20px',
            color: '#fff',
            fontSize: '1rem',
            margin: '25px 0',
            resize: 'none',
            outline: 'none',
            transition: 'border 0.3s'
        },
        submitBtn: {
            background: '#c1a36f',
            color: '#000',
            border: 'none',
            padding: '16px 35px',
            borderRadius: '50px',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'transform 0.2s',
            opacity: loading ? 0.7 : 1
        },
        reviewCard: {
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '30px',
            borderRadius: '20px',
            marginBottom: '20px',
            borderLeft: '4px solid #c1a36f'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <div style={styles.headerRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <MessageSquare size={32} color="#c1a36f" />
                    <h2 style={{ fontSize: '2.4rem', fontWeight: '800', margin: 0 }}>Reviews & Feedback</h2>
                </div>

                <div style={styles.ratingBadge}>
                    <h1 style={styles.avgText}>{averageRating}</h1>
                    <div>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={22} fill={s <= Math.round(averageRating) ? "#c1a36f" : "none"} color="#c1a36f" />
                            ))}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.9rem' }}>
                            Based on {reviews.length} verified rentals
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Experience Section (Input) */}
            {user && user.role === 'Customer' && (
                <div style={styles.postBox}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '500', color: 'rgba(255,255,255,0.6)', margin: '0 0 15px 0' }}>Add your experience</h3>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star 
                                key={s} 
                                size={36} 
                                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                fill={(hover || rating) >= s ? "#c1a36f" : "none"}
                                color={(hover || rating) >= s ? "#c1a36f" : "rgba(255,255,255,0.15)"}
                                onMouseEnter={() => setHover(s)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(s)}
                            />
                        ))}
                    </div>

                    <textarea 
                        style={styles.textarea}
                        rows="3"
                        placeholder="Type here..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        onFocus={(e) => e.target.style.border = '1px solid #c1a36f'}
                        onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                    />

                    <button 
                        style={styles.submitBtn} 
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        <Send size={18} /> Post Feedback
                    </button>
                </div>
            )}

            {/* Reviews List */}
            <div style={{ marginTop: '50px' }}>
                <h4 style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '30px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BadgeCheck size={20} color="#c1a36f" /> Verified Owner Testimonials
                </h4>

                {sortedReviews.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px' }}>No reviews yet for this vehicle.</p>
                ) : (
                    sortedReviews.map(rev => (
                        <div key={rev.id} style={styles.reviewCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} size={16} fill={s <= rev.rating ? "#c1a36f" : "none"} color="#c1a36f" />
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Verified Stay</span>
                            </div>
                            
                            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', margin: '0 0 20px 0' }}>
                                "{rev.comment}"
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#c1a36f', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                                    {rev.customerName?.charAt(0) || 'U'}
                                </div>
                                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{rev.customerName || 'Anonymous User'}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
