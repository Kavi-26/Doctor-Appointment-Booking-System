/* Patient Notifications Page */
const PatientNotificationsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="flex-between"><div class="page-header"><h1>Notifications</h1><p>Stay updated on your appointments</p></div>
                <button class="btn btn-ghost btn-sm" onclick="PatientNotificationsPage.markAllRead()">Mark All Read</button>
            </div>
            <div id="patient-notif-list">${Skeleton.list(5)}</div>
        </div>`;
    },
    async init() {
        try {
            const data = await API.get('/patient/notifications');
            const notifs = data.notifications || [];
            const container = document.getElementById('patient-notif-list');
            if (!notifs.length) {
                container.innerHTML = `<div class="empty-state"><h3>No Notifications</h3><p>You're all caught up!</p></div>`;
                return;
            }
            container.innerHTML = notifs.map(n => `
                <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="PatientNotificationsPage.markRead(${n.id})">
                    <div class="notification-icon ${n.type || 'general'}"><i data-lucide="${this.getIcon(n.type)}" style="width:20px;height:20px"></i></div>
                    <div class="notification-content">
                        <h4>${Utils.escapeHTML(n.title)}</h4>
                        <p>${Utils.escapeHTML(n.message)}</p>
                        <div class="time">${Utils.timeAgo(n.created_at)}</div>
                    </div>
                </div>
            `).join('');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) { Toast.show('Failed to load notifications', 'error'); }
    },
    getIcon(type) {
        const map = { booking: 'calendar-check', cancellation: 'calendar-x', reminder: 'bell', approval: 'check-circle' };
        return map[type] || 'info';
    },
    async markRead(id) {
        try { await API.put(`/patient/notifications/${id}/read`); this.init(); } catch (e) { }
    },
    async markAllRead() {
        try { await API.put('/patient/notifications/read-all'); Toast.show('All notifications marked as read', 'success'); this.init(); } catch (e) { }
    }
};
