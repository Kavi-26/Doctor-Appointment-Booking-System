import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-blob blob-1"></div>
                    <div className="hero-blob blob-2"></div>
                    <div className="hero-blob blob-3"></div>
                </div>
                <div className="container hero-content">
                    <div className="hero-text animate-fadeIn">
                        <span className="hero-badge">🏥 Trusted Healthcare Platform</span>
                        <h1 className="hero-title">
                            Your Health, <br />
                            <span className="gradient-text">Our Priority</span>
                        </h1>
                        <p className="hero-subtitle">
                            Book appointments with top-rated doctors instantly.
                            Smart scheduling, real-time availability, and seamless healthcare management — all in one place.
                        </p>
                        <div className="hero-actions">
                            <Link to="/patient/register" className="btn btn-primary btn-lg">
                                Book Appointment →
                            </Link>
                            <Link to="/doctor/register" className="btn btn-secondary btn-lg">
                                Join as Doctor
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="hero-stat-value">500+</span>
                                <span className="hero-stat-label">Doctors</span>
                            </div>
                            <div className="hero-stat">
                                <span className="hero-stat-value">10K+</span>
                                <span className="hero-stat-label">Appointments</span>
                            </div>
                            <div className="hero-stat">
                                <span className="hero-stat-value">98%</span>
                                <span className="hero-stat-label">Satisfaction</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual animate-slideInRight">
                        <div className="doctor-card-preview glass-card">
                            <div className="preview-avatar">👨‍⚕️</div>
                            <h3>Dr. Sarah Johnson</h3>
                            <p>Cardiologist • 15 yrs exp</p>
                            <div className="preview-rating">⭐⭐⭐⭐⭐ <span>4.9</span></div>
                            <div className="preview-slots">
                                <span className="slot">10:00 AM</span>
                                <span className="slot">11:30 AM</span>
                                <span className="slot active">2:00 PM</span>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }}>Book Now</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Features</span>
                        <h2 className="section-title">Everything You Need</h2>
                        <p className="section-subtitle">A complete healthcare booking platform for patients, doctors, and administrators</p>
                    </div>
                    <div className="features-grid">
                        {[
                            { icon: '🔍', title: 'Smart Doctor Search', desc: 'Filter by specialization, experience, ratings, and availability to find the perfect doctor.' },
                            { icon: '📅', title: 'Real-Time Booking', desc: 'See live availability and book appointments instantly with automatic slot management.' },
                            { icon: '🔔', title: 'Smart Notifications', desc: 'Get automatic reminders, booking confirmations, and cancellation alerts via email and in-app.' },
                            { icon: '⭐', title: 'Ratings & Reviews', desc: 'Read genuine patient reviews and ratings to make informed healthcare decisions.' },
                            { icon: '📋', title: 'Digital Prescriptions', desc: 'Doctors can upload prescriptions and consultation notes digitally for easy access.' },
                            { icon: '🔒', title: 'Secure & Private', desc: 'Enterprise-grade security with encrypted passwords and secure authentication.' },
                            { icon: '📊', title: 'Analytics Dashboard', desc: 'Comprehensive reports and analytics for administrators to monitor system performance.' },
                            { icon: '📱', title: 'Responsive Design', desc: 'Access the platform from any device — desktop, tablet, or mobile phone.' },
                            { icon: '🌙', title: 'Dark Mode', desc: 'Switch between light and dark themes for comfortable viewing anytime.' },
                        ].map((feature, i) => (
                            <div key={i} className={`feature-card card animate-fadeIn stagger-${(i % 5) + 1}`}>
                                <span className="feature-icon">{feature.icon}</span>
                                <h3>{feature.title}</h3>
                                <p>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">How It Works</span>
                        <h2 className="section-title">3 Simple Steps</h2>
                    </div>
                    <div className="steps-grid">
                        <div className="step-card animate-fadeIn stagger-1">
                            <div className="step-number">1</div>
                            <h3>Create Account</h3>
                            <p>Sign up as a patient or doctor with your basic information.</p>
                        </div>
                        <div className="step-connector">→</div>
                        <div className="step-card animate-fadeIn stagger-2">
                            <div className="step-number">2</div>
                            <h3>Find & Book</h3>
                            <p>Search doctors, check availability, and book your preferred slot.</p>
                        </div>
                        <div className="step-connector">→</div>
                        <div className="step-card animate-fadeIn stagger-3">
                            <div className="step-number">3</div>
                            <h3>Get Care</h3>
                            <p>Visit the doctor at your scheduled time. Rate and review afterwards.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roles Section */}
            <section className="roles-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">For Everyone</span>
                        <h2 className="section-title">Built for All Users</h2>
                    </div>
                    <div className="roles-grid">
                        <div className="role-card card animate-fadeIn stagger-1">
                            <div className="role-icon patient-icon">🧑‍💼</div>
                            <h3>For Patients</h3>
                            <ul>
                                <li>✅ Search & book appointments</li>
                                <li>✅ View appointment history</li>
                                <li>✅ Get reminders & notifications</li>
                                <li>✅ Rate & review doctors</li>
                                <li>✅ Download prescriptions</li>
                            </ul>
                            <Link to="/patient/register" className="btn btn-primary" style={{ width: '100%' }}>
                                Register as Patient
                            </Link>
                        </div>
                        <div className="role-card card animate-fadeIn stagger-2">
                            <div className="role-icon doctor-icon">👨‍⚕️</div>
                            <h3>For Doctors</h3>
                            <ul>
                                <li>✅ Manage appointments</li>
                                <li>✅ Set your availability</li>
                                <li>✅ Upload prescriptions</li>
                                <li>✅ Track earnings</li>
                                <li>✅ Block holidays</li>
                            </ul>
                            <Link to="/doctor/register" className="btn btn-accent" style={{ width: '100%' }}>
                                Register as Doctor
                            </Link>
                        </div>
                        <div className="role-card card animate-fadeIn stagger-3">
                            <div className="role-icon admin-icon">🛡️</div>
                            <h3>For Admins</h3>
                            <ul>
                                <li>✅ Approve doctor registrations</li>
                                <li>✅ Manage all users</li>
                                <li>✅ Monitor appointments</li>
                                <li>✅ View reports & analytics</li>
                                <li>✅ Configure system settings</li>
                            </ul>
                            <Link to="/admin/login" className="btn btn-secondary" style={{ width: '100%' }}>
                                Admin Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container footer-content">
                    <div className="footer-brand">
                        <span className="logo-icon">🏥</span>
                        <span className="logo-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>DocBook</span>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                            Doctor Appointment Booking System
                        </p>
                    </div>
                    <div className="footer-links">
                        <div>
                            <h4>Quick Links</h4>
                            <Link to="/patient/register">Patient Sign Up</Link>
                            <Link to="/doctor/register">Doctor Sign Up</Link>
                            <Link to="/admin/login">Admin Login</Link>
                        </div>
                        <div>
                            <h4>Features</h4>
                            <span>Online Booking</span>
                            <span>Smart Reminders</span>
                            <span>Digital Prescriptions</span>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 DocBook — Doctor Appointment Booking System. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
