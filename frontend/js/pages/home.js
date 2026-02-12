/* ═══════════════════════════════════════════════════════════
   Home / Landing Page
   ═══════════════════════════════════════════════════════════ */

const HomePage = {
    render() {
        return `
        <div class="animate-fade">
            <!-- Hero Section -->
            <section style="background: var(--gradient-hero); padding: 100px 0 80px; position: relative; overflow: hidden;">
                <div style="position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
                <div style="position:absolute;bottom:-50px;left:-50px;width:300px;height:300px;background:rgba(255,255,255,0.03);border-radius:50%"></div>
                <div class="container" style="position:relative;z-index:1;">
                    <div style="max-width:650px;">
                        <h1 style="font-size:var(--fs-4xl);color:white;margin-bottom:var(--space-lg);line-height:1.1;">
                            Book Doctor<br>Appointments<br>
                            <span style="background:linear-gradient(135deg,#00D4AA,#33DDBB);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">with Ease</span>
                        </h1>
                        <p style="color:rgba(255,255,255,0.8);font-size:var(--fs-lg);margin-bottom:var(--space-2xl);line-height:1.7;">
                            Connect with top healthcare professionals. Schedule appointments in seconds, 
                            get real-time availability, and receive instant confirmations.
                        </p>
                        <div style="display:flex;gap:var(--space-md);flex-wrap:wrap;">
                            <a href="#/patient/register" class="btn btn-accent btn-lg">Get Started — It's Free</a>
                            <a href="#/doctor/register" class="btn btn-lg" style="background:rgba(255,255,255,0.15);color:white;backdrop-filter:blur(10px);">Join as Doctor</a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section style="padding:80px 0;">
                <div class="container">
                    <h2 class="text-center" style="font-size:var(--fs-3xl);margin-bottom:var(--space-sm);">Why Choose DocBook?</h2>
                    <p class="text-center text-muted" style="margin-bottom:var(--space-3xl);max-width:500px;margin-left:auto;margin-right:auto;">
                        A modern healthcare platform designed to make booking easy, fast, and secure.
                    </p>
                    <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));">
                        ${this.featureCard('search', 'Find Top Doctors', 'Search by specialization, ratings, and experience. View detailed profiles and real-time availability.', 'var(--gradient-primary)')}
                        ${this.featureCard('calendar-check', 'Instant Booking', 'Book appointments in seconds with real-time slot availability. No phone calls needed.', 'var(--gradient-accent)')}
                        ${this.featureCard('bell-ring', 'Smart Reminders', 'Get automatic reminders 24 hours before your appointment. Never miss a visit again.', 'var(--gradient-warm)')}
                        ${this.featureCard('shield-check', 'Secure & Private', 'Your medical data is encrypted and private. Secure login with JWT authentication.', 'var(--gradient-ocean)')}
                        ${this.featureCard('star', 'Ratings & Reviews', 'Read patient reviews and ratings to find the best doctor for your needs.', 'var(--gradient-sunset)')}
                        ${this.featureCard('clock', 'Save Time', 'No more waiting in long queues. Book from anywhere, anytime, on any device.', 'linear-gradient(135deg, #a18cd1, #fbc2eb)')}
                    </div>
                </div>
            </section>

            <!-- How It Works -->
            <section style="padding:80px 0;background:var(--bg-secondary);">
                <div class="container">
                    <h2 class="text-center" style="font-size:var(--fs-3xl);margin-bottom:var(--space-3xl);">How It Works</h2>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:var(--space-2xl);">
                        ${this.stepCard(1, 'Create Account', 'Sign up as a patient in seconds. Fill in your basic details and get started.')}
                        ${this.stepCard(2, 'Find Your Doctor', 'Search and filter doctors by specialization, ratings, and availability.')}
                        ${this.stepCard(3, 'Book Appointment', 'Select your preferred date and time slot. Confirm your booking instantly.')}
                        ${this.stepCard(4, 'Get Treated', 'Visit your doctor at the scheduled time. Leave a review after your visit.')}
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section style="padding:80px 0;">
                <div class="container text-center">
                    <div style="background:var(--gradient-hero);border-radius:var(--radius-xl);padding:60px 40px;position:relative;overflow:hidden;">
                        <div style="position:absolute;top:-30%;right:-10%;width:300px;height:300px;background:rgba(255,255,255,0.06);border-radius:50%;"></div>
                        <h2 style="font-size:var(--fs-3xl);color:white;margin-bottom:var(--space-md);">Ready to Get Started?</h2>
                        <p style="color:rgba(255,255,255,0.8);font-size:var(--fs-md);margin-bottom:var(--space-2xl);max-width:500px;margin-left:auto;margin-right:auto;">
                            Join thousands of patients and doctors already using DocBook for seamless appointment management.
                        </p>
                        <div style="display:flex;gap:var(--space-md);justify-content:center;flex-wrap:wrap;">
                            <a href="#/patient/register" class="btn btn-accent btn-lg">Register as Patient</a>
                            <a href="#/doctor/register" class="btn btn-lg" style="background:rgba(255,255,255,0.15);color:white;">Register as Doctor</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>`;
    },

    featureCard(icon, title, desc, gradient) {
        return `
            <div class="card" style="text-align:center;padding:var(--space-2xl);">
                <div style="width:60px;height:60px;border-radius:var(--radius-md);background:${gradient};display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-lg);color:white;">
                    <i data-lucide="${icon}" style="width:28px;height:28px;"></i>
                </div>
                <h3 style="font-size:var(--fs-lg);margin-bottom:var(--space-sm);">${title}</h3>
                <p style="color:var(--text-muted);font-size:var(--fs-sm);line-height:1.7;">${desc}</p>
            </div>`;
    },

    stepCard(num, title, desc) {
        return `
            <div class="text-center">
                <div style="width:56px;height:56px;border-radius:var(--radius-full);background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-lg);color:white;font-weight:800;font-size:var(--fs-xl);">${num}</div>
                <h3 style="font-size:var(--fs-lg);margin-bottom:var(--space-sm);">${title}</h3>
                <p style="color:var(--text-muted);font-size:var(--fs-sm);line-height:1.7;">${desc}</p>
            </div>`;
    },

    init() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};
