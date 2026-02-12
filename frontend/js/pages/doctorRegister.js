/* Doctor Registration Page */
const DoctorRegisterPage = {
    render() {
        return `
        <div class="auth-page">
            <div class="auth-container" style="max-width:560px;">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo"><div class="auth-logo-icon"><i data-lucide="stethoscope" style="width:24px;height:24px"></i></div> DocBook</div>
                        <h1>Doctor Registration</h1>
                        <p>Join our network of healthcare professionals</p>
                    </div>
                    <form class="auth-form" id="doctor-register-form">
                        <div class="form-row">
                            <div class="form-group"><label>Full Name</label><input type="text" class="form-control" id="dreg-name" placeholder="Dr. Jane Smith" required></div>
                            <div class="form-group"><label>Email</label><input type="email" class="form-control" id="dreg-email" placeholder="doctor@email.com" required></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label>Phone</label><input type="tel" class="form-control" id="dreg-phone" placeholder="+91 98765 43210" required></div>
                            <div class="form-group"><label>Password</label><input type="password" class="form-control" id="dreg-password" placeholder="Min 6 characters" required></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label>Qualification</label><input type="text" class="form-control" id="dreg-qualification" placeholder="MBBS, MD" required></div>
                            <div class="form-group"><label>Specialization</label>
                                <select class="form-control" id="dreg-specialization" required>
                                    <option value="">Select</option>
                                    <option>General Medicine</option><option>Cardiology</option><option>Dermatology</option>
                                    <option>ENT</option><option>Gastroenterology</option><option>Gynecology</option>
                                    <option>Neurology</option><option>Oncology</option><option>Ophthalmology</option>
                                    <option>Orthopedics</option><option>Pediatrics</option><option>Psychiatry</option>
                                    <option>Pulmonology</option><option>Urology</option><option>Dentistry</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label>Experience (years)</label><input type="number" class="form-control" id="dreg-experience" placeholder="5" min="0" required></div>
                            <div class="form-group"><label>License Number</label><input type="text" class="form-control" id="dreg-license" placeholder="MCI/2024/12345" required></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label>Consultation Fee (₹)</label><input type="number" class="form-control" id="dreg-fee" placeholder="500" min="0"></div>
                            <div class="form-group"><label>Bio</label><textarea class="form-control" id="dreg-bio" placeholder="Brief about you..." rows="2"></textarea></div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="dreg-submit-btn">Submit Registration</button>
                    </form>
                    <div class="auth-footer">
                        <p style="color:var(--warning);font-size:var(--fs-xs);margin-bottom:var(--space-sm);">⚠ Your account requires admin approval before activation.</p>
                        Already registered? <a href="#/doctor/login">Login here</a>
                    </div>
                </div>
            </div>
        </div>`;
    },
    init() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        document.getElementById('doctor-register-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('dreg-submit-btn');
            btn.disabled = true; btn.textContent = 'Submitting...';
            try {
                await API.post('/auth/doctor/register', {
                    name: document.getElementById('dreg-name').value,
                    email: document.getElementById('dreg-email').value,
                    phone: document.getElementById('dreg-phone').value,
                    password: document.getElementById('dreg-password').value,
                    qualification: document.getElementById('dreg-qualification').value,
                    specialization: document.getElementById('dreg-specialization').value,
                    experience: parseInt(document.getElementById('dreg-experience').value),
                    license_number: document.getElementById('dreg-license').value,
                    consultation_fee: parseFloat(document.getElementById('dreg-fee').value) || 0,
                    bio: document.getElementById('dreg-bio').value
                });
                Toast.show('Registration submitted! Please wait for admin approval.', 'success');
                window.location.hash = '#/doctor/login';
            } catch (err) {
                Toast.show(err.message, 'error');
            } finally {
                btn.disabled = false; btn.textContent = 'Submit Registration';
            }
        });
    }
};
