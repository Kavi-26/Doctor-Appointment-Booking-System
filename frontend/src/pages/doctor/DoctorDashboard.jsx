import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [stats, setStats] = useState({ today: 0, upcoming: 0, completed: 0, total: 0 });
    const [todayAppts, setTodayAppts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/doctor/dashboard');
                setStats(res.data.stats || stats);
                setTodayAppts(res.data.today || []);
            } catch (err) { toast.error(err.message); }
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn">
                    <div>
                        <h1>Welcome, Dr. {user?.name || 'Doctor'} 👨‍⚕️</h1>
                        <p>Manage your appointments and schedule</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card animate-fadeIn stagger-1">
                        <div className="stat-icon blue">📅</div>
                        <div className="stat-content"><h3>{stats.today}</h3><p>Today</p></div>
                    </div>
                    <div className="stat-card animate-fadeIn stagger-2">
                        <div className="stat-icon teal">🗓️</div>
                        <div className="stat-content"><h3>{stats.upcoming}</h3><p>Upcoming</p></div>
                    </div>
                    <div className="stat-card animate-fadeIn stagger-3">
                        <div className="stat-icon green">✅</div>
                        <div className="stat-content"><h3>{stats.completed}</h3><p>Completed</p></div>
                    </div>
                    <div className="stat-card animate-fadeIn stagger-4">
                        <div className="stat-icon orange">📊</div>
                        <div className="stat-content"><h3>{stats.total}</h3><p>Total</p></div>
                    </div>
                </div>

                <div className="section-card animate-fadeIn">
                    <div className="section-card-header">
                        <h2>Today's Appointments</h2>
                    </div>
                    <div className="section-card-body">
                        {loading ? (
                            <div className="loading-container"><div className="spinner"></div></div>
                        ) : todayAppts.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📅</div>
                                <h3>No Appointments Today</h3>
                                <p>You have no scheduled appointments for today.</p>
                            </div>
                        ) : (
                            todayAppts.map(appt => (
                                <div key={appt.id} className="appointment-card">
                                    <div className="appointment-avatar">🧑‍💼</div>
                                    <div className="appointment-info">
                                        <h4>{appt.patient_name}</h4>
                                        <p>{appt.time_slot} • {appt.reason || 'General checkup'}</p>
                                    </div>
                                    <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
