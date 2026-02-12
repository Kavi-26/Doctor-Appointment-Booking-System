export default function AdminDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.navigateTo('/login');
        return document.createElement('div');
    }

    const div = document.createElement('div');
    div.innerHTML = `
        <div style="margin-bottom:2rem;">
            <h2><span class="material-symbols-rounded" style="color:var(--primary-400);vertical-align:middle;margin-right:6px;">admin_panel_settings</span>Admin Dashboard</h2>
            <p class="text-muted">Monitor system activity and manage users.</p>
        </div>

        <div id="stats-grid" class="grid-3" style="margin-bottom:2.5rem;">
            <div class="skeleton skeleton-card" style="height:90px;"></div>
            <div class="skeleton skeleton-card" style="height:90px;"></div>
            <div class="skeleton skeleton-card" style="height:90px;"></div>
        </div>

        <div class="section-header">
            <h2><span class="material-symbols-rounded">group</span>All Users</h2>
        </div>
        <div class="card" style="padding:0;overflow:hidden;">
            <table class="user-table" id="users-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody id="users-body">
                    <tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--gray-500);">Loading users...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    async function loadData() {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        try {
            // Stats
            const statsRes = await fetch('/api/admin/stats', { headers });
            const stats = await statsRes.json();
            div.querySelector('#stats-grid').innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon blue"><span class="material-symbols-rounded">group</span></div>
                    <div>
                        <div class="stat-value">${stats.users}</div>
                        <div class="stat-label">Total Users</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon teal"><span class="material-symbols-rounded">stethoscope</span></div>
                    <div>
                        <div class="stat-value">${stats.doctors}</div>
                        <div class="stat-label">Registered Doctors</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><span class="material-symbols-rounded">event</span></div>
                    <div>
                        <div class="stat-value">${stats.appointments}</div>
                        <div class="stat-label">Total Appointments</div>
                    </div>
                </div>
            `;

            // Users
            const usersRes = await fetch('/api/admin/users', { headers });
            const users = await usersRes.json();
            const tbody = div.querySelector('#users-body');
            tbody.innerHTML = '';

            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--gray-500);">No users found.</td></tr>';
                return;
            }

            users.forEach(u => {
                const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const roleBadge = u.role === 'admin'
                    ? '<span class="badge badge-completed">Admin</span>'
                    : u.role === 'doctor'
                        ? '<span class="badge badge-approved">Doctor</span>'
                        : '<span class="badge badge-pending">Patient</span>';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><span class="user-avatar-sm">${initials}</span>${u.name}</td>
                    <td>${u.email}</td>
                    <td>${u.phone || '—'}</td>
                    <td>${roleBadge}</td>
                `;
                tbody.appendChild(row);
            });

        } catch (error) {
            console.error(error);
            window.showToast('Error loading admin data', 'error');
        }
    }

    loadData();
    return div;
}
