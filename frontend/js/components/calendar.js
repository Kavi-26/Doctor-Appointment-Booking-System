/* ═══════════════════════════════════════════════════════════
   Calendar Component
   ═══════════════════════════════════════════════════════════ */

const Calendar = {
    create(containerId, options = {}) {
        const { onSelect, blockedDates = [], minDate = new Date() } = options;
        let currentMonth = minDate.getMonth();
        let currentYear = minDate.getFullYear();
        let selectedDate = null;

        function render() {
            const container = document.getElementById(containerId);
            if (!container) return;

            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let daysHTML = dayNames.map(d => `<div class="calendar-day-label">${d}</div>`).join('');

            for (let i = 0; i < firstDay; i++) {
                daysHTML += '<div class="calendar-day empty"></div>';
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentYear, currentMonth, day);
                const dateStr = date.toISOString().split('T')[0];
                const isToday = date.getTime() === today.getTime();
                const isPast = date < today;
                const isBlocked = blockedDates.includes(dateStr);
                const isSelected = selectedDate === dateStr;

                let classes = 'calendar-day';
                if (isToday) classes += ' today';
                if (isPast) classes += ' disabled';
                if (isBlocked) classes += ' blocked';
                if (isSelected) classes += ' selected';

                const clickable = !isPast && !isBlocked;
                daysHTML += `<button class="${classes}" ${clickable ? `onclick="Calendar._select('${containerId}','${dateStr}')"` : 'disabled'}>${day}</button>`;
            }

            container.innerHTML = `
                <div class="calendar">
                    <div class="calendar-header">
                        <button class="btn btn-ghost btn-sm" onclick="Calendar._prev('${containerId}')">
                            <i data-lucide="chevron-left" style="width:16px;height:16px"></i>
                        </button>
                        <h3>${monthNames[currentMonth]} ${currentYear}</h3>
                        <button class="btn btn-ghost btn-sm" onclick="Calendar._next('${containerId}')">
                            <i data-lucide="chevron-right" style="width:16px;height:16px"></i>
                        </button>
                    </div>
                    <div class="calendar-grid">${daysHTML}</div>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // Store instance
        if (!Calendar._instances) Calendar._instances = {};
        Calendar._instances[containerId] = {
            render, currentMonth, currentYear, selectedDate, onSelect, blockedDates, minDate,
            setMonth(m) { currentMonth = m; this.currentMonth = m; },
            setYear(y) { currentYear = y; this.currentYear = y; },
            setSelected(d) { selectedDate = d; this.selectedDate = d; }
        };

        render();
        return Calendar._instances[containerId];
    },

    _prev(id) {
        const inst = this._instances[id];
        let m = inst.currentMonth - 1;
        let y = inst.currentYear;
        if (m < 0) { m = 11; y--; }
        inst.setMonth(m); inst.setYear(y);
        inst.render();
    },

    _next(id) {
        const inst = this._instances[id];
        let m = inst.currentMonth + 1;
        let y = inst.currentYear;
        if (m > 11) { m = 0; y++; }
        inst.setMonth(m); inst.setYear(y);
        inst.render();
    },

    _select(id, dateStr) {
        const inst = this._instances[id];
        inst.setSelected(dateStr);
        inst.render();
        if (inst.onSelect) inst.onSelect(dateStr);
    }
};
