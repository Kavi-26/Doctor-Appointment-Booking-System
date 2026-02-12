/* Doctor Profile Page (Patient view) */
const DoctorProfilePage = {
    render(id) {
        return `<div class="dashboard-page container" id="doctor-profile-page"><div class="loading-screen"><div class="spinner"></div></div></div>`;
    },
    async init(id) {
        try {
            const data = await API.get(`/patient/doctors/${id}`);
            const d = data.doctor;
            const reviews = data.reviews || [];
            document.getElementById('doctor-profile-page').innerHTML = `
                <div class="profile-header animate-slide-up">
                    <div class="profile-avatar-large">${d.profile_image ? `<img src="${d.profile_image}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-xl)">` : Utils.getInitials(d.name)}</div>
                    <div class="profile-details">
                        <h1>Dr. ${Utils.escapeHTML(d.name)}</h1>
                        <div class="meta">
                            <span><i data-lucide="stethoscope" style="width:14px;height:14px"></i> ${d.specialization}</span>
                            <span><i data-lucide="award" style="width:14px;height:14px"></i> ${d.qualification}</span>
                            <span><i data-lucide="briefcase" style="width:14px;height:14px"></i> ${d.experience} years</span>
                            <span>${Utils.starsHTML(d.rating || 0, d.total_reviews || 0)}</span>
                        </div>
                        <p style="color:var(--text-secondary);margin-top:var(--space-sm);font-size:var(--fs-sm);">${d.bio || ''}</p>
                        <div style="margin-top:var(--space-lg);display:flex;gap:var(--space-md);align-items:center;">
                            <span style="font-size:var(--fs-xl);font-weight:800;color:var(--primary);">${Utils.formatCurrency(d.consultation_fee)}</span>
                            <span class="text-muted">per consultation</span>
                            <a href="#/patient/book/${d.id}" class="btn btn-primary">Book Appointment</a>
                        </div>
                    </div>
                </div>

                ${reviews.length ? `
                <div class="card mt-2" style="padding:var(--space-xl);">
                    <h3 style="margin-bottom:var(--space-lg);">Patient Reviews (${reviews.length})</h3>
                    ${reviews.map(r => `
                        <div style="padding:var(--space-md) 0;border-bottom:1px solid var(--border-light);">
                            <div class="flex-between"><strong>${Utils.escapeHTML(r.patient_name || 'Patient')}</strong>${Utils.starsHTML(r.rating)}</div>
                            <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-top:4px;">${Utils.escapeHTML(r.review_text || '')}</p>
                            <span style="font-size:var(--fs-xs);color:var(--text-muted);">${Utils.formatDate(r.created_at)}</span>
                        </div>
                    `).join('')}
                </div>` : ''}
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) { Toast.show('Failed to load doctor profile', 'error'); }
    }
};
