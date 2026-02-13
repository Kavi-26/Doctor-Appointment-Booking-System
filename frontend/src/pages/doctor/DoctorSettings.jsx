import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const DoctorSettings = () => {
    const { user, updateUser } = useAuth();
    const toast = useToast();
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', qualification: user?.qualification || '', specialization: user?.specialization || '', experience: user?.experience || '', consultation_fee: user?.consultation_fee || '', bio: user?.bio || '' });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/doctor/profile', form);
            updateUser(form);
            toast.success('Profile updated!');
        } catch (err) { toast.error(err.message); }
        setSaving(false);
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn"><h1>Profile Settings ⚙️</h1></div>
                <div className="settings-section animate-fadeIn">
                    <div className="card">
                        <h2>Doctor Profile</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Name</label><input className="form-input" name="name" value={form.name} onChange={handleChange} /></div>
                                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" name="phone" value={form.phone} onChange={handleChange} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Qualification</label><input className="form-input" name="qualification" value={form.qualification} onChange={handleChange} /></div>
                                <div className="form-group"><label className="form-label">Specialization</label><input className="form-input" name="specialization" value={form.specialization} onChange={handleChange} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Experience (years)</label><input className="form-input" name="experience" type="number" value={form.experience} onChange={handleChange} /></div>
                                <div className="form-group"><label className="form-label">Consultation Fee (₹)</label><input className="form-input" name="consultation_fee" type="number" value={form.consultation_fee} onChange={handleChange} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" name="bio" value={form.bio} onChange={handleChange} rows="3" /></div>
                            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorSettings;
