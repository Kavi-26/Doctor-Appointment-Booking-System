import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [doctor, setDoctor] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    useEffect(() => { loadDoctor(); }, [id]);

    const loadDoctor = async () => {
        try {
            const res = await api.get(`/patient/doctors/${id}`);
            setDoctor(res.data);
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    const loadSlots = async (date) => {
        setSelectedDate(date);
        setSelectedTime('');
        try {
            const res = await api.get(`/patient/doctors/${id}/slots?date=${date}`);
            setSlots(res.data || []);
        } catch (err) { toast.error(err.message); }
    };

    const handleBook = async () => {
        if (!selectedDate || !selectedTime) { toast.warning('Please select date and time slot.'); return; }
        setBooking(true);
        try {
            await api.post('/patient/appointments', { doctor_id: id, appointment_date: selectedDate, appointment_time: selectedTime, reason });
            toast.success('Appointment booked successfully!');
            navigate('/patient/appointments');
        } catch (err) { toast.error(err.message); }
        setBooking(false);
    };

    if (loading) return <div className="loading-container" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
    if (!doctor) return <div className="empty-state" style={{ minHeight: '60vh' }}><h3>Doctor not found</h3></div>;

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    return (
        <div className="dashboard-page">
            <div className="container">
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)' }}>← Back</button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 'var(--space-8)', alignItems: 'start' }}>
                    {/* Doctor Info */}
                    <div className="card animate-fadeIn">
                        <div className="doctor-card-header" style={{ marginBottom: 'var(--space-6)' }}>
                            <div className="doctor-avatar" style={{ width: 80, height: 80, fontSize: 36 }}>👨‍⚕️</div>
                            <div className="doctor-card-info">
                                <h3 style={{ fontSize: 'var(--font-size-2xl)' }}>Dr. {doctor.name}</h3>
                                <p>{doctor.specialization}</p>
                                <div className="doctor-card-rating" style={{ marginTop: 'var(--space-2)', marginBottom: 0 }}>
                                    ⭐ {doctor.avg_rating ? parseFloat(doctor.avg_rating).toFixed(1) : 'New'} ({doctor.total_reviews || 0} reviews)
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                            <div><strong>Qualification:</strong> {doctor.qualification}</div>
                            <div><strong>Experience:</strong> {doctor.experience} years</div>
                            <div><strong>License:</strong> {doctor.license_number}</div>
                            <div><strong>Fee:</strong> <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>₹{doctor.consultation_fee}</span></div>
                        </div>
                        {doctor.bio && <div><strong>About:</strong><p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>{doctor.bio}</p></div>}
                    </div>

                    {/* Booking Panel */}
                    <div className="card animate-slideInRight" style={{ position: 'sticky', top: 80 }}>
                        <h2 style={{ marginBottom: 'var(--space-6)' }}>📅 Book Appointment</h2>
                        <div className="form-group">
                            <label className="form-label">Select Date</label>
                            <input className="form-input" type="date" min={minDate} max={maxDate} value={selectedDate} onChange={(e) => loadSlots(e.target.value)} />
                        </div>

                        {selectedDate && (
                            <div className="form-group">
                                <label className="form-label">Available Slots</label>
                                {slots.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>No available slots for this date.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                        {slots.map(slot => (
                                            <button key={slot} className={`btn btn-sm ${selectedTime === slot ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedTime(slot)}>
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Reason for Visit (optional)</label>
                            <textarea className="form-textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe your symptoms or reason..." rows="3" />
                        </div>

                        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleBook} disabled={booking || !selectedDate || !selectedTime}>
                            {booking ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
