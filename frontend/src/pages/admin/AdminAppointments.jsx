import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const toast = useToast();

    useEffect(() => { loadAppointments(); }, []);

    const loadAppointments = async () => {
        try {
            const res = await api.get('/admin/appointments');
            setAppointments(res.data || []);
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    const forceCancel = async (id) => {
        if (!confirm('Force cancel this appointment?')) return;
        try {
            await api.put(`/admin/appointments/${id}/cancel`);
            toast.success('Appointment cancelled.');
            loadAppointments();
        } catch (err) { toast.error(err.message); }
    };

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn"><h1>All Appointments 📋</h1></div>
                <div className="filter-bar animate-fadeIn">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                        <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                {loading ? <div className="loading-container"><div className="spinner"></div></div> : filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No Appointments</h3></div>
                ) : (
                    <div className="table-wrapper animate-fadeIn">
                        <table className="table">
                            <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filtered.map(a => (
                                    <tr key={a.id}>
                                        <td>#{a.id}</td>
                                        <td>{a.patient_name}</td>
                                        <td>Dr. {a.doctor_name}</td>
                                        <td>{new Date(a.appointment_date).toLocaleDateString()}</td>
                                        <td>{a.time_slot}</td>
                                        <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                                        <td>{(a.status === 'pending' || a.status === 'confirmed') && <button className="btn btn-danger btn-sm" onClick={() => forceCancel(a.id)}>Cancel</button>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAppointments;
