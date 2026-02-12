export default function Home() {
    const div = document.createElement('div');
    div.innerHTML = `
        <section class="hero">
            <h1>Your Health, <span class="text-gradient">Our Priority</span></h1>
            <p class="hero-subtitle">
                Find top-rated doctors, check real-time availability, and book appointments instantly — all from one place.
            </p>
            <div class="hero-actions">
                <button class="btn btn-primary btn-lg" onclick="window.navigateTo('/register')">
                    <span class="material-symbols-rounded">rocket_launch</span>Get Started
                </button>
                <button class="btn btn-secondary btn-lg" onclick="window.navigateTo('/login')">
                    <span class="material-symbols-rounded">login</span>Sign In
                </button>
            </div>
        </section>

        <section class="features-grid">
            <div class="feature-card">
                <div class="feature-icon" style="background: rgba(59,130,246,0.12); color: var(--primary-400);">
                    <span class="material-symbols-rounded">search</span>
                </div>
                <h3>Search Specialists</h3>
                <p>Browse doctors by specialization, experience, and consultation fees. Filter to find the perfect match.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon" style="background: rgba(45,212,191,0.12); color: var(--accent-400);">
                    <span class="material-symbols-rounded">calendar_month</span>
                </div>
                <h3>Real-Time Booking</h3>
                <p>View available time slots in real-time. Pick a date and time that works for you — no phone calls needed.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon" style="background: rgba(74,222,128,0.12); color: var(--success-400);">
                    <span class="material-symbols-rounded">verified_user</span>
                </div>
                <h3>Secure & Private</h3>
                <p>Your data is encrypted and handled with care. Secure login and session management keep you protected.</p>
            </div>
        </section>

        <section style="text-align:center; margin-top:4rem; padding:3rem 0;">
            <h2 style="margin-bottom:0.75rem;">How It Works</h2>
            <p class="text-muted" style="margin-bottom:2.5rem;">Three simple steps to your next appointment</p>
            <div class="grid-3">
                <div class="card" style="text-align:center; padding:2rem;">
                    <div style="width:48px;height:48px;border-radius:50%;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.3rem;font-weight:800;color:var(--primary-400);">1</div>
                    <h4>Create an Account</h4>
                    <p class="text-muted text-sm" style="margin-top:0.5rem;">Sign up in seconds with your basic details. It's free and always will be.</p>
                </div>
                <div class="card" style="text-align:center; padding:2rem;">
                    <div style="width:48px;height:48px;border-radius:50%;background:rgba(45,212,191,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.3rem;font-weight:800;color:var(--accent-400);">2</div>
                    <h4>Find Your Doctor</h4>
                    <p class="text-muted text-sm" style="margin-top:0.5rem;">Search by specialization, view profiles, and choose a doctor that fits your needs.</p>
                </div>
                <div class="card" style="text-align:center; padding:2rem;">
                    <div style="width:48px;height:48px;border-radius:50%;background:rgba(74,222,128,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.3rem;font-weight:800;color:var(--success-400);">3</div>
                    <h4>Book & Confirm</h4>
                    <p class="text-muted text-sm" style="margin-top:0.5rem;">Select an available slot, provide your reason, and confirm your appointment instantly.</p>
                </div>
            </div>
        </section>
    `;
    return div;
}
