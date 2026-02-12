import DoctorList from '../components/DoctorList';
import AppointmentList from '../components/AppointmentList';

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.navigateTo('/login');
        return document.createElement('div');
    }

    const div = document.createElement('div');
    div.innerHTML = `
        <h2>Welcome, ${user.name}</h2>
        <div class="dashboard-grid">
            <div id="left-panel"></div>
            <div id="right-panel"></div>
        </div>
        <button id="logout-btn">Logout</button>
    `;

    div.querySelector('#logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.navigateTo('/');
    });

    const leftPanel = div.querySelector('#left-panel');
    const rightPanel = div.querySelector('#right-panel');

    if (user.role === 'patient') {
        leftPanel.appendChild(DoctorList());
        rightPanel.appendChild(AppointmentList());
    } else if (user.role === 'doctor') {
        leftPanel.innerHTML = '<h3>My Schedule</h3>';
        leftPanel.appendChild(AppointmentList());
        rightPanel.innerHTML = '<p>Availability settings coming soon...</p>';
    }

    return div;
}
