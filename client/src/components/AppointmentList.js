export default function AppointmentList() {
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="section-header">
            <h2><span class="material-symbols-rounded">event_note</span>Your Appointments</h2>
        </div>
        <div id="appointments-container">
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
        </div>
    `;

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function statusBadge(status) {
        const cls = {
            pending: 'badge-pending',
            approved: 'badge-approved',
            completed: 'badge-completed',
            rejected: 'badge-rejected',
            cancelled: 'badge-cancelled'
        }[status] || 'badge-pending';
        return `<span class="badge ${cls}">${status}</span>`;
    }

    async function loadAppointments() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/appointments/my', {
                headers: { 'x-auth-token': token }
            });
            const appointments = await response.json();
            const container = div.querySelector('#appointments-container');
            container.innerHTML = '';

            if (appointments.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="material-symbols-rounded">event_busy</span>
                        <h3>No Appointments Yet</h3>
                        <p>Book your first appointment with a doctor to get started.</p>
                    </div>
                `;
                return;
            }

            appointments.forEach(appt => {
                const d = new Date(appt.appointment_date);
                const day = d.getDate();
                const month = MONTHS[d.getMonth()];

                const card = document.createElement('div');
                card.className = 'appointment-card';
                card.innerHTML = `
                    <div class="appt-date-badge">
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <div class="appt-details">
                        <h4>${appt.doctor_name ? 'Dr. ' + appt.doctor_name : (appt.patient_name || 'Patient')}</h4>
                        <p>
                            <span class="material-symbols-rounded" style="font-size:0.9rem;vertical-align:middle;margin-right:2px;">schedule</span>
                            ${appt.appointment_time}
                            ${appt.specialization ? ' · ' + appt.specialization : ''}
                        </p>
                    </div>
                    ${statusBadge(appt.status)}
                `;
                container.appendChild(card);
            });

        } catch (error) {
            console.error(error);
            div.querySelector('#appointments-container').innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-rounded">cloud_off</span>
                    <h3>Connection Error</h3>
                    <p>Could not load appointments.</p>
                </div>
            `;
        }
    }

    loadAppointments();
    return div;
}
