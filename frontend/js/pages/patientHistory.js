/* Patient History Page */
const PatientHistoryPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>Appointment History</h1><p>View your past appointments and leave reviews</p></div>
            <div id="patient-history-list">${Skeleton.list(4)}</div>
        </div>`;
    },
    async init() {
        try {
            const data = await API.get('/patient/appointments/history');
            const appts = data.appointments || [];
            const container = document.getElementById('patient-history-list');
            if (!appts.length) {
                container.innerHTML = `<div class="empty-state"><h3>No Past Appointments</h3><p>Your appointment history will appear here.</p></div>`;
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
                        <div class="uid">${a.appointment_uid} ${a.notes ? `<br><small style="color:var(--text-secondary)">Notes: ${Utils.escapeHTML(a.notes)}</small>` : ''}</div>
                    </div>
                    ${Utils.statusBadge(a.status)}
                    <div class="appointment-actions">
                        ${a.status === 'completed' && !a.has_review ? `<button class="btn btn-outline btn-sm" onclick="PatientHistoryPage.showReview(${a.doctor_id},'${a.id}')">★ Review</button>` : ''}
                        ${a.prescription_url ? `<a href="${a.prescription_url}" target="_blank" class="btn btn-ghost btn-sm">📄 Prescription</a>` : ''}
                    </div>
                </div>`;
            }).join('')}</div>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) { Toast.show('Failed to load history', 'error'); }
    },
    showReview(doctorId, appointmentId) {
        Modal.show('Leave a Review', `
            <div id="review-stars" style="text-align:center;margin-bottom:var(--space-lg);"></div>
            <div class="form-group"><label>Your Review</label><textarea class="form-control" id="review-text" placeholder="Share your experience..." rows="3"></textarea></div>
        `, [
            { text: 'Cancel', class: 'btn-ghost', onclick: 'Modal.hide()' },
            { text: 'Submit Review', class: 'btn-primary', onclick: `PatientHistoryPage.submitReview(${doctorId},'${appointmentId}')` }
        ]);
        StarRating.create('review-stars', { onRate: (r) => { PatientHistoryPage._rating = r; } });
    },
    async submitReview(doctorId, appointmentId) {
        try {
            await API.post('/patient/reviews', {
                doctor_id: doctorId,
                appointment_id: appointmentId,
                rating: this._rating || 5,
                review_text: document.getElementById('review-text')?.value || ''
            });
            Modal.hide();
            Toast.show('Review submitted! Thank you.', 'success');
            this.init();
        } catch (err) { Toast.show(err.message, 'error'); }
    }
};
