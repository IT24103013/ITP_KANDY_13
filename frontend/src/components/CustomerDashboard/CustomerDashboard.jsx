import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PaymentHistory from '../PaymentHistory/PaymentHistory';
import RentalHistory from '../RentalHistory/RentalHistory';
import ProfileUpdate from './ProfileUpdate';
import Notifications from './Notifications';
import apiFetch from '../../services/api';
import './CustomerDashboard.css';

function CustomerDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await apiFetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                const unread = data.filter(n => !n.read).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.role?.toUpperCase() !== 'CUSTOMER') {
                navigate('/');
            } else {
                setUser(userData);
                fetchUnreadCount();
            }
        } else {
            navigate('/login');
        }
    }, [navigate, fetchUnreadCount]);

    const showMessage = useCallback((msg, error = false) => {
        setMessage(msg);
        setIsError(error);
        setTimeout(() => setMessage(null), 5000);
    }, []);

    const handleUpdateSuccess = (updatedUser) => {
        setUser(updatedUser);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return <div className="loading-state">Syncing secure profile...</div>;

    return (
        <div className="admin-layout">
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span><Link to="/" className="brand-logo">Samarasinghe Motors</Link></span>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                        Overview
                    </button>

                    <button
                        className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('notifications');
                            setUnreadCount(0);
                        }}
                    >
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            Notifications
                            {unreadCount > 0 && <span className="badge" style={{ position: 'static' }}>{unreadCount}</span>}
                        </div>
                    </button>

                    <button
                        className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                        Update Profile
                    </button>

                    <button
                        className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Rental History
                    </button>

                    <button
                        className="nav-btn"
                        onClick={() => navigate('/rent')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        Book Now
                    </button>

                    <div style={{ flexGrow: 1 }}></div>

                    <button className="nav-btn" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        {activeTab === 'overview' ? (
                            <>
                                <h1>Customer Hub</h1>
                                <p>welcome &bull; {user.fullName}</p>
                            </>
                        ) : activeTab === 'notifications' ? (
                            <>
                                <h1>Notifications</h1>
                                <p>updates &bull; promotions &bull; alerts</p>
                            </>
                        ) : activeTab === 'profile' ? (
                            <>
                                <h1>Profile Settings</h1>
                                <p>personal details &bull; account security</p>
                            </>
                        ) : (
                            <>
                                <h1>Rental History</h1>
                                <p>verified trips &bull; confirmed bookings</p>
                            </>
                        )}
                    </div>
                </header>

                {message && (
                    <div className={`admin-alert ${isError ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <div className="admin-content">
                    {activeTab === 'overview' && (
                        <>
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">Membership</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    </div>
                                    <div className="metric-value">Active</div>
                                    <div className="metric-trend up">&uarr; Verified Customer</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">Account Type</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    </div>
                                    <div className="metric-value">Customer</div>
                                    <div className="metric-trend default">Personal Account</div>
                                </div>
                            </div>

                            <div className="dashboard-section-card" style={{ padding: 20 }}>
                                <PaymentHistory currentUserId={user.userId} />
                            </div>
                        </>
                    )}

                    {activeTab === 'notifications' && (
                        <Notifications />
                    )}

                    {activeTab === 'profile' && (
                        <div className="dashboard-section-card" style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e0e0e0', padding: 30 }}>
                            <ProfileUpdate
                                user={user}
                                onUpdateSuccess={handleUpdateSuccess}
                                showMessage={showMessage}
                            />
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="dashboard-section-card" style={{ padding: 25 }}>
                            <RentalHistory currentUserId={user.userId} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default CustomerDashboard;
