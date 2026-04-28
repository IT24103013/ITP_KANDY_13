import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import apiFetch from '../../services/api';
import './LoginPage.css';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            validateToken();
        } else {
            setIsValidating(false);
            setError('No reset token provided. Please request a new link.');
        }
    }, [token]);

    const validateToken = async () => {
        try {
            const res = await apiFetch(`/api/v1/auth/validate-token?token=${token}`);
            if (res.ok) {
                setIsValidToken(true);
            } else {
                const data = await res.json();
                setError(data.message === 'expired' ? 'This link has expired. For security, reset links are only valid for 1 hour.' : 'This reset link is invalid or has already been used.');
            }
        } catch (err) {
            setError('Unable to connect to the server. Please try again later.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await apiFetch('/api/v1/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, newPassword })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Your password has been reset successfully! Redirecting you to login...');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.message || 'Failed to update password. Please request a new link.');
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    if (isValidating) {
        return (
            <div className="login-container">
                <div className="login-card" style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="loading-spinner" style={{ marginBottom: '20px' }}>⏳</div>
                    <p>Verifying your security token...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛡️</div>
                    <h2>Reset Password</h2>
                    <p>Create a new, strong password for your account.</p>
                </div>

                {!isValidToken ? (
                    <div className="error-message" style={{ textAlign: 'center' }}>
                        <p>{error}</p>
                        <Link to="/forgot-password" style={{ 
                            display: 'inline-block', 
                            marginTop: '15px', 
                            color: '#c9a052', 
                            fontWeight: '600',
                            textDecoration: 'underline'
                        }}>
                            Request a new link
                        </Link>
                    </div>
                ) : (
                    <>
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
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Minimum 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required 
                                    minLength="6"
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Repeat your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required 
                                    minLength="6"
                                />
                            </div>

                            <button type="submit" className="login-submit-btn" disabled={loading}>
                                {loading ? 'Saving Changes...' : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}
                
                <div className="login-footer">
                    <p>Changed your mind? <Link to="/login">Back to Login</Link></p>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
