import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import './Auth.css';

const PatientRegister = () => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', age: '', gender: 'Other' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
        setLoading(true);
        try {
            const res = await api.post('/auth/patient/register', { name: form.name, email: form.email, phone: form.phone, password: form.password, age: form.age ? parseInt(form.age) : null, gender: form.gender });
            login(res.data, res.data.token);
            toast.success('Registration successful! Welcome!');
            navigate('/patient/dashboard');
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container wide">
                <div className="auth-card">
                    <div className="auth-header">
                        <span className="auth-icon">🧑‍💼</span>
                        <h1>Patient Registration</h1>
                        <p>Create your account to book appointments</p>
                    </div>
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Phone *</label>
                                <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input className="form-input" name="age" type="number" value={form.age} onChange={handleChange} placeholder="25" min="1" max="120" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
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
                            {loading ? 'Registering...' : 'Create Account'}
                        </button>
                    </form>
                    <div className="auth-footer">
                        Already have an account? <Link to="/patient/login">Login here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientRegister;
