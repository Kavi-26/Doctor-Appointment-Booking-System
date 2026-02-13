import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, role, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const getDashboardLink = () => {
        switch (role) {
            case 'patient': return '/patient/dashboard';
            case 'doctor': return '/doctor/dashboard';
            case 'admin': return '/admin/dashboard';
            default: return '/';
        }
    };

    const getNavLinks = () => {
        if (!isAuthenticated) {
            return (
                <>
                    <Link to="/patient/login" className="nav-link">Patient Login</Link>
                    <Link to="/doctor/login" className="nav-link">Doctor Login</Link>
                </>
            );
        }

        switch (role) {
            case 'patient':
                return (
                    <>
                        <Link to="/patient/dashboard" className={`nav-link ${location.pathname === '/patient/dashboard' ? 'active' : ''}`}>Dashboard</Link>
                        <Link to="/patient/search-doctors" className={`nav-link ${location.pathname === '/patient/search-doctors' ? 'active' : ''}`}>Find Doctors</Link>
                        <Link to="/patient/appointments" className={`nav-link ${location.pathname === '/patient/appointments' ? 'active' : ''}`}>Appointments</Link>
                        <Link to="/patient/notifications" className={`nav-link ${location.pathname === '/patient/notifications' ? 'active' : ''}`}>
                            Notifications
                        </Link>
                    </>
                );
            case 'doctor':
                return (
                    <>
                        <Link to="/doctor/dashboard" className={`nav-link ${location.pathname === '/doctor/dashboard' ? 'active' : ''}`}>Dashboard</Link>
                        <Link to="/doctor/appointments" className={`nav-link ${location.pathname === '/doctor/appointments' ? 'active' : ''}`}>Appointments</Link>
                        <Link to="/doctor/availability" className={`nav-link ${location.pathname === '/doctor/availability' ? 'active' : ''}`}>Availability</Link>
                        <Link to="/doctor/notifications" className={`nav-link ${location.pathname === '/doctor/notifications' ? 'active' : ''}`}>Notifications</Link>
                    </>
                );
            case 'admin':
                return (
                    <>
                        <Link to="/admin/dashboard" className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>Dashboard</Link>
                        <Link to="/admin/doctors" className={`nav-link ${location.pathname === '/admin/doctors' ? 'active' : ''}`}>Doctors</Link>
                        <Link to="/admin/patients" className={`nav-link ${location.pathname === '/admin/patients' ? 'active' : ''}`}>Patients</Link>
                        <Link to="/admin/appointments" className={`nav-link ${location.pathname === '/admin/appointments' ? 'active' : ''}`}>Appointments</Link>
                        <Link to="/admin/reports" className={`nav-link ${location.pathname === '/admin/reports' ? 'active' : ''}`}>Reports</Link>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container container">
                <Link to={isAuthenticated ? getDashboardLink() : '/'} className="navbar-logo">
                    <span className="logo-icon">🏥</span>
                    <span className="logo-text">DocBook</span>
                </Link>

                <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
                    {getNavLinks()}
                </div>

                <div className="navbar-actions">
                    <button className="btn-icon theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    {isAuthenticated && (
                        <div className="user-menu">
                            <Link to={`/${role}/settings`} className="user-avatar" title="Profile Settings">
                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </Link>
                            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}

                    <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
