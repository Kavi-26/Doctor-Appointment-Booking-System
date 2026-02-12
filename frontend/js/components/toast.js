/* ═══════════════════════════════════════════════════════════
   Toast Notification Component
   ═══════════════════════════════════════════════════════════ */

const Toast = {
    show(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        const icons = {
            success: '<i data-lucide="check-circle"></i>',
            error: '<i data-lucide="x-circle"></i>',
            warning: '<i data-lucide="alert-triangle"></i>',
            info: '<i data-lucide="info"></i>'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i data-lucide="x" style="width:16px;height:16px"></i>
            </button>
        `;

        container.appendChild(toast);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};
