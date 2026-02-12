export default function Login() {
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div style="text-align:center;margin-bottom:1.5rem;">
                    <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,var(--primary-500),var(--accent-500));display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
                        <span class="material-symbols-rounded" style="font-size:1.6rem;color:white;">lock</span>
                    </div>
                </div>
                <h2>Welcome Back</h2>
                <p class="auth-subtitle">Sign in to manage your appointments</p>
                <form id="loginForm" class="auth-form">
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="email" class="form-input" required autocomplete="email" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="password" class="form-input" required autocomplete="current-password" />
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:0.5rem;">
                        <span class="material-symbols-rounded">login</span>Sign In
                    </button>
                </form>
                <div class="auth-footer">
                    Don't have an account? <a onclick="window.navigateTo('/register'); return false;">Create one</a>
                </div>
            </div>
        </div>
    `;

    div.querySelector('#loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = div.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-rounded">hourglass_empty</span>Signing in...';

        const email = div.querySelector('#email').value;
        const password = div.querySelector('#password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.showToast(`Welcome back, ${data.user.name}!`, 'success');
                const dest = data.user.role === 'admin' ? '/admin' : '/dashboard';
                window.navigateTo(dest);
            } else {
                window.showToast(data.message || 'Invalid credentials', 'error');
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-rounded">login</span>Sign In';
            }
        } catch (error) {
            console.error(error);
            window.showToast('Connection error. Please try again.', 'error');
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-rounded">login</span>Sign In';
        }
    });

    return div;
}
