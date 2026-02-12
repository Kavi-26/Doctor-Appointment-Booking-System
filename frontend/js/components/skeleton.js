/* Skeleton Loader Component */
const Skeleton = {
    card(count = 3) {
        let html = '<div class="doctors-grid">';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="card" style="padding:var(--space-xl)">
                    <div class="flex gap-md mb-1">
                        <div class="skeleton skeleton-avatar"></div>
                        <div style="flex:1">
                            <div class="skeleton skeleton-text medium"></div>
                            <div class="skeleton skeleton-text short"></div>
                        </div>
                    </div>
                    <div class="skeleton skeleton-text long"></div>
                    <div class="skeleton skeleton-text medium"></div>
                </div>`;
        }
        return html + '</div>';
    },

    list(count = 5) {
        let html = '<div class="appointments-list">';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="card" style="display:flex;gap:var(--space-lg);padding:var(--space-lg)">
                    <div class="skeleton" style="width:64px;height:64px;border-radius:var(--radius-md)"></div>
                    <div style="flex:1">
                        <div class="skeleton skeleton-text medium"></div>
                        <div class="skeleton skeleton-text short"></div>
                        <div class="skeleton skeleton-text long"></div>
                    </div>
                </div>`;
        }
        return html + '</div>';
    },

    stats(count = 4) {
        let html = '<div class="stats-grid">';
        for (let i = 0; i < count; i++) {
            html += '<div class="skeleton skeleton-card"></div>';
        }
        return html + '</div>';
    }
};
