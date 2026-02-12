export default function AdminDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.navigateTo('/login');
        return document.createElement('div');
    }

    const div = document.createElement('div');
    div.innerHTML = `
        <h2>Admin Dashboard</h2>
        <div id="stats" class="dashboard-grid">Loading stats...</div>
        <h3>Users</h3>
        <div id="users-list">Loading users...</div>
        <button id="logout-btn">Logout</button>
    `;

    div.querySelector('#logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.navigateTo('/');
    });

    async function loadData() {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        try {
            // Stats
            const statsRes = await fetch('/api/admin/stats', { headers });
            const stats = await statsRes.json();
            div.querySelector('#stats').innerHTML = `
                <div class="card"><p>Total Users: ${stats.users}</p></div>
                <div class="card"><p>Total Doctors: ${stats.doctors}</p></div>
                <div class="card"><p>Total Appointments: ${stats.appointments}</p></div>
            `;

            // Users
            const usersRes = await fetch('/api/admin/users', { headers });
            const users = await usersRes.json();
            const usersList = div.querySelector('#users-list');
            usersList.innerHTML = '';

            users.forEach(u => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `<p>${u.name} (${u.email}) - <strong>${u.role}</strong></p>`;
                usersList.appendChild(card);
            });

        } catch (error) {
            console.error(error);
        }
    }

    loadData();
    return div;
}
