/* Doctor Availability Page */
const DoctorAvailabilityPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>Manage Availability</h1><p>Set your working hours and blocked dates</p></div>
            <div class="tabs">
                <button class="tab active" onclick="DoctorAvailabilityPage.showTab('schedule')">Working Hours</button>
                <button class="tab" onclick="DoctorAvailabilityPage.showTab('blocked')">Blocked Dates</button>
            </div>
            <div id="avail-schedule" class="animate-fade">
                <div class="card" style="padding:var(--space-xl);">
                    <h3 style="margin-bottom:var(--space-lg);">Set Weekly Schedule</h3>
                    <form id="availability-form">
                        ${['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => `
                            <div style="display:flex;align-items:center;gap:var(--space-md);padding:var(--space-md) 0;border-bottom:1px solid var(--border-light);">
                                <label style="width:100px;font-weight:600;text-transform:capitalize;">${day}</label>
                                <input type="checkbox" id="day-${day}" style="width:18px;height:18px;cursor:pointer;">
                                <input type="time" class="form-control" id="start-${day}" value="09:00" style="width:140px;">
                                <span>to</span>
                                <input type="time" class="form-control" id="end-${day}" value="17:00" style="width:140px;">
                            </div>
                        `).join('')}
                        <button type="submit" class="btn btn-primary mt-2">Save Schedule</button>
                    </form>
                </div>
            </div>
            <div id="avail-blocked" class="hidden animate-fade">
                <div class="card" style="padding:var(--space-xl);">
                    <h3 style="margin-bottom:var(--space-lg);">Block a Date</h3>
                    <div style="display:flex;gap:var(--space-md);margin-bottom:var(--space-xl);">
                        <input type="date" class="form-control" id="block-date" style="max-width:250px;">
                        <input type="text" class="form-control" id="block-reason" placeholder="Reason (optional)" style="flex:1;">
                        <button class="btn btn-primary" onclick="DoctorAvailabilityPage.blockDate()">Block Date</button>
                    </div>
                    <div id="blocked-dates-list"></div>
                </div>
            </div>
        </div>`;
    },
    async init() {
        this.loadAvailability();
    },
    showTab(tab) {
        document.querySelectorAll('.tabs .tab').forEach((t, i) => t.classList.toggle('active', (tab === 'schedule' && i === 0) || (tab === 'blocked' && i === 1)));
        document.getElementById('avail-schedule').classList.toggle('hidden', tab !== 'schedule');
        document.getElementById('avail-blocked').classList.toggle('hidden', tab !== 'blocked');
        if (tab === 'blocked') this.loadBlockedDates();
    },
    async loadAvailability() {
        try {
            const data = await API.get('/doctor/availability');
            const avail = data.availability || [];
            avail.forEach(a => {
                const cb = document.getElementById(`day-${a.day_of_week}`);
                const start = document.getElementById(`start-${a.day_of_week}`);
                const end = document.getElementById(`end-${a.day_of_week}`);
                if (cb) cb.checked = true;
                if (start) start.value = a.start_time?.slice(0, 5) || '09:00';
                if (end) end.value = a.end_time?.slice(0, 5) || '17:00';
            });
        } catch (e) { }

        document.getElementById('availability-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const schedule = [];
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
                if (document.getElementById(`day-${day}`)?.checked) {
                    schedule.push({
                        day_of_week: day,
                        start_time: document.getElementById(`start-${day}`).value,
                        end_time: document.getElementById(`end-${day}`).value
                    });
                }
            });
            try {
                await API.post('/doctor/availability', { schedule });
                Toast.show('Availability saved!', 'success');
            } catch (err) { Toast.show(err.message, 'error'); }
        });
    },
    async loadBlockedDates() {
        try {
            const data = await API.get('/doctor/blocked-dates');
            const dates = data.blocked_dates || [];
            document.getElementById('blocked-dates-list').innerHTML = dates.length ?
                dates.map(d => `
                    <div class="flex-between" style="padding:var(--space-sm) 0;border-bottom:1px solid var(--border-light);">
                        <div><strong>${Utils.formatDate(d.date)}</strong> ${d.reason ? `<span class="text-muted">— ${d.reason}</span>` : ''}</div>
                        <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="DoctorAvailabilityPage.unblock('${d.date}')">Remove</button>
                    </div>
                `).join('') : '<p class="text-muted">No blocked dates.</p>';
        } catch (e) { }
    },
    async blockDate() {
        const date = document.getElementById('block-date')?.value;
        if (!date) { Toast.show('Select a date', 'warning'); return; }
        try {
            await API.post('/doctor/blocked-dates', { date, reason: document.getElementById('block-reason')?.value || '' });
            Toast.show('Date blocked', 'success');
            this.loadBlockedDates();
        } catch (err) { Toast.show(err.message, 'error'); }
    },
    async unblock(date) {
        try {
            await API.delete(`/doctor/blocked-dates/${date}`);
            Toast.show('Date unblocked', 'success');
            this.loadBlockedDates();
        } catch (err) { Toast.show(err.message, 'error'); }
    }
};
