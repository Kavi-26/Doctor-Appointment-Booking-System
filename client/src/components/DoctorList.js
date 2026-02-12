export default function DoctorList() {
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="section-header">
            <h2><span class="material-symbols-rounded">stethoscope</span>Available Doctors</h2>
        </div>
        <div id="doctors-container">
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
        </div>
    `;

    async function loadDoctors() {
        try {
            const response = await fetch('/api/doctors');
            const doctors = await response.json();
            const container = div.querySelector('#doctors-container');
            container.innerHTML = '';

            if (doctors.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="material-symbols-rounded">person_search</span>
                        <h3>No Doctors Available</h3>
                        <p>Doctors will appear here once they are registered in the system.</p>
                    </div>
                `;
                return;
            }

            doctors.forEach(doc => {
                const initials = doc.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const card = document.createElement('div');
                card.className = 'doctor-card';
                card.innerHTML = `
                    <div class="doctor-info">
                        <div class="doctor-avatar">${initials}</div>
                        <div>
                            <h4>Dr. ${doc.name}</h4>
                            <p class="text-muted text-sm">${doc.specialization}</p>
                        </div>
                    </div>
                    <div class="doctor-meta">
                        <span><span class="material-symbols-rounded">work</span>${doc.experience} yrs exp</span>
                        <span><span class="material-symbols-rounded">payments</span>$${doc.consultation_fee}</span>
                        <span><span class="material-symbols-rounded">wc</span>${doc.gender || 'N/A'}</span>
                    </div>
                    <button class="btn btn-primary btn-sm book-btn" data-id="${doc.id}">
                        <span class="material-symbols-rounded">calendar_month</span>Book Appointment
                    </button>
                `;
                container.appendChild(card);
            });

            container.querySelectorAll('.book-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const doctorId = e.currentTarget.getAttribute('data-id');
                    window.navigateTo(`/book?doctorId=${doctorId}`);
                });
            });

        } catch (error) {
            console.error(error);
            div.querySelector('#doctors-container').innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-rounded">cloud_off</span>
                    <h3>Connection Error</h3>
                    <p>Could not load doctors. Please check your connection.</p>
                </div>
            `;
        }
    }

    loadDoctors();
    return div;
}
