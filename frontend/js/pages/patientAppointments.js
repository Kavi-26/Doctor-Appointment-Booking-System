/* Patient Appointments Page */
const PatientAppointmentsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>Upcoming Appointments</h1><p>Manage your scheduled appointments</p></div>
            <div id="patient-appointments-list">${Skeleton.list(4)}</div>
        </div>`;
    },
    async init() {
        try {
            const data = await API.get('/patient/appointments/upcoming');
            const appts = data.appointments || [];
            const container = document.getElementById('patient-appointments-list');
            if (!appts.length) {
                container.innerHTML = `<div class="empty-state"><h3>No Upcoming Appointments</h3><p>You don't have any appointments scheduled.</p><a href="#/patient/search-doctors" class="btn btn-primary mt-1">Find Doctors</a></div>`;
                return;
            }
            container.innerHTML = `<div class="appointments-list">${appts.map(a => {
                const dp = Utils.getDateParts(a.appointment_date);
                return `
                <div class="appointment-card">
                    <div class="appointment-date-badge">
                        <div class="month">${dp.month}</div><div class="day">${dp.day}</div><div class="year">${dp.year}</div>
                    </div>
                    <div class="appointment-info">
                        <h4>Dr. ${Utils.escapeHTML(a.doctor_name || 'Doctor')}</h4>
                        <div class="time"><i data-lucide="clock" style="width:14px;height:14px"></i> ${a.time_slot}</div>
                        <div class="uid">${a.appointment_uid}</div>
                    </div>
                    ${Utils.statusBadge(a.status)}
                    <div class="appointment-actions">
                        ${a.status === 'pending' || a.status === 'confirmed' ? `<button class="btn btn-danger btn-sm" onclick="PatientAppointmentsPage.cancel('${a.id}')">Cancel</button>` : ''}
                    </div>
                </div>`;
            }).join('')}</div>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) { Toast.show('Failed to load appointments', 'error'); }
    },
    cancel(id) {
        Modal.confirm('Cancel Appointment', 'Are you sure you want to cancel this appointment?', async () => {
            try {
                await API.put(`/patient/appointments/${id}/cancel`);
                Toast.show('Appointment cancelled', 'success');
                PatientAppointmentsPage.init();
            } catch (err) { Toast.show(err.message, 'error'); }
        }, 'Cancel Appointment', 'btn-danger');
    }
};
