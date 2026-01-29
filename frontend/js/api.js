/* ===================================
   EXPENSE TRACKER - API Service
   =================================== */

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://mezgeb-v-1-0.onrender.com/api';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    },

    // Auth
    async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data;
    },

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data;
    },

    async getProfile() {
        return this.request('/auth/me');
    },

    async updateSettings(settings) {
        return this.request('/auth/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings)
        });
    },

    // Categories
    async getCategories() {
        return this.request('/categories');
    },

    async createCategory(categoryData) {
        return this.request('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    },

    async updateCategory(id, categoryData) {
        return this.request(`/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(categoryData)
        });
    },

    // Expenses
    async getExpenses(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        return this.request(`/expenses?${query}`);
    },

    async createExpense(expenseData) {
        return this.request('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData)
        });
    },

    async updateExpense(id, expenseData) {
        return this.request(`/expenses/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(expenseData)
        });
    },

    async deleteExpense(id) {
        return this.request(`/expenses/${id}`, {
            method: 'DELETE'
        });
    }
};

window.api = api;
