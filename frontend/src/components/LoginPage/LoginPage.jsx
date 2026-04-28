import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiFetch from '../../services/api';
import './LoginPage.css';


function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Save user data (e.g., in localStorage)
                localStorage.setItem('user', JSON.stringify(data));

                // Redirect based on role
                if (data.role === 'Admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/customer-dashboard');
                }
            } else {
                const errText = await response.text();
                setError(errText);
            }
        } catch (err) {
            console.error(err);
            setError("Network Error! Please check if the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to access your account</p>
                </div>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="mail@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <div className="forgot-password-link" style={{ textAlign: 'right', marginBottom: '15px' }}>
                        <Link to="/forgot-password" style={{ color: '#c9a052', fontSize: '13px', textDecoration: 'none' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
