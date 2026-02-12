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

function router() {
    const path = window.location.pathname;
    const component = routes[path] || Home;
    const app = document.getElementById('app');

    // Clear current content
    app.innerHTML = '';

    // Render component
    const view = component();
    app.appendChild(view);
}

// Handle navigation
window.navigateTo = (path) => {
    window.history.pushState({}, '', path);
    router();
};

window.addEventListener('popstate', router);
window.addEventListener('load', router);
