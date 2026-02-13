import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const AdminSettings = () => {
    const [settings, setSettings] = useState({ reminder_hours: 24, appointment_duration: 30, max_bookings_per_day: 20 });
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/admin/settings');
                if (res.data) setSettings(res.data);
            } catch (err) { toast.error(err.message); }
        };
        load();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/admin/settings', settings);
            toast.success('Settings saved!');
        } catch (err) { toast.error(err.message); }
        setSaving(false);
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn"><h1>System Settings ⚙️</h1></div>
                <div className="settings-section animate-fadeIn">
                    <div className="card">
                        <h2>Appointment Settings</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Reminder Time (hours before)</label>
                                <input className="form-input" type="number" value={settings.reminder_hours} onChange={(e) => setSettings({ ...settings, reminder_hours: e.target.value })} min="1" max="72" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Default Appointment Duration (min)</label>
                                <select className="form-select" value={settings.appointment_duration} onChange={(e) => setSettings({ ...settings, appointment_duration: e.target.value })}>
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Max Bookings Per Doctor Per Day</label>
                                <input className="form-input" type="number" value={settings.max_bookings_per_day} onChange={(e) => setSettings({ ...settings, max_bookings_per_day: e.target.value })} min="1" max="100" />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
