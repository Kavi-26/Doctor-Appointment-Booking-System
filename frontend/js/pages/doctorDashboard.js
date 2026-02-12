/* Doctor Dashboard */
const DoctorDashboardPage = {
    render() {
        return `<div class="dashboard-page container" id="doc-dash">${Skeleton.stats(4)}</div>`;
    },
    async init() {
        try {
            const user = Auth.getUser();
            const [todayData, upcomingData] = await Promise.all([
                API.get('/doctor/appointments/today'),
                API.get('/doctor/appointments/upcoming')
            ]);
            const today = todayData.appointments || [];
            const upcoming = upcomingData.appointments || [];

            document.getElementById('doc-dash').innerHTML = `
                <div class="dashboard-welcome" style="background:var(--gradient-ocean);">
                    <h1>Good ${this.greeting()}, Dr. ${user.name}! 🩺</h1>
                    <p>${today.length} appointment${today.length !== 1 ? 's' : ''} today</p>
                    <div class="dashboard-actions">
                        <a href="#/doctor/appointments" class="btn" style="background:rgba(255,255,255,0.2);color:white"><i data-lucide="calendar" style="width:16px;height:16px"></i> All Appointments</a>
                        <a href="#/doctor/availability" class="btn btn-accent"><i data-lucide="clock" style="width:16px;height:16px"></i> Set Availability</a>
                    </div>
                </div>

                <div class="stats-grid mt-2">
                    <div class="stat-card blue"><div class="stat-icon blue"><i data-lucide="calendar-check" style="width:24px;height:24px"></i></div><div class="stat-info"><h3>${today.length}</h3><p>Today's Appointments</p></div></div>
                    <div class="stat-card purple"><div class="stat-icon purple"><i data-lucide="calendar" style="width:24px;height:24px"></i></div><div class="stat-info"><h3>${upcoming.length}</h3><p>Upcoming Total</p></div></div>
                </div>

                <div class="section-title mt-2"><h2><i data-lucide="clock" style="width:22px;height:22px"></i> Today's Schedule</h2></div>
                ${today.length ? `<div class="appointments-list">${today.map(a => this.apptCard(a)).join('')}</div>` :
                    `<div class="empty-state"><h3>No Appointments Today</h3><p>Enjoy your free time! ☕</p></div>`}
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) { Toast.show('Failed to load dashboard', 'error'); }
    },
    greeting() {
        const h = new Date().getHours();
        return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
    },
    apptCard(a) {
        const dp = Utils.getDateParts(a.appointment_date);
        return `
        <div class="appointment-card">
            <div class="appointment-date-badge"><div class="month">${dp.month}</div><div class="day">${dp.day}</div></div>
            <div class="appointment-info">
                <h4>${Utils.escapeHTML(a.patient_name || 'Patient')}</h4>
                <div class="time"><i data-lucide="clock" style="width:14px;height:14px"></i> ${a.time_slot}</div>
            </div>
            ${Utils.statusBadge(a.status)}
            <div class="appointment-actions">
                ${a.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="DoctorDashboardPage.accept('${a.id}')">Accept</button><button class="btn btn-danger btn-sm" onclick="DoctorDashboardPage.reject('${a.id}')">Reject</button>` : ''}
                ${a.status === 'confirmed' ? `<button class="btn btn-primary btn-sm" onclick="DoctorDashboardPage.complete('${a.id}')">Complete</button>` : ''}
            </div>
        </div>`;
    },
    async accept(id) { try { await API.put(`/doctor/appointments/${id}/accept`); Toast.show('Appointment accepted', 'success'); this.init(); } catch (e) { Toast.show(e.message, 'error'); } },
    async reject(id) { Modal.confirm('Reject', 'Reject this appointment?', async () => { try { await API.put(`/doctor/appointments/${id}/reject`); Toast.show('Appointment rejected', 'info'); this.init(); } catch (e) { Toast.show(e.message, 'error'); } }, 'Reject', 'btn-danger'); },
    async complete(id) { try { await API.put(`/doctor/appointments/${id}/complete`); Toast.show('Appointment marked complete', 'success'); this.init(); } catch (e) { Toast.show(e.message, 'error'); } }
};
