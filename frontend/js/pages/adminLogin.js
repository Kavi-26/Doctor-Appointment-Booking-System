/* Admin Login Page */
const AdminLoginPage = {
    render() {
        return `
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo"><div class="auth-logo-icon" style="background:var(--gradient-warm)"><i data-lucide="shield" style="width:24px;height:24px"></i></div> DocBook</div>
                        <h1>Admin Login</h1>
                        <p>System administration panel</p>
                    </div>
                    <form class="auth-form" id="admin-login-form">
                        <div class="form-group"><label>Email</label><input type="email" class="form-control" id="alogin-email" placeholder="admin@docbook.com" required></div>
                        <div class="form-group"><label>Password</label><input type="password" class="form-control" id="alogin-password" placeholder="Enter password" required></div>
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="alogin-btn">Login as Admin</button>
                    </form>
                    <div class="auth-footer"><a href="#/">← Back to Home</a></div>
                </div>
            </div>
        </div>`;
    },
    init() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('alogin-btn');
            btn.disabled = true; btn.textContent = 'Logging in...';
            try {
                const data = await API.post('/auth/admin/login', {
                    email: document.getElementById('alogin-email').value,
                    password: document.getElementById('alogin-password').value
                });
                Auth.setAuth(data.token, data.user);
                Toast.show('Admin login successful!', 'success');
                Navbar.render();
                window.location.hash = '#/admin/dashboard';
            } catch (err) { Toast.show(err.message, 'error'); }
            finally { btn.disabled = false; btn.textContent = 'Login as Admin'; }
        });
    }
};
