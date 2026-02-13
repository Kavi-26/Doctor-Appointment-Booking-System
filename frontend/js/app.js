/* ═══════════════════════════════════════════════════════════
   SPA Router — Hash-based routing
   ═══════════════════════════════════════════════════════════ */

const App = {
    routes: {
        // Public
        '/': { page: HomePage, auth: false },
        '/patient/register': { page: PatientRegisterPage, auth: false },
        '/patient/login': { page: PatientLoginPage, auth: false },
        '/doctor/register': { page: DoctorRegisterPage, auth: false },
        '/doctor/login': { page: DoctorLoginPage, auth: false },
        '/admin/login': { page: AdminLoginPage, auth: false },

        // Patient (protected)
        '/patient/dashboard': { page: PatientDashboardPage, auth: true, role: 'patient' },
        '/patient/search-doctors': { page: SearchDoctorsPage, auth: true, role: 'patient' },
        '/patient/doctor/:id': { page: DoctorProfilePage, auth: true, role: 'patient' },
        '/patient/book/:id': { page: BookAppointmentPage, auth: true, role: 'patient' },
        '/patient/appointments': { page: PatientAppointmentsPage, auth: true, role: 'patient' },
        '/patient/history': { page: PatientHistoryPage, auth: true, role: 'patient' },
        '/patient/notifications': { page: PatientNotificationsPage, auth: true, role: 'patient' },
        '/patient/settings': { page: PatientSettingsPage, auth: true, role: 'patient' },

        // Doctor (protected)
        '/doctor/dashboard': { page: DoctorDashboardPage, auth: true, role: 'doctor' },
        '/doctor/appointments': { page: DoctorAppointmentsPage, auth: true, role: 'doctor' },
        '/doctor/availability': { page: DoctorAvailabilityPage, auth: true, role: 'doctor' },
        '/doctor/earnings': { page: DoctorEarningsPage, auth: true, role: 'doctor' },
        '/doctor/notifications': { page: DoctorNotificationsPage, auth: true, role: 'doctor' },

        // Admin (protected)
        '/admin/dashboard': { page: AdminDashboardPage, auth: true, role: 'admin' },
        '/admin/doctors': { page: AdminDoctorsPage, auth: true, role: 'admin' },
        '/admin/patients': { page: AdminPatientsPage, auth: true, role: 'admin' },
        '/admin/appointments': { page: AdminAppointmentsPage, auth: true, role: 'admin' },
        '/admin/reports': { page: AdminReportsPage, auth: true, role: 'admin' },
        '/admin/settings': { page: AdminSettingsPage, auth: true, role: 'admin' },
    },

    init() {
        // Apply saved theme
        const savedTheme = localStorage.getItem('docbook_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Listen for route changes
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());

        this.handleRoute();
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';  // Remove '#'
        const { route, params } = this.matchRoute(hash);

        if (!route) {
            this.renderNotFound();
            return;
        }

        // Auth guard
        if (route.auth && !Auth.isLoggedIn()) {
            window.location.hash = '#/';
            Toast.show('Please login to continue', 'warning');
            return;
        }

        // Role guard
        if (route.role && Auth.getRole() !== route.role) {
            window.location.hash = `#/${Auth.getRole()}/dashboard`;
            Toast.show('Access denied', 'error');
            return;
        }

        // Render page
        const app = document.getElementById('app');
        const page = route.page;

        // Render with params
        if (params.id) {
            app.innerHTML = page.render(params.id);
        } else {
            app.innerHTML = page.render();
        }

        // Initialize page-specific logic
        if (page.init) {
            if (params.id) {
                page.init(params.id);
            } else {
                page.init();
            }
        }

        // Re-render navbar and footer
        Navbar.render();
        Footer.render();

        // Scroll to top
        window.scrollTo(0, 0);

        // Re-create lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    matchRoute(path) {
        // Direct match
        if (this.routes[path]) {
            return { route: this.routes[path], params: {} };
        }

        // Parameterized match
        for (const [pattern, config] of Object.entries(this.routes)) {
            if (pattern.includes(':')) {
                const regexStr = pattern.replace(/:(\w+)/g, '([^/]+)');
                const regex = new RegExp(`^${regexStr}$`);
                const match = path.match(regex);
                if (match) {
                    const paramNames = [...pattern.matchAll(/:(\w+)/g)].map(m => m[1]);
                    const params = {};
                    paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
                    return { route: config, params };
                }
            }
        }

        return { route: null, params: {} };
    },

    renderNotFound() {
        document.getElementById('app').innerHTML = `
            <div class="auth-page" style="min-height:70vh;">
                <div class="text-center">
                    <h1 style="font-size:6rem;font-weight:900;color:var(--primary);margin-bottom:var(--space-md);">404</h1>
                    <h2 style="margin-bottom:var(--space-md);">Page Not Found</h2>
                    <p class="text-muted" style="margin-bottom:var(--space-xl);">The page you're looking for doesn't exist.</p>
                    <a href="#/" class="btn btn-primary btn-lg">Go Home</a>
                </div>
            </div>
        `;
        Navbar.render();
        Footer.render();
    }
};

// Boot the app
App.init();
