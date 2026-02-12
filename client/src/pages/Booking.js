export default function Booking() {
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctorId');
    const div = document.createElement('div');

    if (!doctorId) {
        div.innerHTML = `
            <div class="empty-state" style="margin-top:4rem;">
                <span class="material-symbols-rounded">error</span>
                <h3>Invalid Doctor Selection</h3>
                <p>Please go back to the dashboard and select a doctor.</p>
                <button class="btn btn-secondary" style="margin-top:1rem;" onclick="window.navigateTo('/dashboard')">
                    <span class="material-symbols-rounded">arrow_back</span>Go to Dashboard
                </button>
            </div>
        `;
        return div;
    }

    div.innerHTML = `
        <div style="max-width:540px;margin:2rem auto;">
            <div class="skeleton skeleton-card" style="height:160px;"></div>
            <div class="skeleton skeleton-card" style="height:300px;margin-top:1rem;"></div>
        </div>
    `;

    async function init() {
        try {
            const response = await fetch(`/api/doctors/${doctorId}`);
            if (!response.ok) throw new Error('Doctor not found');
            const doctor = await response.json();
            const initials = doctor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            div.innerHTML = `
                <div style="max-width:540px;margin:2rem auto;">
                    <button class="btn btn-secondary btn-sm" onclick="window.navigateTo('/dashboard')" style="margin-bottom:1.5rem;">
                        <span class="material-symbols-rounded">arrow_back</span>Back to Dashboard
                    </button>

                    <div class="card" style="margin-bottom:1.5rem;">
                        <div class="doctor-info">
                            <div class="doctor-avatar">${initials}</div>
                            <div>
                                <h3>Dr. ${doctor.name}</h3>
                                <p class="text-muted text-sm">${doctor.specialization}</p>
                            </div>
                        </div>
                        <div class="doctor-meta" style="margin-top:1rem;">
                            <span><span class="material-symbols-rounded">work</span>${doctor.experience} yrs experience</span>
                            <span><span class="material-symbols-rounded">payments</span>$${doctor.consultation_fee} consultation</span>
                        </div>
                    </div>

                    <div class="auth-card" style="max-width:none;">
                        <h3 style="margin-bottom:0.25rem;"><span class="material-symbols-rounded" style="vertical-align:middle;color:var(--primary-400);margin-right:6px;">event_available</span>Schedule Appointment</h3>
                        <p class="text-muted text-sm" style="margin-bottom:1.5rem;">Pick a date and time that works best for you.</p>
                        <form id="bookingForm" class="auth-form">
                            <div class="grid-2">
                                <div class="form-group">
                                    <label class="form-label">Preferred Date</label>
                                    <input type="date" id="date" class="form-input" required />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Preferred Time</label>
                                    <input type="time" id="time" class="form-input" required />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Reason for Visit</label>
                                <textarea id="reason" class="form-textarea" rows="3"></textarea>
                            </div>
                            <div style="display:flex;gap:0.75rem;margin-top:0.5rem;">
                                <button type="submit" class="btn btn-primary btn-lg" style="flex:1;">
                                    <span class="material-symbols-rounded">check_circle</span>Confirm Booking
                                </button>
                                <button type="button" class="btn btn-outline btn-lg" onclick="window.navigateTo('/dashboard')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            // Set min date to today
            const today = new Date().toISOString().split('T')[0];
            div.querySelector('#date').setAttribute('min', today);

            div.querySelector('#bookingForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = div.querySelector('button[type="submit"]');
                btn.disabled = true;
                btn.innerHTML = '<span class="material-symbols-rounded">hourglass_empty</span>Booking...';

                const appointment_date = div.querySelector('#date').value;
                const appointment_time = div.querySelector('#time').value;
                const reason = div.querySelector('#reason').value;
                const token = localStorage.getItem('token');

                try {
                    const res = await fetch('/api/appointments', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({ doctor_id: doctorId, appointment_date, appointment_time, reason })
                    });

                    const data = await res.json();
                    if (res.ok) {
                        window.showToast('Appointment booked successfully!', 'success');
                        window.navigateTo('/dashboard');
                    } else {
                        window.showToast(data.message || 'Booking failed', 'error');
                        btn.disabled = false;
                        btn.innerHTML = '<span class="material-symbols-rounded">check_circle</span>Confirm Booking';
                    }
                } catch (err) {
                    console.error(err);
                    window.showToast('Connection error. Please try again.', 'error');
                    btn.disabled = false;
                    btn.innerHTML = '<span class="material-symbols-rounded">check_circle</span>Confirm Booking';
                }
            });

        } catch (error) {
            div.innerHTML = `
                <div class="empty-state" style="margin-top:4rem;">
                    <span class="material-symbols-rounded">error</span>
                    <h3>Doctor Not Found</h3>
                    <p>We couldn't find this doctor. Please go back and try again.</p>
                    <button class="btn btn-secondary" style="margin-top:1rem;" onclick="window.navigateTo('/dashboard')">
                        <span class="material-symbols-rounded">arrow_back</span>Go to Dashboard
                    </button>
                </div>
            `;
        }
    }

    init();
    return div;
}
