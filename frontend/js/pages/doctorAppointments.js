/* Doctor Appointments Page */
const DoctorAppointmentsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>All Appointments</h1><p>Manage your patient appointments</p></div>
            <div class="tabs" id="doc-appt-tabs">
                <button class="tab active" onclick="DoctorAppointmentsPage.loadTab('upcoming')">Upcoming</button>
                <button class="tab" onclick="DoctorAppointmentsPage.loadTab('today')">Today</button>
                <button class="tab" onclick="DoctorAppointmentsPage.loadTab('all')">All</button>
            </div>
            <div id="doc-appt-list">${Skeleton.list(4)}</div>
        </div>`;
    },
    async init() { this.loadTab('upcoming'); },
    async loadTab(tab) {
        document.querySelectorAll('#doc-appt-tabs .tab').forEach(t => t.classList.remove('active'));
        event?.target?.classList.add('active');
        const container = document.getElementById('doc-appt-list');
        container.innerHTML = Skeleton.list(4);
        try {
            const endpoint = tab === 'today' ? '/doctor/appointments/today' :
                tab === 'upcoming' ? '/doctor/appointments/upcoming' : '/doctor/appointments';
            const data = await API.get(endpoint);
            const appts = data.appointments || [];
            if (!appts.length) {
                container.innerHTML = `<div class="empty-state"><h3>No Appointments</h3><p>No ${tab} appointments found.</p></div>`;
                return;
            }
            container.innerHTML = `<div class="appointments-list">${appts.map(a => {
                const dp = Utils.getDateParts(a.appointment_date);
                return `
                <div class="appointment-card">
                    <div class="appointment-date-badge"><div class="month">${dp.month}</div><div class="day">${dp.day}</div><div class="year">${dp.year}</div></div>
                    <div class="appointment-info">
                        <h4>${Utils.escapeHTML(a.patient_name || 'Patient')}</h4>
                        <div class="time"><i data-lucide="clock" style="width:14px;height:14px"></i> ${a.time_slot}</div>
                        <div class="uid">${a.appointment_uid || ''}</div>
                    </div>
                    ${Utils.statusBadge(a.status)}
                    <div class="appointment-actions">
                        ${a.status === 'pending' ? `
                            <button class="btn btn-success btn-sm" onclick="DoctorAppointmentsPage.action('${a.id}','accept')">Accept</button>
                            <button class="btn btn-danger btn-sm" onclick="DoctorAppointmentsPage.action('${a.id}','reject')">Reject</button>
                        ` : ''}
                        ${a.status === 'confirmed' ? `
                            <button class="btn btn-primary btn-sm" onclick="DoctorAppointmentsPage.action('${a.id}','complete')">Complete</button>
                        ` : ''}
                    </div>
                </div>`;
            }).join('')}</div>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) { Toast.show('Failed to load appointments', 'error'); }
    },
    async action(id, act) {
        try {
            await API.put(`/doctor/appointments/${id}/${act}`);
            Toast.show(`Appointment ${act}ed`, 'success');
            this.loadTab('upcoming');
        } catch (err) { Toast.show(err.message, 'error'); }
    }
};
