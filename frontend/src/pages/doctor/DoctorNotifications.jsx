import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const DoctorNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/doctor/notifications');
                setNotifications(res.data || []);
            } catch (err) { toast.error(err.message); }
            setLoading(false);
        };
        load();
    }, []);

    const markRead = async (id) => {
        try {
            await api.put(`/doctor/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn"><h1>Notifications 🔔</h1></div>
                {loading ? <div className="loading-container"><div className="spinner"></div></div> : notifications.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">🔔</div><h3>No Notifications</h3><p>You're all caught up!</p></div>
                ) : (
                    <div className="section-card animate-fadeIn">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`notification-item ${!notif.is_read ? 'unread' : ''}`} onClick={() => !notif.is_read && markRead(notif.id)} style={{ cursor: !notif.is_read ? 'pointer' : 'default' }}>
                                {!notif.is_read && <div className="notification-dot"></div>}
                                <div className="notification-content"><h4>{notif.title}</h4><p>{notif.message}</p><time>{new Date(notif.created_at).toLocaleString()}</time></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorNotifications;
