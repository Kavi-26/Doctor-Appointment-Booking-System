/* Admin Reports Page */
const AdminReportsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>Reports & Analytics</h1><p>System-wide insights and trends</p></div>
            <div id="admin-reports-content">${Skeleton.stats(4)}</div>
        </div>`;
    },
    async init() {
        try {
            const data = await API.get('/admin/reports');
            const r = data.reports || {};
            const trends = r.monthly_trends || [];
            const topDocs = r.top_doctors || [];
            const specDist = r.specialization_distribution || [];
            const statusDist = r.status_distribution || [];

            const maxTrend = Math.max(...trends.map(t => t.count || 0), 1);

            document.getElementById('admin-reports-content').innerHTML = `
                <!-- Status Distribution -->
                <div class="stats-grid animate-slide-up">
                    ${statusDist.map(s => {
                const colors = { pending: 'orange', confirmed: 'blue', completed: 'green', cancelled: 'pink' };
                return `<div class="stat-card ${colors[s.status] || 'purple'}">
                            <div class="stat-icon ${colors[s.status] || 'purple'}"><i data-lucide="${s.status === 'completed' ? 'check-circle' : s.status === 'cancelled' ? 'x-circle' : s.status === 'confirmed' ? 'calendar-check' : 'clock'}" style="width:24px;height:24px"></i></div>
                            <div class="stat-info"><h3>${s.count}</h3><p style="text-transform:capitalize">${s.status}</p></div>
                        </div>`;
            }).join('')}
                </div>

                <!-- Monthly Trends Chart -->
                ${trends.length ? `
                <div class="chart-card mt-2">
                    <h3>Monthly Appointment Trends</h3>
                    <div class="bar-chart" style="margin-bottom:30px;">
                        ${trends.map(t => `
                            <div class="bar" style="height:${Math.max((t.count / maxTrend) * 100, 5)}%;">
                                <div class="bar-value">${t.count}</div>
                                <div class="bar-label">${t.month}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>` : ''}

                <!-- Top Doctors -->
                ${topDocs.length ? `
                <div class="card mt-2" style="padding:var(--space-xl);">
                    <h3 style="margin-bottom:var(--space-lg);">Top Performing Doctors</h3>
                    <div class="table-container">
                        <table class="table">
                            <thead><tr><th>#</th><th>Doctor</th><th>Specialization</th><th>Appointments</th><th>Rating</th></tr></thead>
                            <tbody>${topDocs.map((d, i) => `
                                <tr>
                                    <td><strong>${i + 1}</strong></td>
                                    <td>Dr. ${Utils.escapeHTML(d.name)}</td>
                                    <td>${d.specialization || '-'}</td>
                                    <td>${d.total_appointments || 0}</td>
                                    <td>${Utils.starsHTML(d.rating || 0)}</td>
                                </tr>
                            `).join('')}</tbody>
                        </table>
                    </div>
                </div>` : ''}

                <!-- Specialization Distribution -->
                ${specDist.length ? `
                <div class="card mt-2" style="padding:var(--space-xl);">
                    <h3 style="margin-bottom:var(--space-lg);">Specialization Distribution</h3>
                    ${specDist.map(s => {
                const maxCount = Math.max(...specDist.map(x => x.count || 0), 1);
                const pct = Math.round((s.count / maxCount) * 100);
                return `
                        <div style="margin-bottom:var(--space-md);">
                            <div class="flex-between" style="margin-bottom:4px;">
                                <span style="font-size:var(--fs-sm);font-weight:600;">${s.specialization}</span>
                                <span class="text-muted" style="font-size:var(--fs-xs);">${s.count} doctors</span>
                            </div>
                            <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                                <div style="height:100%;width:${pct}%;background:var(--gradient-primary);border-radius:4px;transition:width 0.5s ease;"></div>
                            </div>
                        </div>`;
            }).join('')}
                </div>` : ''}
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) { Toast.show('Failed to load reports', 'error'); }
    }
};
