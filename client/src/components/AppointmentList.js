export default function AppointmentList() {
    const div = document.createElement('div');
    div.innerHTML = '<h3>Your Appointments</h3><div id="appointments-container">Loading...</div>';

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
                container.innerHTML = '<p>No appointments found.</p>';
                return;
            }

            appointments.forEach(app => {
                const card = document.createElement('div');
                card.className = 'card appointment-card';
                card.innerHTML = `
                    <p><strong>Date:</strong> ${new Date(app.appointment_date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${app.appointment_time}</p>
                    <p><strong>Doctor:</strong> ${app.doctor_name || 'N/A'}</p>
                    <p><strong>Status:</strong> ${app.status}</p>
                `;
                container.appendChild(card);
            });

        } catch (error) {
            console.error(error);
            div.querySelector('#appointments-container').innerHTML = '<p>Error loading appointments.</p>';
        }
    }

    loadAppointments();
    return div;
}
