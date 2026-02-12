/* ═══════════════════════════════════════════════════════════
   Navbar Component
   ═══════════════════════════════════════════════════════════ */

const Navbar = {
    render() {
        const nav = document.getElementById('navbar');
        const user = Auth.getUser();
        const isLoggedIn = Auth.isLoggedIn();
        const theme = localStorage.getItem('docbook_theme') || 'light';

        let menuLinks = '';
        let userSection = '';

        if (!isLoggedIn) {
            menuLinks = `
                <a class="navbar-link" href="#/" data-nav>Home</a>
                <a class="navbar-link" href="#/patient/login" data-nav>Patient Login</a>
                <a class="navbar-link" href="#/doctor/login" data-nav>Doctor Login</a>
                <a class="navbar-link" href="#/admin/login" data-nav>Admin Login</a>
            `;
        } else if (user.role === 'patient') {
            menuLinks = `
                <a class="navbar-link" href="#/patient/dashboard" data-nav>Dashboard</a>
                <a class="navbar-link" href="#/patient/search-doctors" data-nav>Find Doctors</a>
                <a class="navbar-link" href="#/patient/appointments" data-nav>Appointments</a>
                <a class="navbar-link" href="#/patient/history" data-nav>History</a>
            `;
            userSection = `
                <button class="navbar-notification-btn" onclick="window.location.hash='#/patient/notifications'" id="nav-notification-btn">
                    <i data-lucide="bell" style="width:20px;height:20px"></i>
                    <span class="notification-badge hidden" id="nav-notif-badge">0</span>
                </button>
            `;
        } else if (user.role === 'doctor') {
            menuLinks = `
                <a class="navbar-link" href="#/doctor/dashboard" data-nav>Dashboard</a>
                <a class="navbar-link" href="#/doctor/appointments" data-nav>Appointments</a>
                <a class="navbar-link" href="#/doctor/availability" data-nav>Availability</a>
                <a class="navbar-link" href="#/doctor/earnings" data-nav>Earnings</a>
            `;
            userSection = `
                <button class="navbar-notification-btn" onclick="window.location.hash='#/doctor/notifications'" id="nav-notification-btn">
                    <i data-lucide="bell" style="width:20px;height:20px"></i>
                    <span class="notification-badge hidden" id="nav-notif-badge">0</span>
                </button>
            `;
        } else if (user.role === 'admin') {
            menuLinks = `
                <a class="navbar-link" href="#/admin/dashboard" data-nav>Dashboard</a>
                <a class="navbar-link" href="#/admin/doctors" data-nav>Doctors</a>
                <a class="navbar-link" href="#/admin/patients" data-nav>Patients</a>
                <a class="navbar-link" href="#/admin/appointments" data-nav>Appointments</a>
                <a class="navbar-link" href="#/admin/reports" data-nav>Reports</a>
            `;
            userSection = `
                <button class="navbar-notification-btn" onclick="window.location.hash='#/admin/settings'" id="nav-notification-btn">
                    <i data-lucide="settings" style="width:20px;height:20px"></i>
                </button>
            `;
        }

        if (isLoggedIn) {
            userSection += `
                <button class="navbar-user" onclick="Navbar.toggleUserMenu()">
                    ${Utils.avatarHTML(user.name, user.profile_image)}
                    <div>
                        <div class="navbar-user-name">${user.name}</div>
                        <div class="navbar-user-role">${user.role}</div>
                    </div>
                </button>
            `;
        }

        nav.innerHTML = `
            <div class="navbar">
                <div class="navbar-inner">
                    <a class="navbar-brand" href="#/">
                        <div class="navbar-brand-icon">
                            <i data-lucide="heart-pulse" style="width:22px;height:22px"></i>
                        </div>
                        DocBook
                    </a>
                    <button class="navbar-toggle" onclick="Navbar.toggleMobile()">
                        <i data-lucide="menu" style="width:24px;height:24px"></i>
                    </button>
                    <div class="navbar-menu" id="navbar-menu">
                        ${menuLinks}
                        <button class="theme-toggle" onclick="Navbar.toggleTheme()" title="Toggle theme">
                            <i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}" style="width:18px;height:18px"></i>
                        </button>
                        ${userSection}
                        ${isLoggedIn ? `<button class="navbar-link" onclick="Navbar.handleLogout()" style="color:var(--danger)"><i data-lucide="log-out" style="width:16px;height:16px"></i> Logout</button>` : ''}
                    </div>
                </div>
            </div>
        `;

        if (typeof lucide !== 'undefined') lucide.createIcons();
        this.highlightActive();
        if (isLoggedIn) this.loadNotificationCount();
    },

    highlightActive() {
        const currentHash = window.location.hash || '#/';
        document.querySelectorAll('.navbar-link[data-nav]').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === currentHash);
        });
    },

    toggleMobile() {
        document.getElementById('navbar-menu').classList.toggle('open');
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('docbook_theme', next);
        this.render();
    },

    toggleUserMenu() {
        const user = Auth.getUser();
        if (!user) return;
        const settingsHash = user.role === 'patient' ? '#/patient/settings' :
            user.role === 'doctor' ? '#/doctor/dashboard' : '#/admin/settings';
        window.location.hash = settingsHash;
    },

    handleLogout() {
        Modal.confirm('Logout', 'Are you sure you want to logout?', () => {
            Auth.logout();
            window.location.hash = '#/';
            Navbar.render();
            Toast.show('Logged out successfully', 'success');
        }, 'Logout', 'btn-danger');
    },

    async loadNotificationCount() {
        try {
            const role = Auth.getRole();
            if (!role || role === 'admin') return;
            const data = await API.get(`/${role}/notifications`);
            const badge = document.getElementById('nav-notif-badge');
            if (badge && data.unread_count > 0) {
                badge.textContent = data.unread_count > 9 ? '9+' : data.unread_count;
                badge.classList.remove('hidden');
            }
        } catch (e) { /* silent */ }
    }
};
