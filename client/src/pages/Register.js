export default function Register() {
    const div = document.createElement('div');
    div.innerHTML = `
        <h2>Register</h2>
        <form id="registerForm">
            <input type="text" id="name" placeholder="Full Name" required />
            <input type="email" id="email" placeholder="Email" required />
            <input type="password" id="password" placeholder="Password" required />
            <input type="text" id="phone" placeholder="Phone" />
            <select id="gender">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
            <input type="number" id="age" placeholder="Age" />
            <button type="submit">Register</button>
        </form>
        <p>Already have an account? <a href="#" onclick="window.navigateTo('/login'); return false;">Login</a></p>
    `;

    div.querySelector('#registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = div.querySelector('#name').value;
        const email = div.querySelector('#email').value;
        const password = div.querySelector('#password').value;
        const phone = div.querySelector('#phone').value;
        const gender = div.querySelector('#gender').value;
        const age = div.querySelector('#age').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone, gender, age })
            });
            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! Please login.');
                window.navigateTo('/login');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert('Registration failed');
        }
    });

    return div;
}
