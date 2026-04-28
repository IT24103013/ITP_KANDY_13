import React, { useState } from 'react';
import { Tag, Calendar, Banknote, Sparkles } from 'lucide-react';
import apiFetch from '../../services/api';

const DiscountCalculator = () => {
    const [basePrice, setBasePrice] = useState('10000');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [promoCode, setPromoCode] = useState('');
    
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [promoStatus, setPromoStatus] = useState(null);

    const styles = {
        card: { background: '#121417', color: '#eceef5', border: '1px solid #262b35', borderRadius: '28px', padding: '35px', marginBottom: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
        inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
        label: { fontSize: '0.9rem', color: '#8f94a5', fontWeight: '600' },
        input: { background: '#1e212a', border: '1px solid #2b2f3a', color: '#eceef5', padding: '15px', borderRadius: '12px', outline: 'none', width: '100%', boxSizing: 'border-box' },
        btn: { background: '#C9AD6E', color: '#070504', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '20px', transition: 'all 0.3s ease' },
        resultBox: { background: '#1e212a', border: '1px dashed #C9AD6E', borderRadius: '16px', padding: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '30px' },
        priceText: { fontSize: '2.5rem', fontWeight: '800', color: '#C9AD6E', margin: 0 }
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        if (!startDate || !endDate) {
            setError("Please select both start and end dates.");
            setLoading(false);
            return;
        }

        try {
            const res = await apiFetch('/api/v1/promotions/calculate', {
                method: 'POST',
                body: JSON.stringify({
                    basePrice: parseFloat(basePrice),
                    startDate,
                    endDate,
                    promoCode: promoCode.trim() || null
                })
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                if (promoCode.trim()) setPromoStatus('valid');
                else setPromoStatus(null);
            } else {
                if (promoCode.trim()) setPromoStatus('invalid');
                setError("Invalid Promo Code or Calculation Failed.");
            }
        } catch {
            setError("Server connection failed.");
            setPromoStatus(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <div style={styles.card}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #262b35', paddingBottom: '20px' }}>
                    <Banknote color="#C9AD6E" size={32} /> Price Estimation & Promotions
                </h2>
                
                {error && <div style={{ background: '#EF444420', color: '#EF4444', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold' }}>{error}</div>}

                <form onSubmit={handleCalculate}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Base Vehicle Rental Cost (LKR)</label>
                            <input type="number" step="0.01" style={styles.input} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
                        </div>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Promotional Code</label>
                            <div style={{ position: 'relative' }}>
                                <Tag size={18} color="#8f94a5" style={{ position: 'absolute', top: '15px', left: '15px' }} />
                                <input 
                                    style={{ 
                                        ...styles.input, 
                                        paddingLeft: '45px', 
                                        border: promoStatus === 'valid' ? '1px solid #10B981' : promoStatus === 'invalid' ? '1px solid #EF4444' : '1px solid #2b2f3a' 
                                    }} 
                                    placeholder="Enter Code" 
                                    value={promoCode} 
                                    onChange={(e) => {
                                        setPromoCode(e.target.value.toUpperCase());
                                        setPromoStatus(null);
                                    }} 
                                />
                            </div>
                            {promoStatus === 'valid' && <div style={{color: '#10B981', fontSize: '0.85rem', marginTop: '4px', fontWeight: '600'}}>✓ '{promoCode}' applied!</div>}
                            {promoStatus === 'invalid' && <div style={{color: '#EF4444', fontSize: '0.85rem', marginTop: '4px', fontWeight: '600'}}>✕ Code expired or invalid</div>}
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Rental Start Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} color="#8f94a5" style={{ position: 'absolute', top: '15px', left: '15px' }} />
                                <input type="date" style={{ ...styles.input, paddingLeft: '45px' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Rental End Date </label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} color="#8f94a5" style={{ position: 'absolute', top: '15px', left: '15px' }} />
                                <input type="date" style={{ ...styles.input, paddingLeft: '45px' }} value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    <button type="submit" style={styles.btn} disabled={loading}>
                        {loading ? 'Calculating...' : <><Sparkles size={20} /> Calculate Final Price</>}
                    </button>
                </form>

                {result && (
                    <div style={styles.resultBox}>
                        <div>
                            <p style={{ color: '#8f94a5', fontSize: '1.1rem', margin: '0 0 5px 0' }}>Est. Total Payable</p>
                            <p style={styles.priceText}>LKR {result.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            {result.basePrice !== result.finalPrice && (
                                <p style={{ color: '#10B981', margin: '10px 0 0 0', fontWeight: 'bold' }}>
                                    ✓ You saved LKR {(result.basePrice - result.finalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}!
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscountCalculator;
