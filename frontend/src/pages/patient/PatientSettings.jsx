import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const PatientSettings = () => {
    const { user, updateUser } = useAuth();
    const toast = useToast();
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', age: user?.age || '', gender: user?.gender || 'Other' });
    const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/patient/profile', form);
            updateUser(form);
            toast.success('Profile updated!');
        } catch (err) { toast.error(err.message); }
        setSaving(false);
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        if (passForm.newPass !== passForm.confirm) { toast.error('Passwords don\'t match.'); return; }
        try {
            await api.put('/patient/password', { currentPassword: passForm.current, newPassword: passForm.newPass });
            toast.success('Password changed!');
            setPassForm({ current: '', newPass: '', confirm: '' });
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn">
                    <h1>Profile Settings ⚙️</h1>
                </div>

                <div className="settings-section animate-fadeIn">
                    <div className="card">
                        <h2>Personal Information</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input className="form-input" name="phone" value={form.phone} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input className="form-input" name="age" type="number" value={form.age} onChange={handleChange} />
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
                            <button className="btn btn-primary" type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <h2>Change Password</h2>
                        <form onSubmit={handlePassword}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input className="form-input" type="password" value={passForm.current} onChange={(e) => setPassForm({ ...passForm, current: e.target.value })} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input className="form-input" type="password" value={passForm.newPass} onChange={(e) => setPassForm({ ...passForm, newPass: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm Password</label>
                                    <input className="form-input" type="password" value={passForm.confirm} onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })} required />
                                </div>
                            </div>
                            <button className="btn btn-secondary" type="submit">Change Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientSettings;
