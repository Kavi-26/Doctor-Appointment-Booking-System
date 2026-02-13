import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const DoctorAvailability = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSlot, setNewSlot] = useState({ day_of_week: '1', start_time: '09:00', end_time: '17:00', slot_duration: '30' });
    const toast = useToast();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => { loadSlots(); }, []);

    const loadSlots = async () => {
        try {
            const res = await api.get('/doctor/availability');
            setSlots(res.data || []);
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    const addSlot = async (e) => {
        e.preventDefault();
        try {
            await api.post('/doctor/availability', { day_of_week: parseInt(newSlot.day_of_week), start_time: newSlot.start_time, end_time: newSlot.end_time, slot_duration: parseInt(newSlot.slot_duration) });
            toast.success('Availability added!');
            loadSlots();
        } catch (err) { toast.error(err.message); }
    };

    const deleteSlot = async (id) => {
        try {
            await api.delete(`/doctor/availability/${id}`);
            toast.success('Slot removed.');
            loadSlots();
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn">
                    <h1>Manage Availability ⏰</h1>
                </div>

                <div className="content-grid" style={{ gridTemplateColumns: '400px 1fr' }}>
                    <div className="card animate-fadeIn">
                        <h2 style={{ marginBottom: 'var(--space-6)' }}>Add Availability</h2>
                        <form onSubmit={addSlot}>
                            <div className="form-group">
                                <label className="form-label">Day of Week</label>
                                <select className="form-select" value={newSlot.day_of_week} onChange={(e) => setNewSlot({ ...newSlot, day_of_week: e.target.value })}>
                                    {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Start Time</label>
                                    <input className="form-input" type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Time</label>
                                    <input className="form-input" type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Slot Duration (min)</label>
                                <select className="form-select" value={newSlot.slot_duration} onChange={(e) => setNewSlot({ ...newSlot, slot_duration: e.target.value })}>
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                </select>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Add Slot</button>
                        </form>
                    </div>

                    <div className="section-card animate-fadeIn">
                        <div className="section-card-header"><h2>Current Schedule</h2></div>
                        <div className="section-card-body">
                            {loading ? (
                                <div className="loading-container"><div className="spinner"></div></div>
                            ) : slots.length === 0 ? (
                                <div className="empty-state"><div className="empty-state-icon">⏰</div><h3>No Availability Set</h3><p>Add your working hours to start accepting appointments.</p></div>
                            ) : (
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead><tr><th>Day</th><th>Start</th><th>End</th><th>Duration</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {slots.map(slot => (
                                                <tr key={slot.id}>
                                                    <td><strong>{days[slot.day_of_week]}</strong></td>
                                                    <td>{slot.start_time}</td>
                                                    <td>{slot.end_time}</td>
                                                    <td>{slot.slot_duration} min</td>
                                                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteSlot(slot.id)}>Remove</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorAvailability;
