import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import './Auth.css';

const DoctorLogin = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/doctor/login', form);
            login(res.data, res.data.token);
            toast.success(`Welcome, Dr. ${res.data.name}!`);
            navigate('/doctor/dashboard');
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <span className="auth-icon">👨‍⚕️</span>
                        <h1>Doctor Login</h1>
                        <p>Access your doctor dashboard</p>
                    </div>
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="auth-footer">
                        Not registered? <Link to="/doctor/register">Register here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorLogin;
