/* Admin Settings Page */
const AdminSettingsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>System Settings</h1><p>Configure system-wide settings</p></div>
            <div id="admin-settings-content"><div class="loading-screen"><div class="spinner"></div></div></div>
        </div>`;
    },
    async init() {
        try {
            const data = await API.get('/admin/settings');
            const settings = data.settings || {};
            document.getElementById('admin-settings-content').innerHTML = `
                <div class="settings-section animate-slide-up">
                    <h3>General Settings</h3>
                    <form id="admin-settings-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Site Name</label>
                                <input type="text" class="form-control" id="set-sitename" value="${Utils.escapeHTML(settings.site_name || 'DocBook')}">
                            </div>
                            <div class="form-group">
                                <label>Appointment Duration (minutes)</label>
                                <input type="number" class="form-control" id="set-duration" value="${settings.appointment_duration || 30}" min="10" max="120">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Max Appointments Per Slot</label>
                                <input type="number" class="form-control" id="set-maxslot" value="${settings.max_appointments_per_slot || 1}" min="1">
                            </div>
                            <div class="form-group">
                                <label>Cancellation Buffer (hours)</label>
                                <input type="number" class="form-control" id="set-cancel" value="${settings.cancellation_buffer_hours || 2}" min="0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Terms & Conditions</label>
                            <textarea class="form-control" id="set-terms" rows="3">${Utils.escapeHTML(settings.terms_conditions || '')}</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Save Settings</button>
                    </form>
                </div>
            `;

            document.getElementById('admin-settings-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await API.put('/admin/settings', {
                        site_name: document.getElementById('set-sitename').value,
                        appointment_duration: parseInt(document.getElementById('set-duration').value),
                        max_appointments_per_slot: parseInt(document.getElementById('set-maxslot').value),
                        cancellation_buffer_hours: parseInt(document.getElementById('set-cancel').value),
                        terms_conditions: document.getElementById('set-terms').value
                    });
                    Toast.show('Settings saved successfully!', 'success');
                } catch (err) { Toast.show(err.message, 'error'); }
            });
        } catch (err) { Toast.show('Failed to load settings', 'error'); }
    }
};
