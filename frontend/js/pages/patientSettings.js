/* Patient Settings / Profile Page */
const PatientSettingsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>Profile Settings</h1><p>Update your personal information</p></div>
            <div id="patient-settings-content"><div class="loading-screen"><div class="spinner"></div></div></div>
        </div>`;
    },
    async init() {
        try {
            const data = await API.get('/patient/profile');
            const u = data.user;
            document.getElementById('patient-settings-content').innerHTML = `
                <div class="settings-section animate-slide-up">
                    <h3>Personal Information</h3>
                    <form id="patient-settings-form">
                        <div class="form-row">
                            <div class="form-group"><label>Full Name</label><input type="text" class="form-control" id="ps-name" value="${Utils.escapeHTML(u.name || '')}"></div>
                            <div class="form-group"><label>Email (read-only)</label><input type="email" class="form-control" value="${Utils.escapeHTML(u.email || '')}" disabled></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label>Phone</label><input type="tel" class="form-control" id="ps-phone" value="${u.phone || ''}"></div>
                            <div class="form-group"><label>Age</label><input type="number" class="form-control" id="ps-age" value="${u.age || ''}"></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label>Gender</label>
                                <select class="form-control" id="ps-gender">
                                    <option value="male" ${u.gender === 'male' ? 'selected' : ''}>Male</option>
                                    <option value="female" ${u.gender === 'female' ? 'selected' : ''}>Female</option>
                                    <option value="other" ${u.gender === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Blood Group</label><input type="text" class="form-control" id="ps-blood" value="${u.blood_group || ''}" placeholder="A+, B-, etc."></div>
                        </div>
                        <div class="form-group"><label>Address</label><textarea class="form-control" id="ps-address" rows="2" placeholder="Your address">${u.address || ''}</textarea></div>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </form>
                </div>`;
            document.getElementById('patient-settings-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    await API.put('/patient/profile', {
                        name: document.getElementById('ps-name').value,
                        phone: document.getElementById('ps-phone').value,
                        age: parseInt(document.getElementById('ps-age').value),
                        gender: document.getElementById('ps-gender').value,
                        blood_group: document.getElementById('ps-blood').value,
                        address: document.getElementById('ps-address').value
                    });
                    Toast.show('Profile updated!', 'success');
                    // Update cached user
                    const user = Auth.getUser();
                    user.name = document.getElementById('ps-name').value;
                    Auth.setAuth(Auth.getToken(), user);
                    Navbar.render();
                } catch (err) { Toast.show(err.message, 'error'); }
            });
        } catch (err) { Toast.show('Failed to load profile', 'error'); }
    }
};
