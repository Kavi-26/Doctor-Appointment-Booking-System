import DoctorList from '../components/DoctorList';
import AppointmentList from '../components/AppointmentList';

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.navigateTo('/login');
        return document.createElement('div');
    }

    const div = document.createElement('div');

    const greeting = getGreeting();
    div.innerHTML = `
        <div style="margin-bottom:2rem;">
            <h2>${greeting}, ${user.name} 👋</h2>
            <p class="text-muted">Manage your appointments and find the right doctor for you.</p>
        </div>
        <div class="grid-2">
            <div id="left-panel"></div>
            <div id="right-panel"></div>
        </div>
    `;

    const leftPanel = div.querySelector('#left-panel');
    const rightPanel = div.querySelector('#right-panel');

    if (user.role === 'patient') {
        leftPanel.appendChild(DoctorList());
        rightPanel.appendChild(AppointmentList());
    } else if (user.role === 'doctor') {
        leftPanel.appendChild(AppointmentList());
        rightPanel.innerHTML = `
            <div class="card" style="text-align:center;padding:2rem;">
                <span class="material-symbols-rounded" style="font-size:2.5rem;color:var(--primary-400);margin-bottom:0.75rem;">tune</span>
                <h3>Availability Settings</h3>
                <p class="text-muted text-sm" style="margin-top:0.5rem;">Set your available time slots so patients can book with you.</p>
                <button class="btn btn-secondary" style="margin-top:1rem;" disabled>
                    <span class="material-symbols-rounded">edit_calendar</span>Manage Slots
                </button>
            </div>
        `;
    }

    return div;
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}
