import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const AdminDashboard = () => {
    const toast = useToast();
    const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, totalAppointments: 0, pendingDoctors: 0, todayAppointments: 0, revenue: 0 });
    const [recentAppts, setRecentAppts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/admin/dashboard');
                setStats(res.data.stats || stats);
                setRecentAppts(res.data.recent || []);
            } catch (err) { toast.error(err.message); }
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn">
                    <h1>Admin Dashboard 🛡️</h1>
                </div>

                <div className="stats-grid">
                    <div className="stat-card animate-fadeIn stagger-1"><div className="stat-icon blue">👨‍⚕️</div><div className="stat-content"><h3>{stats.totalDoctors}</h3><p>Total Doctors</p></div></div>
                    <div className="stat-card animate-fadeIn stagger-2"><div className="stat-icon teal">🧑‍💼</div><div className="stat-content"><h3>{stats.totalPatients}</h3><p>Total Patients</p></div></div>
                    <div className="stat-card animate-fadeIn stagger-3"><div className="stat-icon green">📅</div><div className="stat-content"><h3>{stats.totalAppointments}</h3><p>Total Appointments</p></div></div>
                    <div className="stat-card animate-fadeIn stagger-4"><div className="stat-icon orange">⏳</div><div className="stat-content"><h3>{stats.pendingDoctors}</h3><p>Pending Approvals</p></div></div>
                    <div className="stat-card animate-fadeIn stagger-5"><div className="stat-icon blue">📊</div><div className="stat-content"><h3>{stats.todayAppointments}</h3><p>Today</p></div></div>
                </div>

                <div className="section-card animate-fadeIn">
                    <div className="section-card-header"><h2>Recent Appointments</h2></div>
                    <div className="section-card-body">
                        {loading ? <div className="loading-container"><div className="spinner"></div></div> : recentAppts.length === 0 ? (
                            <div className="empty-state"><div className="empty-state-icon">📅</div><h3>No Recent Activity</h3></div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {recentAppts.map(a => (
                                            <tr key={a.id}><td>{a.patient_name}</td><td>Dr. {a.doctor_name}</td><td>{new Date(a.appointment_date).toLocaleDateString()}</td><td><span className={`badge badge-${a.status}`}>{a.status}</span></td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
