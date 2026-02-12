/* ═══════════════════════════════════════════════════════════
   API Client — Fetch Wrapper with JWT
   ═══════════════════════════════════════════════════════════ */

const API = {
    BASE_URL: '/api',

    async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const token = Auth.getToken();

        const config = {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Token expired or invalid
                    if (response.status === 401) {
                        Auth.logout();
                        Toast.show('Session expired. Please login again.', 'warning');
                        window.location.hash = '#/';
                    }
                }
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                Toast.show('Network error. Please check your connection.', 'error');
            }
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    upload(endpoint, formData, method = 'POST') {
        return this.request(endpoint, {
            method,
            body: formData
        });
    }
};
