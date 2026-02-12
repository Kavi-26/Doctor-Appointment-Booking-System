export default function DoctorList() {
    const div = document.createElement('div');
    div.innerHTML = '<h3>Find a Doctor</h3><div id="doctors-container">Loading...</div>';

    async function loadDoctors() {
        try {
            const response = await fetch('/api/doctors');
            const doctors = await response.json();
            const container = div.querySelector('#doctors-container');
            container.innerHTML = '';

            if (doctors.length === 0) {
                container.innerHTML = '<p>No doctors found.</p>';
                return;
            }

            doctors.forEach(doc => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h4>${doc.name}</h4>
                    <p><strong>Specialization:</strong> ${doc.specialization}</p>
                    <p><strong>Experience:</strong> ${doc.experience} years</p>
                    <p><strong>Fee:</strong> $${doc.consultation_fee}</p>
                    <button class="book-btn" data-id="${doc.id}">Book Appointment</button>
                `;
                container.appendChild(card);
            });

            // Add event listeners
            container.querySelectorAll('.book-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const doctorId = e.target.getAttribute('data-id');
                    window.navigateTo(`/book?doctorId=${doctorId}`);
                });
            });

        } catch (error) {
            console.error(error);
            div.querySelector('#doctors-container').innerHTML = '<p>Error loading doctors.</p>';
        }
    }

    loadDoctors();
    return div;
}
