import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const AdminReports = () => {
    const [report, setReport] = useState(null);
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => { loadReports(); }, [period]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/reports?period=${period}`);
            setReport(res.data || {});
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn">
                    <h1>Reports & Analytics 📊</h1>
                    <div className="filter-bar" style={{ marginBottom: 0 }}>
                        {['daily', 'weekly', 'monthly'].map(p => (
                            <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPeriod(p)}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? <div className="loading-container"><div className="spinner"></div></div> : report ? (
                    <>
                        <div className="stats-grid animate-fadeIn">
                            <div className="stat-card"><div className="stat-icon blue">📅</div><div className="stat-content"><h3>{report.totalAppointments || 0}</h3><p>Appointments</p></div></div>
                            <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-content"><h3>{report.completedAppointments || 0}</h3><p>Completed</p></div></div>
                            <div className="stat-card"><div className="stat-icon red">❌</div><div className="stat-content"><h3>{report.cancelledAppointments || 0}</h3><p>Cancelled</p></div></div>
                            <div className="stat-card"><div className="stat-icon teal">👨‍⚕️</div><div className="stat-content"><h3>{report.newDoctors || 0}</h3><p>New Doctors</p></div></div>
                            <div className="stat-card"><div className="stat-icon orange">🧑‍💼</div><div className="stat-content"><h3>{report.newPatients || 0}</h3><p>New Patients</p></div></div>
                        </div>
                    </>
                ) : (
                    <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No Data</h3></div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;
