/* ===================================
   EXPENSE TRACKER - API Service
   =================================== */

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://mezgeb-v-1-0.onrender.com/api';

// Initialize Dexie (IndexedDB)
const db = new Dexie('MezgebDB');
db.version(2).stores({
    // Use _id as the primary key since it's unique from MongoDB or generated for pending
    expenses: '_id, categoryId, amount, reason, date, status',
    categories: '_id, name, icon'
}).upgrade(tx => {
    // Basic upgrade logic if needed, but version 2 with _id as key is safer
    return tx.expenses.clear();
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

            // Handle empty responses (like 204 No Content)
            if (response.status === 204) return null;

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            // Sync local cache for successful operations
            if (endpoint.startsWith('/expenses')) {
                if (!options.method || options.method === 'GET') {
                    // Cache fetched expenses
                    await db.expenses.where({ status: 'synced' }).delete();
                    await db.expenses.bulkAdd(data.map(e => ({ ...e, status: 'synced' })));
                } else if (options.method === 'PATCH') {
                    // Update local copy
                    await db.expenses.update(data._id, { ...data, status: 'synced' });
                } else if (options.method === 'DELETE') {
                    // Extract ID from endpoint /expenses/:id
                    const id = endpoint.split('/').pop();
                    await db.expenses.delete(id);
                }
            } else if (endpoint.startsWith('/categories')) {
                if (!options.method || options.method === 'GET') {
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
            return [];
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
            this.registerSync();
            return offlineExpense;
        }

        // POST Category
        if (endpoint === '/categories' && options.method === 'POST') {
            const catData = JSON.parse(options.body);
            const offlineCat = {
                ...catData,
                _id: 'pending_cat_' + Date.now(),
                status: 'pending'
            };
            await db.categories.add(offlineCat);
            this.registerSync();
            return offlineCat;
        }

        throw new Error('Offline: This action requires an internet connection.');
    },

    async registerSync() {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            try {
                const reg = await navigator.serviceWorker.ready;
                await reg.sync.register('sync-data');
            } catch (e) {
                console.error('Background sync registration failed:', e);
            }
        }
    },

    // Sync pending data (categories and expenses)
    async syncPendingData() {
        if (!navigator.onLine) return;

        // 1. Sync Categories First
        const pendingCats = await db.categories.where({ status: 'pending' }).toArray();
        for (const cat of pendingCats) {
            try {
                const { _id, status, ...cleanData } = cat;
                const response = await fetch(`${API_BASE_URL}/categories`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(cleanData)
                });

                if (response.ok) {
                    const savedCat = await response.json();
                    await db.categories.delete(cat._id);
                    await db.categories.add(savedCat); // No 'synced' status needed for cats usually, but consistent
                }
            } catch (e) { console.error('Failed to sync category:', cat, e); }
        }

        // 2. Sync Expenses
        const pendingExpenses = await db.expenses.where({ status: 'pending' }).toArray();
        for (const exp of pendingExpenses) {
            try {
                // If category was pending, it might have a temporary ID. 
                // In a real app we'd map temp IDs to real IDs. 
                // For simplicity, we assume user picks existing categories or we'd need complex ID mapping.

                const { _id, status, ...cleanData } = exp;
                const response = await fetch(`${API_BASE_URL}/expenses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(cleanData)
                });

                if (response.ok) {
                    const savedExpense = await response.json();
                    await db.expenses.delete(exp._id); // Delete pending
                    await db.expenses.add({ ...savedExpense, status: 'synced' }); // Add real
                }
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
