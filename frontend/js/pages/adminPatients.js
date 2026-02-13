/* Admin Patients Management */
const AdminPatientsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>Manage Patients</h1><p>View and manage patient accounts</p></div>
            <div class="search-bar">
                <div class="search-input-wrapper">
                    <i data-lucide="search" style="width:18px;height:18px"></i>
                    <input type="text" class="form-control" id="patient-search" placeholder="Search patients...">
                </div>
            </div>
            <div id="admin-patients-list">${Skeleton.list(5)}</div>
        </div>`;
    },
    async init() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        document.getElementById('patient-search')?.addEventListener('input', Utils.debounce(() => this.load(), 400));
        this.load();
    },
    async load() {
        const search = document.getElementById('patient-search')?.value || '';
        const container = document.getElementById('admin-patients-list');
        try {
            let url = '/admin/patients';
            if (search) url += `?search=${encodeURIComponent(search)}`;
            const data = await API.get(url);
            const patients = data.patients || [];

            if (!patients.length) {
                container.innerHTML = `<div class="empty-state"><h3>No Patients Found</h3></div>`;
                return;
            }

            container.innerHTML = `
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>Patient</th><th>Phone</th><th>Age</th><th>Gender</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>${patients.map(p => `
                            <tr>
                                <td><div class="flex gap-sm" style="align-items:center;">
                                    <div class="avatar-placeholder" style="width:32px;height:32px;font-size:12px;">${Utils.getInitials(p.name)}</div>
                                    <div><strong>${Utils.escapeHTML(p.name)}</strong><br><small class="text-muted">${p.email}</small></div>
                                </div></td>
                                <td>${p.phone || '-'}</td>
                                <td>${p.age || '-'}</td>
                                <td style="text-transform:capitalize;">${p.gender || '-'}</td>
                                <td>${p.is_active !== false && p.is_active !== 0 ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Blocked</span>'}</td>
                                <td>
                                    <button class="btn btn-sm ${p.is_active !== false && p.is_active !== 0 ? 'btn-danger' : 'btn-success'}" 
                                        onclick="AdminPatientsPage.toggleBlock(${p.id}, ${p.is_active !== false && p.is_active !== 0})">
                                        ${p.is_active !== false && p.is_active !== 0 ? 'Block' : 'Unblock'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}</tbody>
                    </table>
                </div>`;
        } catch (err) { Toast.show('Failed to load patients', 'error'); }
    },
    async toggleBlock(id, isActive) {
        const action = isActive ? 'block' : 'unblock';
        Modal.confirm(`${isActive ? 'Block' : 'Unblock'} Patient`, `Are you sure you want to ${action} this patient?`, async () => {
            try {
                await API.put(`/admin/patients/${id}/block`);
                Toast.show(`Patient ${action}ed`, 'success');
                this.load();
            } catch (err) { Toast.show(err.message, 'error'); }
        }, isActive ? 'Block' : 'Unblock', isActive ? 'btn-danger' : 'btn-success');
    }
};
