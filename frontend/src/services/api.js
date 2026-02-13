const API_BASE = 'http://localhost:5000/api';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE;
    }

    getToken() {
        return localStorage.getItem('token');
    }

    getHeaders(isFormData = false) {
        const headers = {};
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const { method = 'GET', body, isFormData = false } = options;

        const config = {
            method,
            headers: this.getHeaders(isFormData),
        };

        if (body) {
            config.body = isFormData ? body : JSON.stringify(body);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('Unable to connect to server. Please check if the backend is running.');
            }
            throw error;
        }
    }

    // GET request
    get(endpoint) {
        return this.request(endpoint);
    }

    // POST request
    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    }

    // PUT request
    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    }

    // DELETE request
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Upload file (FormData)
    upload(endpoint, formData) {
        return this.request(endpoint, { method: 'POST', body: formData, isFormData: true });
    }

    // PUT with file (FormData)
    uploadPut(endpoint, formData) {
        return this.request(endpoint, { method: 'PUT', body: formData, isFormData: true });
    }
}

const api = new ApiClient();
export default api;
