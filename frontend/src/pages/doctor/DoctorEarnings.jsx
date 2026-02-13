import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const DoctorEarnings = () => {
    const [stats, setStats] = useState({ total: 0, thisMonth: 0, consultations: 0 });
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/doctor/earnings');
                setStats(res.data || stats);
            } catch (err) { toast.error(err.message); }
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn"><h1>Earnings Overview 💰</h1></div>
                {loading ? <div className="loading-container"><div className="spinner"></div></div> : (
                    <div className="stats-grid">
                        <div className="stat-card animate-fadeIn stagger-1"><div className="stat-icon green">💰</div><div className="stat-content"><h3>₹{stats.total}</h3><p>Total Earnings</p></div></div>
                        <div className="stat-card animate-fadeIn stagger-2"><div className="stat-icon blue">📅</div><div className="stat-content"><h3>₹{stats.thisMonth}</h3><p>This Month</p></div></div>
                        <div className="stat-card animate-fadeIn stagger-3"><div className="stat-icon teal">📊</div><div className="stat-content"><h3>{stats.consultations}</h3><p>Total Consultations</p></div></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorEarnings;
