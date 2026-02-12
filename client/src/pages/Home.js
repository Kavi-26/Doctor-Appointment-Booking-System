export default function Home() {
    const div = document.createElement('div');
    div.innerHTML = `
        <h1>Doctor Appointment System</h1>
        <p>Book your appointments easily.</p>
        <div class="actions">
            <button onclick="window.navigateTo('/login')">Login</button>
            <button onclick="window.navigateTo('/register')">Register</button>
        </div>
    `;
    return div;
}
