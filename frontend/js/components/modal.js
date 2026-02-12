/* ═══════════════════════════════════════════════════════════
   Modal Component
   ═══════════════════════════════════════════════════════════ */

const Modal = {
    show(title, content, buttons = []) {
        const overlay = document.getElementById('modal-overlay');
        const btnHTML = buttons.map(b =>
            `<button class="btn ${b.class || 'btn-primary'}" onclick="${b.onclick}">${b.text}</button>`
        ).join('');

        overlay.innerHTML = `
            <div class="modal animate-scale">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="Modal.hide()">
                        <i data-lucide="x" style="width:18px;height:18px"></i>
                    </button>
                </div>
                <div class="modal-body">${content}</div>
                ${btnHTML ? `<div class="modal-footer">${btnHTML}</div>` : ''}
            </div>
        `;
        overlay.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) Modal.hide();
        });
    },

    confirm(title, message, onConfirm, confirmText = 'Confirm', confirmClass = 'btn-primary') {
        this.show(title, `<p>${message}</p>`, [
            { text: 'Cancel', class: 'btn-ghost', onclick: 'Modal.hide()' },
            { text: confirmText, class: confirmClass, onclick: `Modal.hide(); (${onConfirm.toString()})()` }
        ]);
    },

    hide() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.add('hidden');
        overlay.innerHTML = '';
    }
};
