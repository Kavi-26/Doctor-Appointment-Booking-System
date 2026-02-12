export default function Booking() {
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctorId');
    const div = document.createElement('div');

    // Fetch doctor details
    async function init() {
        try {
            const response = await fetch(`/api/doctors/${doctorId}`);
            if (!response.ok) throw new Error('Doctor not found');
            const doctor = await response.json();

            div.innerHTML = `
                <h2>Book Appointment with Dr. ${doctor.name}</h2>
                <div class="card">
                   <p><strong>Specialization:</strong> ${doctor.specialization}</p>
                   <p><strong>Fee:</strong> $${doctor.consultation_fee}</p>
                </div>
                <form id="bookingForm">
                    <label>Date:</label>
                    <input type="date" id="date" required />
                    <label>Time:</label>
                    <input type="time" id="time" required />
                    <label>Reason:</label>
                    <textarea id="reason" placeholder="Reason for visit"></textarea>
                    <button type="submit">Confirm Booking</button>
                    <button type="button" onclick="window.navigateTo('/dashboard')">Cancel</button>
                </form>
            `;

            div.querySelector('#bookingForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const appointment_date = div.querySelector('#date').value;
                const appointment_time = div.querySelector('#time').value;
                const reason = div.querySelector('#reason').value;
                const token = localStorage.getItem('token');

                try {
                    const res = await fetch('/api/appointments', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({
                            doctor_id: doctorId,
                            appointment_date,
                            appointment_time,
                            reason
                        })
                    });

                    const data = await res.json();
                    if (res.ok) {
                        alert('Appointment booked successfully!');
                        window.navigateTo('/dashboard');
                    } else {
                        alert(data.message);
                    }
                } catch (err) {
                    console.error(err);
                    alert('Booking failed');
                }
            });

        } catch (error) {
            div.innerHTML = '<p>Error loading doctor details.</p>';
        }
    }

    if (!doctorId) {
        div.innerHTML = '<p>Invalid doctor selection.</p>';
    } else {
        init();
    }

    return div;
}
