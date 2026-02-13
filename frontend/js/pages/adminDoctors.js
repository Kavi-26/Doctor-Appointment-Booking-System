/* Admin Doctors Management */
const AdminDoctorsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>Manage Doctors</h1><p>Approve, review, and manage doctor accounts</p></div>
            <div class="tabs">
                <button class="tab active" onclick="AdminDoctorsPage.loadTab('all')">All Doctors</button>
                <button class="tab" onclick="AdminDoctorsPage.loadTab('pending')">Pending Approval</button>
            </div>
            <div id="admin-doctors-list">${Skeleton.list(5)}</div>
        </div>`;
    },
    currentTab: 'all',
    async init() { this.loadTab('all'); },
    async loadTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.tabs .tab').forEach((t, i) => t.classList.toggle('active', (tab === 'all' && i === 0) || (tab === 'pending' && i === 1)));
        const container = document.getElementById('admin-doctors-list');
        container.innerHTML = Skeleton.list(5);
        try {
            const data = await API.get('/admin/doctors');
            let doctors = data.doctors || [];
            if (tab === 'pending') doctors = doctors.filter(d => d.is_active === 0 || d.is_active === false);

            if (!doctors.length) {
                container.innerHTML = `<div class="empty-state"><h3>No ${tab === 'pending' ? 'Pending' : ''} Doctors</h3><p>${tab === 'pending' ? 'No doctors awaiting approval.' : 'No doctors registered yet.'}</p></div>`;
                return;
            }

            container.innerHTML = `
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>Doctor</th><th>Specialization</th><th>Experience</th><th>License</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>${doctors.map(d => `
                            <tr>
                                <td><div class="flex gap-sm" style="align-items:center;">
                                    <div class="avatar-placeholder" style="width:32px;height:32px;font-size:12px;">${Utils.getInitials(d.name)}</div>
                                    <div><strong>${Utils.escapeHTML(d.name)}</strong><br><small class="text-muted">${d.email}</small></div>
                                </div></td>
                                <td>${d.specialization || '-'}</td>
                                <td>${d.experience || 0} yrs</td>
                                <td><code>${d.license_number || '-'}</code></td>
                                <td>${Utils.formatCurrency(d.consultation_fee || 0)}</td>
                                <td>${d.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-warning">Pending</span>'}</td>
                                <td>
                                    <div class="flex gap-sm">
                                        ${!d.is_active ? `
                                            <button class="btn btn-success btn-sm" onclick="AdminDoctorsPage.approve(${d.id})">Approve</button>
                                            <button class="btn btn-danger btn-sm" onclick="AdminDoctorsPage.reject(${d.id})">Reject</button>
                                        ` : `
                                            <button class="btn btn-danger btn-sm" onclick="AdminDoctorsPage.remove(${d.id})">Remove</button>
                                        `}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}</tbody>
                    </table>
                </div>`;
        } catch (err) { Toast.show('Failed to load doctors', 'error'); }
    },
    async approve(id) {
        try { await API.put(`/admin/doctors/${id}/approve`); Toast.show('Doctor approved!', 'success'); this.loadTab(this.currentTab); }
        catch (err) { Toast.show(err.message, 'error'); }
    },
    async reject(id) {
        Modal.confirm('Reject Doctor', 'Are you sure you want to reject this doctor?', async () => {
            try { await API.put(`/admin/doctors/${id}/reject`); Toast.show('Doctor rejected', 'info'); this.loadTab(this.currentTab); }
            catch (err) { Toast.show(err.message, 'error'); }
        }, 'Reject', 'btn-danger');
    },
    async remove(id) {
        Modal.confirm('Remove Doctor', 'This will permanently remove the doctor. Continue?', async () => {
            try { await API.delete(`/admin/doctors/${id}`); Toast.show('Doctor removed', 'success'); this.loadTab(this.currentTab); }
            catch (err) { Toast.show(err.message, 'error'); }
        }, 'Remove', 'btn-danger');
    }
};
