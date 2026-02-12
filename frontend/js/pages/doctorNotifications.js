/* Doctor Notifications Page */
const DoctorNotificationsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>Notifications</h1><p>Stay updated on your appointments</p></div>
            <div id="doc-notif-list">${Skeleton.list(5)}</div>
        </div>`;
    },
    async init() {
        try {
            const data = await API.get('/doctor/notifications');
            const notifs = data.notifications || [];
            const container = document.getElementById('doc-notif-list');
            if (!notifs.length) { container.innerHTML = `<div class="empty-state"><h3>No Notifications</h3><p>You're all caught up!</p></div>`; return; }
            container.innerHTML = notifs.map(n => `
                <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="DoctorNotificationsPage.markRead(${n.id})">
                    <div class="notification-icon ${n.type || 'general'}"><i data-lucide="${n.type === 'booking' ? 'calendar-check' : n.type === 'cancellation' ? 'calendar-x' : 'info'}" style="width:20px;height:20px"></i></div>
                    <div class="notification-content"><h4>${Utils.escapeHTML(n.title)}</h4><p>${Utils.escapeHTML(n.message)}</p><div class="time">${Utils.timeAgo(n.created_at)}</div></div>
                </div>`).join('');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) { Toast.show('Failed to load notifications', 'error'); }
    },
    async markRead(id) { try { await API.put(`/doctor/notifications/${id}/read`); this.init(); } catch (e) { } }
};
