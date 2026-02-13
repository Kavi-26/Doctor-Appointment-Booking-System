import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const AdminPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => { loadPatients(); }, []);

    const loadPatients = async () => {
        try {
            const res = await api.get('/admin/patients');
            setPatients(res.data || []);
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    const toggleBlock = async (id) => {
        try {
            await api.put(`/admin/patients/${id}/block`);
            toast.success('Patient status updated.');
            loadPatients();
        } catch (err) { toast.error(err.message); }
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn"><h1>Manage Patients 🧑‍💼</h1></div>
                {loading ? <div className="loading-container"><div className="spinner"></div></div> : patients.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">🧑‍💼</div><h3>No Patients</h3></div>
                ) : (
                    <div className="table-wrapper animate-fadeIn">
                        <table className="table">
                            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Age</th><th>Gender</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {patients.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.name}</strong></td>
                                        <td>{p.email}</td>
                                        <td>{p.phone}</td>
                                        <td>{p.age || '—'}</td>
                                        <td>{p.gender}</td>
                                        <td><span className={`badge ${p.is_blocked ? 'badge-cancelled' : 'badge-confirmed'}`}>{p.is_blocked ? 'Blocked' : 'Active'}</span></td>
                                        <td><button className={`btn btn-sm ${p.is_blocked ? 'btn-success' : 'btn-danger'}`} onClick={() => toggleBlock(p.id)}>{p.is_blocked ? 'Unblock' : 'Block'}</button></td>
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

export default AdminPatients;
