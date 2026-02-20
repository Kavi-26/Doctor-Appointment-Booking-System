import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const PatientDashboard = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [stats, setStats] = useState({ upcoming: 0, completed: 0, cancelled: 0, total: 0 });
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await api.get('/patient/dashboard');
            setStats(res.data.stats || stats);
            setUpcoming(res.data.upcoming || []);
        } catch (err) {
            toast.error(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn">
                    <div>
                        <h1>Welcome back, {user?.name || 'Patient'} 👋</h1>
                        <p>Manage your health appointments easily</p>
                    </div>
                    <Link to="/patient/search-doctors" className="btn btn-primary">
                        🔍 Find a Doctor
                    </Link>
                </div>

                <div className="stats-grid">
                    <div className="stat-card animate-fadeIn stagger-1">
                        <div className="stat-icon blue">📅</div>
                        <div className="stat-content">
                            <h3>{stats.upcoming}</h3>
                            <p>Upcoming</p>
                        </div>
                    </div>
                    <div className="stat-card animate-fadeIn stagger-2">
                        <div className="stat-icon green">✅</div>
                        <div className="stat-content">
                            <h3>{stats.completed}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="stat-card animate-fadeIn stagger-3">
                        <div className="stat-icon red">❌</div>
                        <div className="stat-content">
                            <h3>{stats.cancelled}</h3>
                            <p>Cancelled</p>
                        </div>
                    </div>
                    <div className="stat-card animate-fadeIn stagger-4">
                        <div className="stat-icon teal">📊</div>
                        <div className="stat-content">
                            <h3>{stats.total}</h3>
                            <p>Total</p>
                        </div>
                    </div>
                </div>

                <div className="content-grid">
                    <div className="section-card animate-fadeIn">
                        <div className="section-card-header">
                            <h2>Upcoming Appointments</h2>
                            <Link to="/patient/appointments" className="btn btn-ghost btn-sm">View All →</Link>
                        </div>
                        <div className="section-card-body">
                            {loading ? (
                                <div className="loading-container"><div className="spinner"></div></div>
                            ) : upcoming.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📅</div>
                                    <h3>No Upcoming Appointments</h3>
                                    <p>Search for a doctor and book your first appointment!</p>
                                    <Link to="/patient/search-doctors" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-4)' }}>Find a Doctor</Link>
                                </div>
                            ) : (
                                upcoming.map((appt) => (
                                    <div key={appt.id} className="appointment-card">
                                        <div className="appointment-avatar">👨‍⚕️</div>
                                        <div className="appointment-info">
                                            <h4>Dr. {appt.doctor_name}</h4>
                                            <p>{new Date(appt.appointment_date).toLocaleDateString()} • {appt.time_slot}</p>
                                            <p>{appt.specialization}</p>
                                        </div>
                                        <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="section-card animate-fadeIn">
                        <div className="section-card-header">
                            <h2>Quick Actions</h2>
                        </div>
                        <div className="section-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            <Link to="/patient/search-doctors" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>🔍 Search Doctors</Link>
                            <Link to="/patient/appointments" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>📋 My Appointments</Link>
                            <Link to="/patient/history" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>📜 Appointment History</Link>
                            <Link to="/patient/notifications" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>🔔 Notifications</Link>
                            <Link to="/patient/settings" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>⚙️ Profile Settings</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
