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
            setError('No token provided.');
        }
    }, [token]);

    const validateToken = async () => {
        try {
            const res = await apiFetch(`/api/v1/auth/validate-token?token=${token}`);
            if (res.ok) {
                setIsValidToken(true);
            } else {
                const data = await res.json();
                setError(data.message === 'expired' ? 'Link has expired. Please request a new one.' : 'Invalid reset link.');
            }
        } catch (err) {
            setError('Error connecting to server.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
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
                setMessage('Password reset successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 4000);
            } else {
                setError(data.message || 'Failed to reset password.');
            }
        } catch (err) {
            setError('Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    if (isValidating) return <div className="login-container"><div className="login-box"><p>Validating reset link...</p></div></div>;

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h2>Reset Password</h2>
                    <p>Enter your new secure password</p>
                </div>

                {!isValidToken ? (
                    <div className="alert-error" style={{ color: '#ef4444', textAlign: 'center' }}>
                        <p>{error}</p>
                        <Link to="/forgot-password" style={{ color: '#c9a052', display: 'block', marginTop: '15px' }}>Request New Link</Link>
                    </div>
                ) : (
                    <>
                        {message && <div className="alert-success" style={{ color: '#4ade80', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}
                        {error && <div className="alert-error" style={{ color: '#ef4444', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required 
                                />
                            </div>

                            <div className="input-group">
                                <label>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required 
                                />
                            </div>

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;
