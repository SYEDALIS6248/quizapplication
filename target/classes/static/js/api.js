/**
 * API Utility & Session Manager
 * Handles all network requests, session persistence, and UI notifications.
 */

const BASE_URL = 'http://localhost:8080/api';

const api = {
    /**
     * Perform a GET request
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`);
            return await this._handleResponse(response);
        } catch (error) {
            this.showToast(error.message, 'error');
            throw error;
        }
    },

    /**
     * Perform a POST request
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await this._handleResponse(response);
        } catch (error) {
            this.showToast(error.message, 'error');
            throw error;
        }
    },

    /**
     * Perform a PUT request
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await this._handleResponse(response);
        } catch (error) {
            this.showToast(error.message, 'error');
            throw error;
        }
    },

    /**
     * Perform a DELETE request
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            return await this._handleResponse(response);
        } catch (error) {
            this.showToast(error.message, 'error');
            throw error;
        }
    },

    /**
     * Internal helper to handle fetch responses and parse errors
     */
    async _handleResponse(response) {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            const errorMsg = (data && data.error) || response.statusText || 'An unexpected error occurred';
            throw new Error(errorMsg);
        }
        return data;
    },

    /**
     * Displays a non-blocking toast notification
     */
    showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 9999;
                display: flex; flex-direction: column; gap: 10px;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
        
        toast.style.cssText = `
            background: ${bgColor}; color: white; padding: 12px 24px;
            border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-size: 0.9rem; animation: slideIn 0.3s ease forwards;
            min-width: 200px; font-weight: 500;
        `;
        toast.innerText = message;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

/**
 * Session Management
 */
const session = {
    setUser(userData) {
        localStorage.setItem('quiz_user', JSON.stringify(userData));
    },
    getUser() {
        const user = localStorage.getItem('quiz_user');
        return user ? JSON.parse(user) : null;
    },
    clear() {
        localStorage.removeItem('quiz_user');
        localStorage.removeItem('active_quiz_id');
        localStorage.removeItem('active_quiz_title');
    }
};

// Add standard animations to the head
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
`;
document.head.appendChild(style);