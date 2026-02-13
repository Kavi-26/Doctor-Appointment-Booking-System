/* Admin Appointments */
const AdminAppointmentsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>All Appointments</h1><p>Monitor and manage system-wide appointments</p></div>
            <div id="admin-appts-list">${Skeleton.list(6)}</div>
        </div>`;
    },
    async init() {
        try {
            const data = await API.get('/admin/appointments');
            const appts = data.appointments || [];
            const container = document.getElementById('admin-appts-list');

            if (!appts.length) {
                container.innerHTML = `<div class="empty-state"><h3>No Appointments</h3><p>No appointments in the system yet.</p></div>`;
                return;
            }

            container.innerHTML = `
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>UID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>${appts.map(a => `
                            <tr>
                                <td><code style="font-size:var(--fs-xs);">${a.appointment_uid || a.id}</code></td>
                                <td>${Utils.escapeHTML(a.patient_name || '-')}</td>
                                <td>Dr. ${Utils.escapeHTML(a.doctor_name || '-')}</td>
                                <td>${Utils.formatDate(a.appointment_date)}</td>
                                <td>${a.time_slot}</td>
                                <td>${Utils.statusBadge(a.status)}</td>
                                <td>${a.status !== 'cancelled' && a.status !== 'completed' ?
                    `<button class="btn btn-danger btn-sm" onclick="AdminAppointmentsPage.forceCancel('${a.id}')">Force Cancel</button>` : '—'}
                                </td>
                            </tr>
                        `).join('')}</tbody>
                    </table>
                </div>`;
        } catch (err) { Toast.show('Failed to load appointments', 'error'); }
    },
    forceCancel(id) {
        Modal.confirm('Force Cancel', 'This will cancel the appointment and notify both parties. Continue?', async () => {
            try {
                await API.put(`/admin/appointments/${id}/cancel`);
                Toast.show('Appointment force cancelled', 'success');
                this.init();
            } catch (err) { Toast.show(err.message, 'error'); }
        }, 'Force Cancel', 'btn-danger');
    }
};
