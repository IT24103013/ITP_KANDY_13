import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiFetch from '../../services/api';
import './SignupPage.css';

function SignupPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        nic: '',
        phone: '',
        licenseUrl: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setLoading(true);

        const payload = {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            nic: formData.nic,
            phone: formData.phone,
            licenseUrl: formData.licenseUrl
        };

        try {
            const response = await apiFetch('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                await response.json();
                alert("Account created successfully. Please login.");
                navigate('/login');
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
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h2>Create an Account</h2>
                    <p>Join Samarasinghe Motors today</p>
                </div>
                
                <form onSubmit={handleSignup} className="signup-form">
                    
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="form-group half-width">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="mail@example.com"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>NIC Number *</label>
                            <input
                                type="text"
                                name="nic"
                                value={formData.nic}
                                onChange={handleChange}
                                required
                                placeholder="123456789V"
                            />
                        </div>
                        <div className="form-group half-width">
                            <label>Phone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="0771234567"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Create a strong password"
                                minLength="6"
                            />
                        </div>
                        <div className="form-group half-width">
                            <label>Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Repeat your password"
                                minLength="6"
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Driving License Details (Optional but recommended)</label>
                        <input
                            type="text"
                            name="licenseUrl"
                            value={formData.licenseUrl}
                            onChange={handleChange}
                            placeholder="Enter License Number or Reference"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="signup-submit-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="signup-footer">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
