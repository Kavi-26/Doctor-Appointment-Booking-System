/* Doctor Login Page */
const DoctorLoginPage = {
    render() {
        return `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo"><div class="auth-logo-icon"><i data-lucide="stethoscope" style="width:24px;height:24px"></i></div> DocBook</div>
                        <h1>Doctor Login</h1>
                        <p>Access your doctor dashboard</p>
                    </div>
                    <form class="auth-form" id="doctor-login-form">
                        <div class="form-group"><label>Email</label><input type="email" class="form-control" id="dlogin-email" placeholder="doctor@email.com" required></div>
                        <div class="form-group"><label>Password</label><input type="password" class="form-control" id="dlogin-password" placeholder="Enter password" required></div>
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="dlogin-btn">Login</button>
                    </form>
                    <div class="auth-footer">New doctor? <a href="#/doctor/register">Register here</a></div>
                </div>
            </div>
        </div>`;
    },
    init() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        document.getElementById('doctor-login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('dlogin-btn');
            btn.disabled = true; btn.textContent = 'Logging in...';
            try {
                const data = await API.post('/auth/doctor/login', {
                    email: document.getElementById('dlogin-email').value,
                    password: document.getElementById('dlogin-password').value
                });
                Auth.setAuth(data.token, data.user);
                Toast.show('Login successful!', 'success');
                Navbar.render();
                window.location.hash = '#/doctor/dashboard';
            } catch (err) { Toast.show(err.message, 'error'); }
            finally { btn.disabled = false; btn.textContent = 'Login'; }
        });
    }
};
