/* ═══════════════════════════════════════════════════════════
   Utility Functions
   ═══════════════════════════════════════════════════════════ */

const Utils = {
    // Format date to readable string
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    },

    // Format date for input field (YYYY-MM-DD)
    formatDateInput(dateStr) {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    },

    // Get month/day for badge
    getDateParts(dateStr) {
        const date = new Date(dateStr);
        return {
            month: date.toLocaleString('en-US', { month: 'short' }),
            day: date.getDate(),
            year: date.getFullYear()
        };
    },

    // Time ago
    timeAgo(dateStr) {
        const now = new Date();
        const date = new Date(dateStr);
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return Utils.formatDate(dateStr);
    },

    // Status badge HTML
    statusBadge(status) {
        const map = {
            pending: 'warning',
            confirmed: 'info',
            completed: 'success',
            cancelled: 'danger',
            rescheduled: 'primary'
        };
        return `<span class="badge badge-${map[status] || 'primary'}">${status}</span>`;
    },

    // Generate time slots
    generateTimeSlots(startTime = '09:00', endTime = '17:00', intervalMin = 30) {
        const slots = [];
        let [h, m] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        while (h < endH || (h === endH && m < endM)) {
            const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            m += intervalMin;
            if (m >= 60) { h++; m -= 60; }
            const end = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            slots.push(`${start} - ${end}`);
        }
        return slots;
    },

    // Get initials from name
    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    },

    // Avatar HTML
    avatarHTML(name, image, size = '') {
        if (image) {
            return `<img src="${image}" alt="${name}" class="avatar ${size}">`;
        }
        return `<div class="avatar-placeholder ${size}">${Utils.getInitials(name)}</div>`;
    },

    // Debounce
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    // Validate email
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Validate phone
    validatePhone(phone) {
        return /^[\d\s\-\+\(\)]{7,15}$/.test(phone);
    },

    // Currency format
    formatCurrency(amount) {
        return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    },

    // Escape HTML
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Stars HTML display
    starsHTML(rating, total = 0) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= Math.round(rating) ? '★' : '☆';
        }
        return `<span class="star-display">${stars}${total ? `<span class="rating-text">(${total})</span>` : ''}</span>`;
    }
};
