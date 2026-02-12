import './style.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Booking from './pages/Booking'
import AdminDashboard from './pages/AdminDashboard'

const routes = {
    '/': Home,
    '/login': Login,
    '/register': Register,
    '/dashboard': Dashboard,
    '/book': Booking,
    '/admin': AdminDashboard
};

/* ===== TOAST UTILITY ===== */
window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const icons = { success: 'check_circle', error: 'error', info: 'info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="material-symbols-rounded">${icons[type] || 'info'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
};

/* ===== NAVBAR RENDERER ===== */
function renderNavbar() {
    const user = JSON.parse(localStorage.getItem('user'));
    const nav = document.createElement('nav');
    nav.className = 'navbar';

    let links = '';
    if (user) {
        const dashPath = user.role === 'admin' ? '/admin' : '/dashboard';
        links = `
            <button class="nav-link" onclick="window.navigateTo('${dashPath}')">
                <span class="material-symbols-rounded">dashboard</span>Dashboard
            </button>
            <button class="nav-link" id="nav-logout">
                <span class="material-symbols-rounded">logout</span>Logout
            </button>
        `;
    } else {
        links = `
            <button class="nav-link" onclick="window.navigateTo('/login')">
                <span class="material-symbols-rounded">login</span>Login
            </button>
            <button class="nav-link" onclick="window.navigateTo('/register')">
                <span class="material-symbols-rounded">person_add</span>Register
            </button>
        `;
    }

    nav.innerHTML = `
        <a class="navbar-brand" onclick="window.navigateTo('/')">
            <span class="material-symbols-rounded">medical_services</span>
            MediBook
        </a>
        <div class="navbar-nav">${links}</div>
    `;

    if (user) {
        nav.querySelector('#nav-logout').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.showToast('Logged out successfully', 'info');
            window.navigateTo('/');
        });
    }

    return nav;
}

/* ===== ROUTER ===== */
function router() {
    const path = window.location.pathname;
    const component = routes[path] || Home;
    const app = document.getElementById('app');

    app.innerHTML = '';
    app.appendChild(renderNavbar());

    const main = document.createElement('main');
    main.className = 'container page-content page-enter';
    const view = component();
    main.appendChild(view);
    app.appendChild(main);
}

window.navigateTo = (path) => {
    window.history.pushState({}, '', path);
    router();
};

window.addEventListener('popstate', router);
window.addEventListener('load', router);
