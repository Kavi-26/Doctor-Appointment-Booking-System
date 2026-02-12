/* Book Appointment Page */
const BookAppointmentPage = {
    selectedDate: null,
    selectedSlot: null,

    render(doctorId) {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>Book Appointment</h1><p>Select a date and time slot</p></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);" id="booking-grid">
                <div id="booking-calendar">
                    <div class="loading-screen"><div class="spinner"></div></div>
                </div>
                <div id="booking-slots">
                    <div class="card text-center" style="padding:var(--space-2xl);">
                        <i data-lucide="calendar" style="width:48px;height:48px;color:var(--text-muted);opacity:0.3;"></i>
                        <p class="text-muted mt-1">Select a date to see available slots</p>
                    </div>
                </div>
            </div>
        </div>`;
    },

    async init(doctorId) {
        this.doctorId = doctorId;
        this.selectedDate = null;
        this.selectedSlot = null;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        Calendar.create('booking-calendar', {
            onSelect: (date) => this.loadSlots(date)
        });
    },

    async loadSlots(dateStr) {
        this.selectedDate = dateStr;
        this.selectedSlot = null;
        const slotsContainer = document.getElementById('booking-slots');
        slotsContainer.innerHTML = '<div class="card text-center" style="padding:var(--space-xl);"><div class="spinner" style="margin:0 auto;"></div></div>';

        try {
            const data = await API.get(`/patient/doctors/${this.doctorId}/availability?date=${dateStr}`);
            const slots = data.available_slots || [];

            if (!slots.length) {
                slotsContainer.innerHTML = `
                    <div class="card text-center" style="padding:var(--space-2xl);">
                        <i data-lucide="calendar-x" style="width:48px;height:48px;color:var(--text-muted);opacity:0.3;"></i>
                        <h3 style="margin-top:var(--space-md);color:var(--text-secondary);">No Availability</h3>
                        <p class="text-muted">No slots available on ${Utils.formatDate(dateStr)}. Try another date.</p>
                    </div>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }

            slotsContainer.innerHTML = `
                <div class="card" style="padding:var(--space-xl);">
                    <h3 style="margin-bottom:var(--space-lg);">Available Slots — ${Utils.formatDate(dateStr)}</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--space-sm);">
                        ${slots.map(s => `
                            <button class="time-slot-btn" onclick="BookAppointmentPage.selectSlot(this,'${s}')">${s}</button>
                        `).join('')}
                    </div>
                    <button class="btn btn-primary btn-block btn-lg mt-2" id="confirm-booking-btn" disabled onclick="BookAppointmentPage.confirmBooking()">
                        Select a Slot to Continue
                    </button>
                </div>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) {
            slotsContainer.innerHTML = `<div class="card text-center" style="padding:var(--space-xl);"><p class="text-muted">Failed to load slots</p></div>`;
            Toast.show(err.message, 'error');
        }
    },

    selectSlot(el, slot) {
        document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
        el.classList.add('selected');
        this.selectedSlot = slot;
        const btn = document.getElementById('confirm-booking-btn');
        btn.disabled = false;
        btn.textContent = `Book for ${slot}`;
    },

    async confirmBooking() {
        if (!this.selectedDate || !this.selectedSlot) return;
        const btn = document.getElementById('confirm-booking-btn');
        btn.disabled = true; btn.textContent = 'Booking...';
        try {
            await API.post('/patient/appointments', {
                doctor_id: parseInt(this.doctorId),
                appointment_date: this.selectedDate,
                time_slot: this.selectedSlot
            });
            Toast.show('Appointment booked successfully! 🎉', 'success');
            window.location.hash = '#/patient/appointments';
        } catch (err) {
            Toast.show(err.message, 'error');
            btn.disabled = false; btn.textContent = `Book for ${this.selectedSlot}`;
        }
    }
};
