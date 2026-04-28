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
                setMessage(data.message);
            } else {
                setError(data.message || 'Something went wrong.');
            }
        } catch (err) {
            setError('Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h2>Forgot Password</h2>
                    <p>Enter your email to receive a reset link</p>
                </div>

                {message && <div className="alert-success" style={{ color: '#4ade80', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}
                {error && <div className="alert-error" style={{ color: '#ef4444', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="yourname@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
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
