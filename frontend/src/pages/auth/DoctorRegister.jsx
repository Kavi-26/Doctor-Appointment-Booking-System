import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import './Auth.css';

const DoctorRegister = () => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', qualification: '', specialization: '', experience: '', license_number: '', consultation_fee: '', bio: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
        setLoading(true);
        try {
            await api.post('/auth/doctor/register', {
                name: form.name, email: form.email, phone: form.phone, password: form.password,
                qualification: form.qualification, specialization: form.specialization,
                experience: form.experience ? parseInt(form.experience) : 0,
                license_number: form.license_number,
                consultation_fee: form.consultation_fee ? parseFloat(form.consultation_fee) : 0,
                bio: form.bio
            });
            setSuccess(true);
            toast.success('Registration submitted! Awaiting admin approval.');
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card auth-success">
                        <span className="auth-success-icon">✅</span>
                        <h2>Registration Submitted!</h2>
                        <p>Your account is pending admin approval. You'll be notified once approved.</p>
                        <Link to="/doctor/login" className="btn btn-primary">Go to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container wide">
                <div className="auth-card">
                    <div className="auth-header">
                        <span className="auth-icon">👨‍⚕️</span>
                        <h1>Doctor Registration</h1>
                        <p>Join our platform to connect with patients</p>
                    </div>
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Dr. John Smith" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="doctor@example.com" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Phone *</label>
                                <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">License Number *</label>
                                <input className="form-input" name="license_number" value={form.license_number} onChange={handleChange} placeholder="MCI-12345" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Qualification *</label>
                                <input className="form-input" name="qualification" value={form.qualification} onChange={handleChange} placeholder="MBBS, MD Cardiology" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Specialization *</label>
                                <select className="form-select" name="specialization" value={form.specialization} onChange={handleChange} required>
                                    <option value="">Select Specialization</option>
                                    <option value="General Medicine">General Medicine</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Dermatology">Dermatology</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Gynecology">Gynecology</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Ophthalmology">Ophthalmology</option>
                                    <option value="ENT">ENT</option>
                                    <option value="Psychiatry">Psychiatry</option>
                                    <option value="Dentistry">Dentistry</option>
                                    <option value="Oncology">Oncology</option>
                                    <option value="Urology">Urology</option>
                                    <option value="Pulmonology">Pulmonology</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Experience (years)</label>
                                <input className="form-input" name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="5" min="0" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Consultation Fee (₹)</label>
                                <input className="form-input" name="consultation_fee" type="number" value={form.consultation_fee} onChange={handleChange} placeholder="500" min="0" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Bio</label>
                            <textarea className="form-textarea" name="bio" value={form.bio} onChange={handleChange} placeholder="Brief description about yourself..." rows="3" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Password *</label>
                                <input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password *</label>
                                <input className="form-input" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required />
                            </div>
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Registration'}
                        </button>
                    </form>
                    <div className="auth-footer">
                        Already registered? <Link to="/doctor/login">Login here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorRegister;
