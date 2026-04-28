import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiFetch from '../../services/api';
import './LoginPage.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await apiFetch('/api/v1/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ 
                    email, 
                    baseUrl: window.location.origin 
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(data.message || 'If an account exists, a reset link has been sent.');
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setError('Failed to connect to the server. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔐</div>
                    <h2>Forgot Password</h2>
                    <p>No worries! Enter your email below and we'll send you a link to reset your password.</p>
                </div>

                {message && (
                    <div className="success-message" style={{ 
                        backgroundColor: '#f0fdf4', 
                        color: '#166534', 
                        padding: '12px', 
                        borderRadius: '6px', 
                        fontSize: '14px', 
                        marginBottom: '20px', 
                        textAlign: 'center',
                        border: '1px solid #bbf7d0'
                    }}>
                        {message}
                    </div>
                )}
                
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? 'Sending Request...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Remembered your password? <Link to="/login">Back to Login</Link></p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
