const http = require('http');

function makeRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch (e) { resolve({ status: res.statusCode, data: { raw: data } }); }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function test() {
    // 1. Patient Login
    const login = await makeRequest({
        hostname: 'localhost', port: 5000, path: '/api/auth/patient/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { email: 'testpatient@test.com', password: 'Test1234' });

    console.log('1. PATIENT LOGIN:', login.status, login.data.success ? 'OK' : login.data.message);

    // Token is inside data.data (login returns {success, data: {token, ...}})
    // But Invoke-RestMethod auto-unwraps, so in raw JSON: token is at data.data.token
    const token = login.data.data?.token || login.data.token;
    if (!token) { console.log('ERROR: No token found!'); return; }
    console.log('   Token extracted: OK');

    // 2. Patient Dashboard
    const dash = await makeRequest({
        hostname: 'localhost', port: 5000, path: '/api/patient/dashboard',
        method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('2. PATIENT DASHBOARD:', dash.status, dash.data.success ? 'OK' : dash.data.message);
    if (dash.data.success) console.log('   Stats:', JSON.stringify(dash.data.data.stats));

    // 3. Patient Appointments
    const appts = await makeRequest({
        hostname: 'localhost', port: 5000, path: '/api/patient/appointments',
        method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('3. PATIENT APPOINTMENTS:', appts.status, appts.data.success ? 'OK' : appts.data.message);

    // 4. Patient Appointments with status filter
    const histAppts = await makeRequest({
        hostname: 'localhost', port: 5000, path: '/api/patient/appointments?status=completed',
        method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('4. PATIENT HISTORY:', histAppts.status, histAppts.data.success ? 'OK' : histAppts.data.message);

    // 5. Patient Notifications
    const notifs = await makeRequest({
        hostname: 'localhost', port: 5000, path: '/api/patient/notifications',
        method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('5. PATIENT NOTIFICATIONS:', notifs.status, notifs.data.success ? 'OK' : notifs.data.message);

    // 6. Patient Specializations
    const specs = await makeRequest({
        hostname: 'localhost', port: 5000, path: '/api/patient/specializations',
        method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('6. PATIENT SPECIALIZATIONS:', specs.status, specs.data.success ? 'OK' : specs.data.message);

    // 7. Search Doctors
    const docs = await makeRequest({
        hostname: 'localhost', port: 5000, path: '/api/patient/doctors',
        method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('7. SEARCH DOCTORS:', docs.status, docs.data.success ? 'OK' : docs.data.message);

    // 8. Admin Login
    const adminLogin = await makeRequest({
        hostname: 'localhost', port: 5000, path: '/api/auth/admin/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@system.com', password: 'admin123' });
    console.log('8. ADMIN LOGIN:', adminLogin.status, adminLogin.data.success ? 'OK' : adminLogin.data.message);

    if (adminLogin.data.success) {
        const adminToken = adminLogin.data.data?.token || adminLogin.data.token;

        const routes = [
            { name: '9. ADMIN DASHBOARD', path: '/api/admin/dashboard' },
            { name: '10. ADMIN DOCTORS', path: '/api/admin/doctors' },
            { name: '11. ADMIN PATIENTS', path: '/api/admin/patients' },
            { name: '12. ADMIN APPOINTMENTS', path: '/api/admin/appointments' },
            { name: '13. ADMIN REPORTS', path: '/api/admin/reports?period=monthly' },
            { name: '14. ADMIN SETTINGS', path: '/api/admin/settings' },
        ];

        for (const r of routes) {
            const resp = await makeRequest({
                hostname: 'localhost', port: 5000, path: r.path,
                method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            console.log(`${r.name}:`, resp.status, resp.data.success ? 'OK' : resp.data.message);
        }
    } else {
        console.log('   SKIPPING ADMIN ROUTES (admin login failed — seed data may not exist)');
    }

    console.log('\n=== ALL ENDPOINT TESTS COMPLETE ===');
}

test().catch(console.error);
