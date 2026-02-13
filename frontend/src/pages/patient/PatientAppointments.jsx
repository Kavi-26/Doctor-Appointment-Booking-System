import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const toast = useToast();

    useEffect(() => { loadAppointments(); }, []);

    const loadAppointments = async () => {
        try {
            const res = await api.get('/patient/appointments');
            setAppointments(res.data || []);
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    const handleCancel = async (id) => {
        if (!confirm('Cancel this appointment?')) return;
        try {
            await api.put(`/patient/appointments/${id}/cancel`);
            toast.success('Appointment cancelled.');
            loadAppointments();
        } catch (err) { toast.error(err.message); }
    };

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn">
                    <div>
                        <h1>My Appointments 📋</h1>
                        <p>View and manage all your appointments</p>
                    </div>
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
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <h3>No Appointments</h3>
                        <p>No {filter !== 'all' ? filter : ''} appointments found.</p>
                    </div>
                ) : (
                    <div className="table-wrapper animate-fadeIn">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Specialization</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(appt => (
                                    <tr key={appt.id}>
                                        <td><strong>Dr. {appt.doctor_name}</strong></td>
                                        <td>{appt.specialization}</td>
                                        <td>{new Date(appt.appointment_date).toLocaleDateString()}</td>
                                        <td>{appt.appointment_time}</td>
                                        <td><span className={`badge badge-${appt.status}`}>{appt.status}</span></td>
                                        <td>
                                            {(appt.status === 'pending' || appt.status === 'confirmed') && (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt.id)}>Cancel</button>
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

export default PatientAppointments;
