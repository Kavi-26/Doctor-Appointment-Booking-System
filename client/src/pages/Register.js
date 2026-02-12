export default function Register() {
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div style="text-align:center;margin-bottom:1.5rem;">
                    <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,var(--accent-500),var(--primary-500));display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
                        <span class="material-symbols-rounded" style="font-size:1.6rem;color:white;">person_add</span>
                    </div>
                </div>
                <h2>Create Account</h2>
                <p class="auth-subtitle">Join MediBook and start booking today</p>
                <form id="registerForm" class="auth-form">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="name" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="email" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="password" class="form-input" required minlength="6" />
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label class="form-label">Phone</label>
                            <input type="tel" id="phone" class="form-input" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Age</label>
                            <input type="number" id="age" class="form-input" min="1" max="120" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Gender</label>
                        <select id="gender" class="form-select">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-accent btn-lg" style="width:100%;margin-top:0.5rem;">
                        <span class="material-symbols-rounded">how_to_reg</span>Create Account
                    </button>
                </form>
                <div class="auth-footer">
                    Already have an account? <a onclick="window.navigateTo('/login'); return false;">Sign in</a>
                </div>
            </div>
        </div>
    `;

    div.querySelector('#registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = div.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-rounded">hourglass_empty</span>Creating account...';

        const body = {
            name: div.querySelector('#name').value,
            email: div.querySelector('#email').value,
            password: div.querySelector('#password').value,
            phone: div.querySelector('#phone').value,
            gender: div.querySelector('#gender').value,
            age: div.querySelector('#age').value
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();

            if (response.ok) {
                window.showToast('Account created! Please sign in.', 'success');
                window.navigateTo('/login');
            } else {
                window.showToast(data.message || 'Registration failed', 'error');
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-rounded">how_to_reg</span>Create Account';
            }
        } catch (error) {
            console.error(error);
            window.showToast('Connection error. Please try again.', 'error');
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-rounded">how_to_reg</span>Create Account';
        }
    });

    return div;
}
