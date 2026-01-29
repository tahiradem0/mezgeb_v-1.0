/* ===================================
   EXPENSE TRACKER - API Service
   =================================== */

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://mezgeb-v-1-0.onrender.com/api';

// Initialize Dexie (IndexedDB)
const db = new Dexie('MezgebDB');
db.version(1).stores({
    expenses: '++id, _id, categoryId, amount, reason, date, status', // status: 'synced' or 'pending'
    categories: '_id, name, icon'
});

const api = {
    db,
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            // If it's a GET request for expenses or categories, cache it
            if (!options.method || options.method === 'GET') {
                if (endpoint.startsWith('/expenses')) {
                    // Only remove synced expenses to keep pending ones
                    await db.expenses.where({ status: 'synced' }).delete();
                    await db.expenses.bulkAdd(data.map(e => ({ ...e, status: 'synced' })));
                } else if (endpoint.startsWith('/categories')) {
                    await db.categories.clear();
                    await db.categories.bulkAdd(data);
                }
            }

            return data;
        } catch (error) {
            // Handle offline fallback
            if (!navigator.onLine || error.name === 'TypeError') {
                return this.handleOfflineRequest(endpoint, options);
            }
            throw error;
        }
    },

    async handleOfflineRequest(endpoint, options) {
        console.log('Handling offline request:', endpoint);

        // GET Expenses
        if (endpoint.startsWith('/expenses') && (!options.method || options.method === 'GET')) {
            return db.expenses.toArray();
        }

        // GET Categories
        if (endpoint.startsWith('/categories') && (!options.method || options.method === 'GET')) {
            const cats = await db.categories.toArray();
            if (cats.length > 0) return cats;
            // Fallback to basic categories if DB is empty
            return window.appData?.categories || [];
        }

        // POST Expense
        if (endpoint === '/expenses' && options.method === 'POST') {
            const expenseData = JSON.parse(options.body);
            const offlineExpense = {
                ...expenseData,
                _id: 'pending_' + Date.now(),
                status: 'pending'
            };
            await db.expenses.add(offlineExpense);

            // Register background sync
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                try {
                    const reg = await navigator.serviceWorker.ready;
                    await reg.sync.register('sync-expenses');
                } catch (e) {
                    console.error('Background sync registration failed:', e);
                }
            }

            return offlineExpense;
        }

        throw new Error('Offline: This action requires an internet connection.');
    },

    // Sync pending expenses
    async syncPendingExpenses() {
        if (!navigator.onLine) return;

        const pending = await db.expenses.where({ status: 'pending' }).toArray();
        if (pending.length === 0) return;

        console.log(`Syncing ${pending.length} pending expenses...`);

        for (const exp of pending) {
            try {
                const { _id, status, id, ...cleanData } = exp;
                await fetch(`${API_BASE_URL}/expenses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(cleanData)
                });
                // Remove from offline DB or mark as synced
                await db.expenses.delete(exp.id);
            } catch (e) {
                console.error('Failed to sync expense:', exp, e);
            }
        }
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
        const data = await this.request('/auth/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings)
        });
        // Update local storage
        localStorage.setItem('currentUser', JSON.stringify(data));
        return data;
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
