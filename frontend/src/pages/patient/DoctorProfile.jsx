import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import './DoctorProfile.css';

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
            const res = await api.get(`/patient/doctors/${id}/availability?date=${date}`);
            const data = res.data || {};
            // Generate time slots from schedule, excluding booked ones
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
            const schedule = (data.schedule || []).find(s => s.day_of_week === dayName);
            if (!schedule) { setSlots([]); return; }
            const generated = [];
            let [sh, sm] = schedule.start_time.split(':').map(Number);
            const [eh, em] = schedule.end_time.split(':').map(Number);
            while (sh < eh || (sh === eh && sm < em)) {
                const slot = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
                if (!(data.bookedSlots || []).includes(slot)) generated.push(slot);
                sm += 30;
                if (sm >= 60) { sh++; sm = 0; }
            }
            setSlots(generated);
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

    const rating = doctor.avg_rating ? parseFloat(doctor.avg_rating).toFixed(1) : null;
    const stars = rating ? '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating)) : '☆☆☆☆☆';

    return (
        <div className="dp-page">
            <div className="container">
                <button onClick={() => navigate(-1)} className="dp-back-btn">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M13 16l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Back
                </button>

                <div className="dp-layout">
                    {/* ─── Left: Doctor Info ─── */}
                    <div className="dp-info-col">
                        {/* Hero Card */}
                        <div className="dp-hero-card">
                            <div className="dp-hero-bg"></div>
                            <div className="dp-hero-content">
                                <div className="dp-avatar">
                                    <span>👨‍⚕️</span>
                                </div>
                                <div className="dp-hero-text">
                                    <h1>Dr. {doctor.name}</h1>
                                    <span className="dp-spec-badge">{doctor.specialization}</span>
                                    <div className="dp-rating">
                                        <span className="dp-stars">{stars}</span>
                                        <span className="dp-rating-text">
                                            {rating || 'New'} ({doctor.total_reviews || 0} reviews)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="dp-stats-row">
                            <div className="dp-stat-card">
                                <span className="dp-stat-icon">🎓</span>
                                <div>
                                    <strong>{doctor.qualification}</strong>
                                    <span>Qualification</span>
                                </div>
                            </div>
                            <div className="dp-stat-card">
                                <span className="dp-stat-icon">⏱️</span>
                                <div>
                                    <strong>{doctor.experience} Years</strong>
                                    <span>Experience</span>
                                </div>
                            </div>
                            <div className="dp-stat-card">
                                <span className="dp-stat-icon">💰</span>
                                <div>
                                    <strong>₹{parseFloat(doctor.consultation_fee).toFixed(0)}</strong>
                                    <span>Consultation Fee</span>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        {doctor.bio && (
                            <div className="dp-about-card">
                                <h3>About Doctor</h3>
                                <p>{doctor.bio}</p>
                            </div>
                        )}
                    </div>

                    {/* ─── Right: Booking Panel ─── */}
                    <div className="dp-booking-col">
                        <div className="dp-booking-card">
                            <div className="dp-booking-header">
                                <h2>Book Appointment</h2>
                                <span className="dp-fee-tag">₹{parseFloat(doctor.consultation_fee).toFixed(0)}</span>
                            </div>

                            <div className="dp-booking-body">
                                <div className="dp-booking-field">
                                    <label>
                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M3 8h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                        Select Date
                                    </label>
                                    <input
                                        type="date"
                                        min={minDate}
                                        max={maxDate}
                                        value={selectedDate}
                                        onChange={(e) => loadSlots(e.target.value)}
                                        className="dp-date-input"
                                    />
                                </div>

                                {selectedDate && (
                                    <div className="dp-booking-field">
                                        <label>
                                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                            Available Time Slots
                                        </label>
                                        {slots.length === 0 ? (
                                            <div className="dp-no-slots">
                                                <span>😕</span>
                                                <p>No slots available for this date</p>
                                            </div>
                                        ) : (
                                            <div className="dp-slots-grid">
                                                {slots.map(slot => (
                                                    <button
                                                        key={slot}
                                                        className={`dp-slot-btn ${selectedTime === slot ? 'active' : ''}`}
                                                        onClick={() => setSelectedTime(slot)}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="dp-booking-field">
                                    <label>
                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 4h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" /><path d="M6 8h8M6 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                        Reason for Visit <span className="dp-optional">(optional)</span>
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Describe your symptoms or reason for consultation..."
                                        rows="3"
                                        className="dp-textarea"
                                    />
                                </div>
                            </div>

                            <div className="dp-booking-footer">
                                {selectedDate && selectedTime && (
                                    <div className="dp-summary">
                                        <div><span>📅</span> {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                                        <div><span>🕐</span> {selectedTime}</div>
                                        <div><span>💰</span> ₹{parseFloat(doctor.consultation_fee).toFixed(0)}</div>
                                    </div>
                                )}
                                <button
                                    className="dp-book-btn"
                                    onClick={handleBook}
                                    disabled={booking || !selectedDate || !selectedTime}
                                >
                                    {booking ? (
                                        <><div className="spinner-sm"></div> Booking...</>
                                    ) : (
                                        <>Confirm Booking<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
