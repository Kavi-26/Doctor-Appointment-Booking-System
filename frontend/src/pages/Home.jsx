import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

/* ── tiny counter hook ── */
const useCounter = (end, duration = 2000) => {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                const step = end / (duration / 16);
                let cur = 0;
                const tick = () => { cur += step; if (cur >= end) { setVal(end); return; } setVal(Math.floor(cur)); requestAnimationFrame(tick); };
                tick();
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);

    return [val, ref];
};

const Home = () => {
    /* ── Intersection-Observer reveal ── */
    useEffect(() => {
        const els = document.querySelectorAll('.reveal');
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
        }, { threshold: 0.15 });
        els.forEach(el => io.observe(el));
        return () => io.disconnect();
    }, []);

    const [docs, docsRef] = useCounter(500);
    const [appts, apptsRef] = useCounter(10000);
    const [sat, satRef] = useCounter(98);

    const features = [
        { icon: '🔍', title: 'Smart Doctor Search', desc: 'Filter by specialization, experience, ratings, and availability to find your perfect doctor in seconds.', color: '#3b82f6' },
        { icon: '📅', title: 'Instant Booking', desc: 'See real-time availability and book appointments instantly — no phone calls or waitlists needed.', color: '#8b5cf6' },
        { icon: '🔔', title: 'Smart Reminders', desc: 'Never miss an appointment with automatic email reminders and in-app notifications.', color: '#f59e0b' },
        { icon: '⭐', title: 'Ratings & Reviews', desc: 'Read genuine patient reviews and ratings to make confident healthcare decisions.', color: '#10b981' },
        { icon: '📋', title: 'Digital Records', desc: 'Access prescriptions and consultation notes digitally from anywhere, anytime.', color: '#ec4899' },
        { icon: '🔒', title: 'Bank-Grade Security', desc: 'Your health data stays safe with encrypted passwords and JWT-secured sessions.', color: '#6366f1' },
    ];

    const testimonials = [
        { name: 'Priya S.', role: 'Patient', text: 'Booking used to take 30 minutes on the phone. Now it takes 30 seconds. This platform is a game-changer!', avatar: '👩' },
        { name: 'Dr. Arun K.', role: 'Cardiologist', text: 'Managing my schedule has never been easier. I can focus on patients instead of paperwork.', avatar: '👨‍⚕️' },
        { name: 'Meena R.', role: 'Patient', text: "I love the reminder notifications. I haven't missed an appointment since I started using DocBook.", avatar: '👩‍💼' },
    ];

    return (
        <div className="home">

            {/* ─── HERO ─── */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-blob blob-1"></div>
                    <div className="hero-blob blob-2"></div>
                    <div className="hero-blob blob-3"></div>
                    <div className="hero-grid-pattern"></div>
                </div>

                <div className="container hero-content">
                    <div className="hero-text">
                        <span className="hero-badge animate-fadeIn">
                            <span className="badge-dot"></span>
                            Trusted Healthcare Platform
                        </span>
                        <h1 className="hero-title animate-fadeIn">
                            Your Health,<br />
                            <span className="gradient-text">Our Priority</span>
                        </h1>
                        <p className="hero-subtitle animate-fadeIn" style={{ animationDelay: '0.15s' }}>
                            Book appointments with top-rated doctors instantly. Smart scheduling, real-time availability, and seamless healthcare management — all in one place.
                        </p>
                        <div className="hero-actions animate-fadeIn" style={{ animationDelay: '0.25s' }}>
                            <Link to="/patient/register" className="btn-hero-primary">
                                <span>Get Started Free</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </Link>
                            <Link to="/doctor/register" className="btn-hero-secondary">
                                Join as Doctor
                            </Link>
                        </div>
                    </div>

                    <div className="hero-visual animate-slideInRight">
                        {/* Floating appointment card */}
                        <div className="hero-card glass-card">
                            <div className="hero-card-status"><span className="pulse-dot"></span> Available Now</div>
                            <div className="hero-card-avatar">👨‍⚕️</div>
                            <h3>Dr. Sarah Johnson</h3>
                            <p className="hero-card-spec">Cardiologist · 15 yrs exp</p>
                            <div className="hero-card-rating">
                                {'★★★★★'.split('').map((s, i) => <span key={i} className="star">{s}</span>)}
                                <span className="rating-val">4.9</span>
                            </div>
                            <div className="hero-card-slots">
                                <span className="slot-chip">10:00 AM</span>
                                <span className="slot-chip">11:30 AM</span>
                                <span className="slot-chip active">2:00 PM</span>
                            </div>
                            <button className="btn-book-now">Book Appointment</button>
                        </div>

                        {/* Floating mini-cards */}
                        <div className="float-chip chip-1 glass-card">✅ Appointment Confirmed</div>
                        <div className="float-chip chip-2 glass-card">⭐ 4.9 Rating</div>
                        <div className="float-chip chip-3 glass-card">🔔 Reminder Set</div>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="hero-stats-bar">
                    <div className="container stats-inner">
                        <div className="stat-pill" ref={docsRef}>
                            <span className="stat-num">{docs}+</span>
                            <span className="stat-lbl">Verified Doctors</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-pill" ref={apptsRef}>
                            <span className="stat-num">{appts.toLocaleString()}+</span>
                            <span className="stat-lbl">Appointments Booked</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-pill" ref={satRef}>
                            <span className="stat-num">{sat}%</span>
                            <span className="stat-lbl">Patient Satisfaction</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header reveal">
                        <span className="section-badge">Why DocBook</span>
                        <h2 className="section-title">Everything You Need in One Platform</h2>
                        <p className="section-subtitle">Built for patients, optimized for doctors, managed by admins.</p>
                    </div>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="feature-card reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                                <div className="feature-icon-wrap" style={{ '--accent': f.color }}>
                                    <span className="feature-icon">{f.icon}</span>
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className="how-section">
                <div className="container">
                    <div className="section-header reveal">
                        <span className="section-badge">How It Works</span>
                        <h2 className="section-title">3 Simple Steps to Better Healthcare</h2>
                    </div>
                    <div className="steps-track reveal">
                        <div className="steps-line"></div>
                        {[
                            { num: '01', title: 'Create Account', desc: 'Sign up as a patient or doctor with your basic information in under a minute.', icon: '👤' },
                            { num: '02', title: 'Find & Book', desc: 'Search doctors, check real-time availability, and book your preferred time slot.', icon: '🗓️' },
                            { num: '03', title: 'Get Care', desc: 'Visit the doctor at your scheduled time. Rate & review your experience.', icon: '💚' },
                        ].map((s, i) => (
                            <div key={i} className="step-item" style={{ transitionDelay: `${i * 0.15}s` }}>
                                <div className="step-icon-wrap">
                                    <span className="step-num">{s.num}</span>
                                    <span className="step-emoji">{s.icon}</span>
                                </div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS ─── */}
            <section className="testimonials-section">
                <div className="container">
                    <div className="section-header reveal">
                        <span className="section-badge">Testimonials</span>
                        <h2 className="section-title">Loved by Thousands</h2>
                    </div>
                    <div className="testimonials-grid">
                        {testimonials.map((t, i) => (
                            <div key={i} className="testimonial-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                                <div className="testimonial-stars">★★★★★</div>
                                <p className="testimonial-text">"{t.text}"</p>
                                <div className="testimonial-author">
                                    <span className="testimonial-avatar">{t.avatar}</span>
                                    <div>
                                        <strong>{t.name}</strong>
                                        <span>{t.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card reveal">
                        <div className="cta-bg-orb"></div>
                        <h2>Ready to Take Control of Your Health?</h2>
                        <p>Join thousands of patients and doctors who trust DocBook for seamless healthcare management.</p>
                        <div className="cta-actions">
                            <Link to="/patient/register" className="btn-hero-primary">
                                <span>Sign Up as Patient</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </Link>
                            <Link to="/doctor/register" className="btn-hero-secondary" style={{ borderColor: 'rgba(255,255,255,.3)', color: '#fff' }}>
                                Register as Doctor
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="footer">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <span className="logo-icon">🏥</span>
                            <span className="footer-logo-text">DocBook</span>
                        </div>
                        <p>Your trusted online doctor appointment booking platform. Smart scheduling for a healthier tomorrow.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <Link to="/patient/register">Patient Sign Up</Link>
                        <Link to="/doctor/register">Doctor Sign Up</Link>
                        <Link to="/patient/login">Patient Login</Link>
                        <Link to="/doctor/login">Doctor Login</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Features</h4>
                        <span>Online Booking</span>
                        <span>Smart Reminders</span>
                        <span>Digital Prescriptions</span>
                        <span>Ratings & Reviews</span>
                    </div>
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <span>📧 support@docbook.com</span>
                        <span>📞 +91 98765 43210</span>
                        <span>📍 Chennai, India</span>
                    </div>
                </div>
                <div className="container footer-bottom">
                    <p>© 2026 DocBook — Doctor Appointment Booking System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
