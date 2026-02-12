/* Admin Dashboard */
const AdminDashboardPage = {
    render() {
        return `<div class="dashboard-page container" id="admin-dash">${Skeleton.stats(4)}</div>`;
    },
    async init() {
        try {
            const data = await API.get('/admin/dashboard');
            const s = data.stats || {};
            document.getElementById('admin-dash').innerHTML = `
                <div class="dashboard-welcome" style="background:var(--gradient-warm);">
                    <h1>Admin Dashboard 🛡️</h1>
                    <p>System overview and management tools</p>
                </div>
                <div class="stats-grid mt-2">
                    <div class="stat-card blue"><div class="stat-icon blue"><i data-lucide="stethoscope" style="width:24px;height:24px"></i></div><div class="stat-info"><h3>${s.total_doctors || 0}</h3><p>Total Doctors</p></div></div>
                    <div class="stat-card green"><div class="stat-icon green"><i data-lucide="users" style="width:24px;height:24px"></i></div><div class="stat-info"><h3>${s.total_patients || 0}</h3><p>Total Patients</p></div></div>
                    <div class="stat-card purple"><div class="stat-icon purple"><i data-lucide="calendar" style="width:24px;height:24px"></i></div><div class="stat-info"><h3>${s.total_appointments || 0}</h3><p>Total Appointments</p></div></div>
                    <div class="stat-card orange"><div class="stat-icon orange"><i data-lucide="indian-rupee" style="width:24px;height:24px"></i></div><div class="stat-info"><h3>${Utils.formatCurrency(s.total_revenue || 0)}</h3><p>Total Revenue</p></div></div>
                </div>
                <div class="stats-grid mt-2">
                    <div class="stat-card pink"><div class="stat-icon pink"><i data-lucide="user-check" style="width:24px;height:24px"></i></div><div class="stat-info"><h3>${s.pending_approvals || 0}</h3><p>Pending Approvals</p></div></div>
                    <div class="stat-card blue"><div class="stat-icon blue"><i data-lucide="calendar-check" style="width:24px;height:24px"></i></div><div class="stat-info"><h3>${s.today_appointments || 0}</h3><p>Today's Appointments</p></div></div>
                </div>
                <div class="dashboard-actions mt-2">
                    <a href="#/admin/doctors" class="btn btn-primary"><i data-lucide="stethoscope" style="width:16px;height:16px"></i> Manage Doctors</a>
                    <a href="#/admin/patients" class="btn btn-outline"><i data-lucide="users" style="width:16px;height:16px"></i> Manage Patients</a>
                    <a href="#/admin/reports" class="btn btn-ghost"><i data-lucide="bar-chart-3" style="width:16px;height:16px"></i> View Reports</a>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) { Toast.show('Failed to load dashboard', 'error'); }
    }
};
