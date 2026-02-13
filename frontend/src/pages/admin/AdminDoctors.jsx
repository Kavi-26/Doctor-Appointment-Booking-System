import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const toast = useToast();

    useEffect(() => { loadDoctors(); }, []);

    const loadDoctors = async () => {
        try {
            const res = await api.get('/admin/doctors');
            setDoctors(res.data || []);
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    const handleAction = async (id, action) => {
        try {
            await api.put(`/admin/doctors/${id}/${action}`);
            toast.success(`Doctor ${action}d.`);
            loadDoctors();
        } catch (err) { toast.error(err.message); }
    };

    const handleRemove = async (id) => {
        if (!confirm('Remove this doctor?')) return;
        try {
            await api.delete(`/admin/doctors/${id}`);
            toast.success('Doctor removed.');
            loadDoctors();
        } catch (err) { toast.error(err.message); }
    };

    const filtered = filter === 'all' ? doctors : doctors.filter(d => d.status === filter);

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn"><h1>Manage Doctors 👨‍⚕️</h1></div>
                <div className="filter-bar animate-fadeIn">
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                        <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${doctors.filter(d => d.status === f).length})`}
                        </button>
                    ))}
                </div>

                {loading ? <div className="loading-container"><div className="spinner"></div></div> : filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">👨‍⚕️</div><h3>No Doctors</h3></div>
                ) : (
                    <div className="table-wrapper animate-fadeIn">
                        <table className="table">
                            <thead><tr><th>Name</th><th>Email</th><th>Specialization</th><th>Experience</th><th>License</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filtered.map(doc => (
                                    <tr key={doc.id}>
                                        <td><strong>Dr. {doc.name}</strong></td>
                                        <td>{doc.email}</td>
                                        <td>{doc.specialization}</td>
                                        <td>{doc.experience} yrs</td>
                                        <td>{doc.license_number}</td>
                                        <td><span className={`badge badge-${doc.status === 'approved' ? 'confirmed' : doc.status}`}>{doc.status}</span></td>
                                        <td className="appointment-actions">
                                            {doc.status === 'pending' && <>
                                                <button className="btn btn-success btn-sm" onClick={() => handleAction(doc.id, 'approve')}>Approve</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleAction(doc.id, 'reject')}>Reject</button>
                                            </>}
                                            {doc.status !== 'pending' && <button className="btn btn-danger btn-sm" onClick={() => handleRemove(doc.id)}>Remove</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDoctors;
