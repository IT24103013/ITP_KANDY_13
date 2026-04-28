import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Info, Tag, Clock } from 'lucide-react';
import apiFetch from '../../services/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await apiFetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            } else {
                setError("Failed to load notifications.");
            }
        } catch (err) {
            setError("Network Error!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const res = await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            }
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'PROMO': return <Tag size={20} color="#C9AD6E" />;
            case 'BOOKING': return <CheckCircle size={20} color="#4ADE80" />;
            default: return <Info size={20} color="#60A5FA" />;
        }
    };

    const styles = {
        container: { padding: '20px' },
        card: { 
            background: '#121417', 
            borderRadius: '24px', 
            border: '1px solid #262b35', 
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        },
        header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' },
        title: { fontSize: '1.8rem', color: '#eceef5', margin: 0 },
        list: { display: 'flex', flexDirection: 'column', gap: '15px' },
        item: (read) => ({
            display: 'flex',
            gap: '20px',
            padding: '20px',
            background: read ? 'transparent' : '#1e212a',
            border: read ? '1px solid #262b35' : '1px solid #C9AD6E',
            borderRadius: '16px',
            transition: 'all 0.3s ease',
            position: 'relative'
        }),
        content: { flex: 1 },
        msg: { margin: '0 0 10px 0', fontSize: '1.1rem', color: '#eceef5', lineHeight: '1.5' },
        time: { fontSize: '0.8rem', color: '#8f94a5', display: 'flex', alignItems: 'center', gap: '5px' },
        unreadDot: { 
            width: '8px', 
            height: '8px', 
            background: '#C9AD6E', 
            borderRadius: '50%', 
            position: 'absolute',
            top: '20px',
            right: '25px'
        }
    };

    if (loading) return <div style={{ color: '#8f94a5', textAlign: 'center', padding: '50px' }}>Loading update stream...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={{ background: '#C9AD6E20', padding: '12px', borderRadius: '15px' }}>
                        <Bell color="#C9AD6E" />
                    </div>
                    <h1 style={styles.title}>Recent Notifications</h1>
                </div>

                {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#8f94a5' }}>
                        <p style={{ fontSize: '1.2rem' }}>You're all caught up!</p>
                        <p>Any new updates or promotions will appear here.</p>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {notifications.map(n => (
                            <div 
                                key={n.id} 
                                style={styles.item(n.read)}
                                onClick={() => !n.read && markAsRead(n.id)}
                            >
                                <div style={{ background: '#1e212a', padding: '10px', borderRadius: '12px', height: 'fit-content' }}>
                                    {getIcon(n.type)}
                                </div>
                                <div style={styles.content}>
                                    <p style={styles.msg}>{n.message}</p>
                                    <div style={styles.time}>
                                        <Clock size={14} />
                                        {new Date(n.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                {!n.read && <div style={styles.unreadDot} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
