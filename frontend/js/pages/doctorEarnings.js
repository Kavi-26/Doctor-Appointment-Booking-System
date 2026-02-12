/* Doctor Earnings Page */
const DoctorEarningsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>Earnings</h1><p>Track your consultation earnings</p></div>
            <div id="earnings-content">${Skeleton.stats(3)}</div>
        </div>`;
    },
    async init() {
        try {
            const data = await API.get('/doctor/earnings');
            const e = data.earnings || {};
            document.getElementById('earnings-content').innerHTML = `
                <div class="stats-grid animate-slide-up">
                    <div class="stat-card green"><div class="stat-icon green"><i data-lucide="indian-rupee" style="width:24px;height:24px"></i></div>
                        <div class="stat-info"><h3>${Utils.formatCurrency(e.total_earnings || 0)}</h3><p>Total Earnings</p></div></div>
                    <div class="stat-card blue"><div class="stat-icon blue"><i data-lucide="calendar-check" style="width:24px;height:24px"></i></div>
                        <div class="stat-info"><h3>${e.completed_appointments || 0}</h3><p>Completed Appointments</p></div></div>
                    <div class="stat-card purple"><div class="stat-icon purple"><i data-lucide="indian-rupee" style="width:24px;height:24px"></i></div>
                        <div class="stat-info"><h3>${Utils.formatCurrency(e.this_month || 0)}</h3><p>This Month</p></div></div>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) { Toast.show('Failed to load earnings', 'error'); }
    }
};
