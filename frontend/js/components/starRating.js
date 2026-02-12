/* Star Rating Component */
const StarRating = {
    create(containerId, options = {}) {
        const { initialRating = 0, onRate, readonly = false } = options;
        let rating = initialRating;
        const container = document.getElementById(containerId);
        if (!container) return;

        function render() {
            let html = '<div class="star-rating">';
            for (let i = 1; i <= 5; i++) {
                html += `<span class="star ${i <= rating ? 'filled' : ''}" 
                    ${!readonly ? `onclick="StarRating._rate('${containerId}',${i})" onmouseover="StarRating._hover('${containerId}',${i})" onmouseout="StarRating._reset('${containerId}')"` : ''}>★</span>`;
            }
            html += '</div>';
            container.innerHTML = html;
        }

        if (!StarRating._instances) StarRating._instances = {};
        StarRating._instances[containerId] = { render, rating, onRate, setRating(r) { rating = r; this.rating = r; } };
        render();
    },

    _rate(id, r) {
        const inst = this._instances[id];
        inst.setRating(r); inst.render();
        if (inst.onRate) inst.onRate(r);
    },

    _hover(id, r) {
        document.querySelectorAll(`#${id} .star`).forEach((s, i) => s.classList.toggle('filled', i < r));
    },

    _reset(id) {
        const inst = this._instances[id];
        document.querySelectorAll(`#${id} .star`).forEach((s, i) => s.classList.toggle('filled', i < inst.rating));
    }
};
