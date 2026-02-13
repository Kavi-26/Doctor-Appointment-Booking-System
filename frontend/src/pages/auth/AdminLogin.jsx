import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import './Auth.css';

const AdminLogin = () => {
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
            const res = await api.post('/auth/admin/login', form);
            login(res.data, res.data.token);
            toast.success('Welcome, Admin!');
            navigate('/admin/dashboard');
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <span className="auth-icon">🛡️</span>
                        <h1>Admin Login</h1>
                        <p>Secure admin access only</p>
                    </div>
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@system.com" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter admin password" required />
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Admin Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
