/* Patient Dashboard */
const PatientDashboardPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div id="patient-dash-content">${Skeleton.stats(4)}</div>
        </div>`;
    },
    async init() {
        try {
            const user = Auth.getUser();
            const [upcoming, profile] = await Promise.all([
                API.get('/patient/appointments/upcoming'),
                API.get('/patient/profile')
            ]);
            const appts = upcoming.appointments || [];
            document.getElementById('patient-dash-content').innerHTML = `
                <div class="dashboard-welcome">
                    <h1>Welcome back, ${user.name}! 👋</h1>
                    <p>Manage your health journey from your personal dashboard.</p>
                    <div class="dashboard-actions">
                        <a href="#/patient/search-doctors" class="btn btn-accent">
                            <i data-lucide="search" style="width:16px;height:16px"></i> Find Doctors
                        </a>
                        <a href="#/patient/appointments" class="btn" style="background:rgba(255,255,255,0.15);color:white;">
                            <i data-lucide="calendar" style="width:16px;height:16px"></i> My Appointments
                        </a>
                    </div>
                </div>

                <div class="stats-grid mt-2">
                    <div class="stat-card purple">
                        <div class="stat-icon purple"><i data-lucide="calendar-check" style="width:24px;height:24px"></i></div>
                        <div class="stat-info"><h3>${appts.length}</h3><p>Upcoming Appointments</p></div>
                    </div>
                    <div class="stat-card green">
                        <div class="stat-icon green"><i data-lucide="user" style="width:24px;height:24px"></i></div>
                        <div class="stat-info"><h3>${profile.user?.name || user.name}</h3><p>My Profile</p></div>
                    </div>
                </div>

                <div class="section-title mt-2">
                    <h2><i data-lucide="clock" style="width:22px;height:22px"></i> Upcoming Appointments</h2>
                    <a href="#/patient/appointments" class="btn btn-ghost btn-sm">View All</a>
                </div>

                ${appts.length ? `
                    <div class="appointments-list">
                        ${appts.slice(0, 5).map(a => this.appointmentCard(a)).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div><i data-lucide="calendar-x" style="width:64px;height:64px;opacity:0.3;"></i></div>
                        <h3>No Upcoming Appointments</h3>
                        <p>Search for doctors and book your first appointment!</p>
                        <a href="#/patient/search-doctors" class="btn btn-primary mt-1">Find Doctors</a>
                    </div>
                `}
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) {
            Toast.show('Failed to load dashboard data', 'error');
        }
    },
    appointmentCard(a) {
        const dp = Utils.getDateParts(a.appointment_date);
        return `
        <div class="appointment-card">
            <div class="appointment-date-badge">
                <div class="month">${dp.month}</div>
                <div class="day">${dp.day}</div>
                <div class="year">${dp.year}</div>
            </div>
            <div class="appointment-info">
                <h4>Dr. ${a.doctor_name || 'Doctor'}</h4>
                <div class="time"><i data-lucide="clock" style="width:14px;height:14px"></i> ${a.time_slot}</div>
                <div class="uid">${a.appointment_uid}</div>
            </div>
            ${Utils.statusBadge(a.status)}
        </div>`;
    }
};
