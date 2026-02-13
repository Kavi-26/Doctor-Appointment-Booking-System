import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import '../Dashboard.css';

const SearchDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', specialization: '', sort: '' });
    const toast = useToast();

    useEffect(() => { loadDoctors(); }, []);

    const loadDoctors = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.specialization) params.append('specialization', filters.specialization);
            if (filters.sort) params.append('sort', filters.sort);
            const res = await api.get(`/patient/doctors?${params.toString()}`);
            setDoctors(res.data || []);
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        loadDoctors();
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="page-header animate-fadeIn">
                    <div>
                        <h1>Find a Doctor 🔍</h1>
                        <p>Search and filter doctors by specialization, experience, and ratings</p>
                    </div>
                </div>

                <form className="filter-bar animate-fadeIn" onSubmit={handleSearch}>
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input className="form-input" placeholder="Search by name, qualification..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                    </div>
                    <select className="form-select" value={filters.specialization} onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}>
                        <option value="">All Specializations</option>
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
                    </select>
                    <select className="form-select" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
                        <option value="">Sort By</option>
                        <option value="experience">Experience</option>
                        <option value="rating">Rating</option>
                        <option value="fee_low">Fee: Low to High</option>
                        <option value="fee_high">Fee: High to Low</option>
                    </select>
                    <button className="btn btn-primary" type="submit">Search</button>
                </form>

                {loading ? (
                    <div className="loading-container"><div className="spinner"></div><p>Finding doctors...</p></div>
                ) : doctors.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👨‍⚕️</div>
                        <h3>No Doctors Found</h3>
                        <p>Try adjusting your search filters or check back later.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
                        {doctors.map((doc) => (
                            <div key={doc.id} className="doctor-card animate-fadeIn">
                                <div className="doctor-card-header">
                                    <div className="doctor-avatar">👨‍⚕️</div>
                                    <div className="doctor-card-info">
                                        <h3>Dr. {doc.name}</h3>
                                        <p>{doc.specialization}</p>
                                    </div>
                                </div>
                                <div className="doctor-card-details">
                                    <span>🎓 {doc.qualification}</span>
                                    <span>📋 {doc.experience} yrs exp</span>
                                </div>
                                <div className="doctor-card-rating">
                                    ⭐ {doc.avg_rating ? parseFloat(doc.avg_rating).toFixed(1) : 'No ratings'} <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>({doc.total_reviews || 0} reviews)</span>
                                </div>
                                <div className="doctor-card-fee">₹{doc.consultation_fee || 0}</div>
                                <Link to={`/patient/doctors/${doc.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                                    View Profile & Book
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchDoctors;
