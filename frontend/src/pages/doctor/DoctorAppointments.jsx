import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const toast = useToast();

    useEffect(() => { loadAppointments(); }, []);

    const loadAppointments = async () => {
        try {
            const res = await api.get('/doctor/appointments');
            setAppointments(res.data || []);
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    const handleAction = async (id, action) => {
        try {
            await api.put(`/doctor/appointments/${id}/${action}`);
            toast.success(`Appointment ${action}ed.`);
            loadAppointments();
        } catch (err) { toast.error(err.message); }
    };

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn">
                    <h1>Appointments 📋</h1>
                </div>

                <div className="filter-bar animate-fadeIn">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                        <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No Appointments</h3></div>
                ) : (
                    <div className="table-wrapper animate-fadeIn">
                        <table className="table">
                            <thead>
                                <tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(appt => (
                                    <tr key={appt.id}>
                                        <td><strong>{appt.patient_name}</strong></td>
                                        <td>{new Date(appt.appointment_date).toLocaleDateString()}</td>
                                        <td>{appt.time_slot}</td>
                                        <td>{appt.reason || '—'}</td>
                                        <td><span className={`badge badge-${appt.status}`}>{appt.status}</span></td>
                                        <td className="appointment-actions">
                                            {appt.status === 'pending' && <>
                                                <button className="btn btn-success btn-sm" onClick={() => handleAction(appt.id, 'accept')}>Accept</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleAction(appt.id, 'reject')}>Reject</button>
                                            </>}
                                            {appt.status === 'confirmed' && (
                                                <button className="btn btn-accent btn-sm" onClick={() => handleAction(appt.id, 'complete')}>Complete</button>
                                            )}
                                        </td>
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

export default DoctorAppointments;
