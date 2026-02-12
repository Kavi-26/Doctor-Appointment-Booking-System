export default function Login() {
    const div = document.createElement('div');
    div.innerHTML = `
        <h2>Login</h2>
        <form id="loginForm">
            <input type="email" id="email" placeholder="Email" required />
            <input type="password" id="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a href="#" onclick="window.navigateTo('/register'); return false;">Register</a></p>
    `;

    div.querySelector('#loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
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
                window.navigateTo('/dashboard');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert('Login failed');
        }
    });

    return div;
}
