import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const PatientHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/patient/appointments?status=completed');
                setHistory(res.data || []);
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
                        <h1>Appointment History 📜</h1>
                        <p>View your past completed visits</p>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : history.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📜</div>
                        <h3>No History</h3>
                        <p>Your completed appointment history will appear here.</p>
                    </div>
                ) : (
                    <div className="table-wrapper animate-fadeIn">
                        <table className="table">
                            <thead>
                                <tr><th>Doctor</th><th>Specialization</th><th>Date</th><th>Time</th><th>Notes</th></tr>
                            </thead>
                            <tbody>
                                {history.map(appt => (
                                    <tr key={appt.id}>
                                        <td><strong>Dr. {appt.doctor_name}</strong></td>
                                        <td>{appt.specialization}</td>
                                        <td>{new Date(appt.appointment_date).toLocaleDateString()}</td>
                                        <td>{appt.time_slot}</td>
                                        <td>{appt.consultation_notes || '—'}</td>
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

export default PatientHistory;
