/* Patient Login Page */
const PatientLoginPage = {
    render() {
        return `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo"><div class="auth-logo-icon"><i data-lucide="heart-pulse" style="width:24px;height:24px"></i></div> DocBook</div>
                        <h1>Patient Login</h1>
                        <p>Welcome back! Login to manage your appointments</p>
                    </div>
                    <form class="auth-form" id="patient-login-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" class="form-control" id="login-email" placeholder="your@email.com" required>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" class="form-control" id="login-password" placeholder="Enter your password" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="login-submit-btn">Login</button>
                    </form>
                    <div class="auth-footer">
                        Don't have an account? <a href="#/patient/register">Register here</a>
                    </div>
                </div>
            </div>
        </div>`;
    },
    init() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        document.getElementById('patient-login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('login-submit-btn');
            btn.disabled = true; btn.textContent = 'Logging in...';
            try {
                const data = await API.post('/auth/patient/login', {
                    email: document.getElementById('login-email').value,
                    password: document.getElementById('login-password').value
                });
                Auth.setAuth(data.token, data.user);
                Toast.show('Login successful!', 'success');
                Navbar.render();
                window.location.hash = '#/patient/dashboard';
            } catch (err) {
                Toast.show(err.message, 'error');
            } finally {
                btn.disabled = false; btn.textContent = 'Login';
            }
        });
    }
};
