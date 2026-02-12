/* Patient Registration Page */
const PatientRegisterPage = {
    render() {
        return `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo"><div class="auth-logo-icon"><i data-lucide="heart-pulse" style="width:24px;height:24px"></i></div> DocBook</div>
                        <h1>Create Patient Account</h1>
                        <p>Join DocBook and book appointments with top doctors</p>
                    </div>
                    <form class="auth-form" id="patient-register-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Full Name</label>
                                <input type="text" class="form-control" id="reg-name" placeholder="John Doe" required>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" class="form-control" id="reg-email" placeholder="john@example.com" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="tel" class="form-control" id="reg-phone" placeholder="+91 98765 43210" required>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" class="form-control" id="reg-password" placeholder="Min 6 characters" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Age</label>
                                <input type="number" class="form-control" id="reg-age" placeholder="25" min="1" max="150" required>
                            </div>
                            <div class="form-group">
                                <label>Gender</label>
                                <select class="form-control" id="reg-gender" required>
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="reg-submit-btn">Create Account</button>
                    </form>
                    <div class="auth-footer">
                        Already have an account? <a href="#/patient/login">Login here</a>
                    </div>
                </div>
            </div>
        </div>`;
    },
    init() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        document.getElementById('patient-register-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('reg-submit-btn');
            btn.disabled = true; btn.textContent = 'Creating Account...';
            try {
                const data = await API.post('/auth/patient/register', {
                    name: document.getElementById('reg-name').value,
                    email: document.getElementById('reg-email').value,
                    phone: document.getElementById('reg-phone').value,
                    password: document.getElementById('reg-password').value,
                    age: parseInt(document.getElementById('reg-age').value),
                    gender: document.getElementById('reg-gender').value
                });
                Auth.setAuth(data.token, data.user);
                Toast.show('Account created successfully!', 'success');
                Navbar.render();
                window.location.hash = '#/patient/dashboard';
            } catch (err) {
                Toast.show(err.message, 'error');
            } finally {
                btn.disabled = false; btn.textContent = 'Create Account';
            }
        });
    }
};
