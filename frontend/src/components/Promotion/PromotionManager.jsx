import React, { useState, useEffect } from 'react';
import { Tag, Calendar, PlusCircle, Trash2 } from 'lucide-react';
import apiFetch from '../../services/api';

const PromotionManager = () => {
    const [promos, setPromos] = useState([]);
    const [newCode, setNewCode] = useState("");
    const [newDiscount, setNewDiscount] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newStart, setNewStart] = useState("");
    const [newEnd, setNewEnd] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get today's date in YYYY-MM-DD format for restriction
    const today = new Date().toISOString().split('T')[0];

    const styles = {
        card: { background: '#121417', color: '#eceef5', border: '1px solid #262b35', borderRadius: '28px', padding: '35px', marginBottom: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
        input: { background: '#1e212a', border: '1px solid #2b2f3a', color: '#eceef5', padding: '15px', borderRadius: '12px', flex: '1 1 200px', outline: 'none' },
        item: { display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #262b35', alignItems: 'center' },
        badge: { background: '#252a35', color: '#C9AD6E', padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '700' },
        btn: { background: '#C9AD6E', color: '#070504', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
        deleteBtn: { background: 'transparent', color: '#EF4444', border: 'none', cursor: 'pointer', padding: '8px' }
    };

    const fetchPromos = async () => {
        try {
            setLoading(true);
            const res = await apiFetch('/api/v1/promotions/active');
            if (res.ok) {
                const data = await res.json();
                setPromos(data);
            } else {
                setError("Failed to fetch promotions");
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError(null);

        // Frontend Validation
        if (newStart < today) {
            setError("Start date cannot be in the past.");
            return;
        }
        if (newEnd < newStart) {
            setError("End date must be after the start date.");
            return;
        }

        try {
            const res = await apiFetch('/api/v1/promotions', {
                method: 'POST',
                body: JSON.stringify({
                    code: newCode.toUpperCase(),
                    discountPercent: parseFloat(newDiscount),
                    description: newDesc,
                    startDate: newStart,
                    endDate: newEnd
                })
            });
            if (res.ok) {
                setNewCode(""); setNewDiscount(""); setNewDesc(""); setNewStart(""); setNewEnd("");
                fetchPromos();
                alert("Promotion created and notification sent!");
            } else {
                const err = await res.json();
                setError(err.message || "Failed to create promotion");
            }
        } catch (e) {
            setError(e.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this promotion?")) return;
        try {
            const res = await apiFetch(`/api/v1/promotions/${id}`, { method: 'DELETE' });
            if (res.ok) fetchPromos();
            else setError("Failed to delete promotion");
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div style={{ width: '100%' }}>
            <h1 style={{ color: '#C9AD6E', marginBottom: '30px', fontSize: '2.4rem', textAlign: 'center' }}>Manage Promotions</h1>
            
            {error && <div style={{ background: '#EF444420', color: '#EF4444', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>{error}</div>}
            
            <div style={styles.card}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PlusCircle color="#C9AD6E" /> Create New Coupon
                </h2>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <input required style={styles.input} placeholder="Code (e.g. SUMMER26)" value={newCode} onChange={e => setNewCode(e.target.value)} />
                    <input required style={styles.input} type="number" step="0.01" placeholder="Discount %" value={newDiscount} onChange={e => setNewDiscount(e.target.value)} />
                    <input style={styles.input} placeholder="Short Description (e.g. New Year Special)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                    
                    <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: '#8f94a5', marginLeft: '5px' }}>Start Date</label>
                            <input 
                                required 
                                style={{ ...styles.input, width: '100%' }} 
                                type="date" 
                                min={today}
                                value={newStart} 
                                onChange={e => setNewStart(e.target.value)} 
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: '#8f94a5', marginLeft: '5px' }}>End Date</label>
                            <input 
                                required 
                                style={{ ...styles.input, width: '100%' }} 
                                type="date"
                                min={newStart || today}
                                value={newEnd} 
                                onChange={e => setNewEnd(e.target.value)} 
                            />
                        </div>
                        <div style={{ alignSelf: 'flex-end' }}>
                            <button type="submit" style={styles.btn}>Generate Offer</button>
                        </div>
                    </div>
                </form>
            </div>

            <div style={styles.card}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                    <Tag color="#C9AD6E" style={{ marginRight: '10px' }} /> Active Campaigns
                </h2>
                {loading ? <p style={{ color: '#8f94a5' }}>Loading promotions...</p> : promos.length === 0 ? <p style={{ color: '#8f94a5' }}>No active promotions found.</p> : promos.map(p => (
                    <div key={p.promoId} style={styles.item}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ background: '#1e212a', padding: '12px', borderRadius: '12px' }}><Tag color="#C9AD6E" /></div>
                            <div>
                                <p style={{ fontWeight: '700', fontSize: '1.2rem', letterSpacing: '1px' }}>{p.code}</p>
                                <p style={{ fontSize: '0.9rem', color: '#8f94a5', marginBottom: '5px' }}>{p.description}</p>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <small style={{ color: '#8f94a5', display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14}/> From: {p.startDate}</small>
                                    <small style={{ color: '#8f94a5', display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14}/> Until: {p.endDate}</small>
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div>
                                <p style={{ color: '#C9AD6E', fontWeight: '800', fontSize: '1.4rem' }}>{p.discountPercent}% OFF</p>
                                <span style={styles.badge}>Active</span>
                            </div>
                            <button onClick={() => handleDelete(p.promoId)} style={styles.deleteBtn} title="Delete Promo">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PromotionManager;
