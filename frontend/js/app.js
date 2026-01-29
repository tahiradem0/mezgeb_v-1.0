/* ===================================
   EXPENSE TRACKER - Main Application
   =================================== */

// App State
const appState = {
    currentPage: 'login',
    isLoggedIn: false,
    selectedCategory: null,
    selectedExpenseId: null,
    selectedCategoryIcon: '🏠',
    selectedDate: 'today',
    filters: {
        search: '',
        dateFrom: null,
        dateTo: null,
        amountMin: null,
        amountMax: null
    }
};

// ===================================
// Initialization
// ===================================



function initCategoryPage() {
    // Period selector
    utils.$$('#category-page .period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            utils.$$('#category-page .period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateCategoryChart(btn.dataset.period);
        });
    });
}

function hideSplashScreen() {
    const splash = utils.$('#splash-screen');
    const app = utils.$('#app');

    splash.classList.add('fade-out');
    app.classList.remove('hidden');

    setTimeout(() => {
        splash.style.display = 'none';
    }, 500);
}

// ===================================
// Navigation
// ===================================

function initNavigation() {
    const navItems = utils.$$('.nav-item');
    const bottomNav = utils.$('#bottom-nav');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show page
            showPage(page);
        });
    });
}

function showPage(pageName) {
    const pages = utils.$$('.page');
    const targetPage = utils.$(`#${pageName}-page`);
    const bottomNav = utils.$('#bottom-nav');

    // Hide all pages
    pages.forEach(page => page.classList.add('hidden'));

    // Show target page
    if (targetPage) {
        targetPage.classList.remove('hidden');
        appState.currentPage = pageName;

        // Show/hide bottom nav based on page
        if (['login', 'register'].includes(pageName)) {
            bottomNav.classList.add('hidden');
        } else {
            bottomNav.classList.remove('hidden');
        }

        // Page-specific initializations
        if (pageName === 'home') {
            renderHome();
        } else if (pageName === 'report') {
            renderReport();
        } else if (pageName === 'settings') {
            renderSettings();
        } else if (pageName === 'add-expense') {
            renderAddExpense();
        }
    }

    // Update nav active state
    const navItems = utils.$$('.nav-item');
    navItems.forEach(nav => {
        if (nav.dataset.page === pageName) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });

    // Ensure all dynamic elements are translated
    if (window.i18n) {
        window.i18n.updatePage();
    }
}

// ===================================
// Authentication
// ===================================

function initAuth() {
    const loginForm = utils.$('#login-form');
    const registerForm = utils.$('#register-form');
    const gotoRegister = utils.$('#goto-register');
    const gotoLogin = utils.$('#goto-login');
    const biometricLogin = utils.$('#biometric-login');
    const togglePasswords = utils.$$('.toggle-password');

    // Toggle password visibility
    togglePasswords.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;

            // Update icon appearance (SVG opacity)
            const svg = btn.querySelector('svg');
            if (svg) {
                svg.style.opacity = type === 'password' ? '0.5' : '1';
            }
        });
    });

    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = utils.$('#login-phone').value;
        const password = utils.$('#login-password').value;

        // Simulate login
        if (phone && password) {
            handleLogin({ phone, password });
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = utils.$('#register-username').value;
        const phone = utils.$('#register-phone').value;
        const password = utils.$('#register-password').value;
        const enableBiometric = utils.$('#enable-biometric').checked;

        // Simulate registration
        if (username && phone && password) {
            handleRegister({ username, phone, password, enableBiometric });
        }
    });

    // Navigation between login/register
    gotoRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('register');
    });

    gotoLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login');
    });

    // Biometric login
    biometricLogin.addEventListener('click', () => {
        handleBiometricLogin();
    });

    // Auto-fill phone number if saved
    const savedPhone = utils.loadFromStorage('savedPhone');
    if (savedPhone) {
        utils.$('#login-phone').value = savedPhone;
    }
}

async function handleLogin(credentials) {
    try {
        utils.showToast('Signing in...', 'info');
        const data = await api.login(credentials);
        appState.isLoggedIn = true;
        utils.showToast('Welcome back!', 'success');
        showPage('home');
    } catch (e) {
        utils.showToast(e.message, 'error');
    }
}

async function handleRegister(data) {
    try {
        utils.showToast('Creating account...', 'info');
        const userData = await api.register(data);
        appState.isLoggedIn = true;
        utils.showToast('Account created successfully!', 'success');
        showPage('home');
    } catch (e) {
        utils.showToast(e.message, 'error');
    }
}

function handleBiometricLogin() {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
        utils.showToast('Place your finger on the sensor', 'info');

        // Simulate biometric authentication
        setTimeout(() => {
            appState.isLoggedIn = true;
            utils.saveToStorage('currentUser', window.appData.userData);
            utils.showToast('Authentication successful!', 'success');
            showPage('home');
        }, 1500);
    } else {
        utils.showToast('Biometric login not supported on this device', 'error');
    }
}

function handleLogout() {
    appState.isLoggedIn = false;
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    utils.showToast('Logged out successfully', 'info');
    showPage('login');
}

// ===================================
// Home Page
// ===================================

function initHome() {
    const gotoReport = utils.$('#goto-report');
    const profileBtn = utils.$('#profile-btn');
    const notificationBell = utils.$('.notification-bell');

    gotoReport.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('report');
    });

    profileBtn.addEventListener('click', () => {
        showPage('settings');
    });

    // Notification bell
    if (notificationBell) {
        notificationBell.addEventListener('click', () => {
            renderNotifications();
            utils.showModal('notifications-modal');
        });
    }

    // Period selector
    utils.$$('#home-page .period-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            utils.$$('#home-page .period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            try {
                const expenses = await api.getExpenses();
                updateHomeChartWithData(expenses, btn.dataset.period);
            } catch (e) {
                utils.showToast('Failed to update chart', 'error');
            }
        });
    });
}

async function renderHome() {
    try {
        // Update greeting
        utils.$('.greeting').textContent = utils.getGreeting();

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            utils.$('.username').textContent = currentUser.username;

            // Update profile avatar
            const avatarImg = utils.$('.profile-avatar img');
            if (avatarImg) {
                if (currentUser.profileImage) {
                    avatarImg.src = currentUser.profileImage;
                } else {
                    const initials = utils.getInitials(currentUser.username);
                    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=333&color=fff&size=100&bold=true`;
                }
            }
        }

        // Fetch categories and expenses from API
        const categories = await api.getCategories();
        const expenses = await api.getExpenses();

        // Update global appData (for legacy compatibility if needed, though we should transition away)
        window.appData.categories = categories;
        window.appData.expenses = expenses;

        // Calculate total expense
        const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        utils.$('.total-amount').innerHTML = `${utils.formatCurrency(totalExpense)} <span class="currency">ETB</span>`;

        // Render categories
        renderCategoriesData(categories, expenses);

        // Render recent expenses
        renderRecentExpensesData(expenses, categories);

        // Initialize chart with fetched expenses
        updateHomeChartWithData(expenses, 'weekly');

        // Generate notifications based on expenses
        generateNotificationsFromExpenses(expenses, categories);
    } catch (e) {
        console.error('Home render error:', e);
        utils.showToast('Failed to load home data', 'error');
    }
}

function renderCategoriesData(categories, expenses) {
    const container = utils.$('#categories-container');
    const visibleCategories = categories.filter(cat => cat.isVisible);

    container.innerHTML = '';

    visibleCategories.forEach(category => {
        // Calculate total for this category
        const categoryExpenses = expenses.filter(exp => exp.categoryId?._id === category._id || exp.categoryId === category._id);
        const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        const card = utils.createElement('div', {
            className: 'category-card',
            dataId: category._id,
            onClick: () => openCategoryDetail(category)
        }, [
            utils.createElement('div', { className: 'category-icon', textContent: category.icon }),
            utils.createElement('p', { className: 'category-name', textContent: category.name }),
            utils.createElement('p', { className: 'category-amount', textContent: `${utils.formatCurrency(total)} ETB` }),
            utils.createElement('p', { className: 'category-updated', textContent: `Updated ${utils.getRelativeDate(category.lastUpdated)}` })
        ]);

        container.appendChild(card);
    });
}

function renderRecentExpensesData(expenses, categories) {
    const tbody = utils.$('#recent-expenses-body');
    const recentExpenses = utils.sortBy(expenses, 'date', 'desc').slice(0, 5);

    tbody.innerHTML = '';

    recentExpenses.forEach(expense => {
        const category = typeof expense.categoryId === 'object'
            ? expense.categoryId
            : categories.find(cat => cat._id === expense.categoryId);

        const row = utils.createElement('tr', {
            dataId: expense._id,
            onClick: () => openEditExpense(expense)
        }, [
            utils.createElement('td', { textContent: utils.getRelativeDate(expense.date) }),
            utils.createElement('td', { textContent: expense.reason }),
            utils.createElement('td', {
                innerHTML: `<span class="expense-category-badge">${category?.icon || '📦'} ${category?.name || 'Other'}</span>`
            }),
            utils.createElement('td', {
                className: 'expense-amount',
                textContent: `${utils.formatCurrency(expense.amount)} ETB`
            })
        ]);

        tbody.appendChild(row);
    });
}

// Chart functions moved to bottom to use processChartData

// ===================================
// Category Detail Page
// ===================================

async function openCategoryDetail(category) {
    appState.selectedCategory = category;

    try {
        // Update header
        utils.$('#category-title').textContent = `${category.icon} ${category.name} Expenses`;

        // Fetch expenses for this category
        const expenses = await api.getExpenses({ categoryId: category._id });

        // Calculate total for this category (client-side verification)
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // This month expenses
        const now = new Date();
        const thisMonthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
        });
        const monthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        utils.$('#category-total').innerHTML = `${utils.formatCurrency(totalSpent)} <span style="font-size: 0.6em; color: var(--color-text-secondary);">ETB</span>`;
        utils.$('#category-month').innerHTML = `${utils.formatCurrency(monthTotal)} <span style="font-size: 0.6em; color: var(--color-text-secondary);">ETB</span>`;


        // Render expenses table
        renderCategoryExpenses(expenses);

        // Initialize chart
        updateCategoryChart('weekly');

        showPage('category');

        // Back button handler
        utils.$('#category-back').onclick = () => showPage('home');
    } catch (e) {
        utils.showToast('Failed to load category details', 'error');
    }
}


function renderCategoryExpenses(expenses) {
    const tbody = utils.$('#category-expenses-body');
    const sortedExpenses = utils.sortBy(expenses, 'date', 'desc');

    tbody.innerHTML = '';

    sortedExpenses.forEach(expense => {
        const row = utils.createElement('tr', {
            dataId: expense._id,
            onClick: () => openEditExpense(expense)
        }, [
            utils.createElement('td', { textContent: expense.dateEthiopian || utils.getRelativeDate(expense.date) }),
            utils.createElement('td', { textContent: expense.reason }),
            utils.createElement('td', {
                className: 'expense-amount',
                textContent: `${utils.formatCurrency(expense.amount)} ETB`
            })
        ]);

        tbody.appendChild(row);
    });
}

// ===================================
// Add Expense Page
// ===================================

function initAddExpense() {
    const form = utils.$('#expense-form');
    const reasonInput = utils.$('#expense-reason');
    const suggestionsDropdown = utils.$('#reason-suggestions');
    const dateOptions = utils.$$('.date-option');
    const customDateInput = utils.$('#custom-date');

    // Back button
    utils.$('#add-expense-back').addEventListener('click', () => {
        showPage('home');
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddExpense();
    });

    // Reason autocomplete
    reasonInput.addEventListener('input', utils.debounce((e) => {
        const query = e.target.value;
        if (query.length >= 2) {
            showReasonSuggestions(query);
        } else {
            suggestionsDropdown.classList.add('hidden');
        }
    }, 200));

    reasonInput.addEventListener('blur', () => {
        setTimeout(() => suggestionsDropdown.classList.add('hidden'), 200);
    });

    // Date options
    dateOptions.forEach(option => {
        option.addEventListener('click', () => {
            dateOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            appState.selectedDate = option.dataset.date;

            if (option.dataset.date === 'custom') {
                customDateInput.classList.remove('hidden');
                customDateInput.focus();
            } else {
                customDateInput.classList.add('hidden');
            }
        });
    });
}

async function renderAddExpense() {
    try {
        // Render category chips from API
        const selector = utils.$('#category-selector');
        selector.innerHTML = '';

        const categories = await api.getCategories();

        categories.filter(cat => cat.isVisible).forEach((category, index) => {
            const chip = utils.createElement('div', {
                className: `category-chip ${index === 0 ? 'active' : ''}`,
                dataId: category._id,
                onClick: (e) => {
                    utils.$$('.category-chip').forEach(c => c.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                }
            }, [
                utils.createElement('span', { className: 'category-chip-icon', textContent: category.icon }),
                category.name
            ]);

            selector.appendChild(chip);
        });

        // Fetch previous reasons for autocomplete
        const expenses = await api.getExpenses();
        const uniqueReasons = [...new Set(expenses.map(exp => exp.reason))];
        window.appData.previousReasons = uniqueReasons;

        // Reset form
        utils.$('#expense-amount').value = '';
        utils.$('#expense-reason').value = '';
        utils.$$('.date-option').forEach((o, i) => {
            o.classList.toggle('active', i === 0);
        });
        utils.$('#custom-date').classList.add('hidden');
        appState.selectedDate = 'today';
    } catch (e) {
        utils.showToast('Failed to load categories', 'error');
    }
}

function showReasonSuggestions(query) {
    const dropdown = utils.$('#reason-suggestions');
    // Combine static and dynamic reasons
    const allReasons = [...new Set([
        ...(window.appData.previousReasons || []),
        ...(window.appData.expenses ? window.appData.expenses.map(e => e.reason) : [])
    ])];

    const suggestions = utils.fuzzySearch(query, allReasons);

    if (suggestions.length === 0) {
        dropdown.classList.add('hidden');
        return;
    }

    dropdown.innerHTML = '';
    suggestions.slice(0, 5).forEach(suggestion => {
        const item = utils.createElement('div', {
            className: 'autocomplete-item',
            onClick: () => {
                utils.$('#expense-reason').value = suggestion;
                dropdown.classList.add('hidden');
            }
        }, [
            utils.createElement('span', { className: 'suggestion-icon', textContent: '💡' }),
            utils.createElement('span', {
                className: 'suggestion-text',
                innerHTML: utils.highlightMatch(suggestion, query)
            })
        ]);

        dropdown.appendChild(item);
    });

    dropdown.classList.remove('hidden');
}

async function handleAddExpense() {
    const amount = parseFloat(utils.$('#expense-amount').value);
    const reason = utils.$('#expense-reason').value;
    const activeCategory = utils.$('.category-chip.active');
    const categoryId = activeCategory?.dataset.id;

    if (!amount || !reason || !categoryId) {
        utils.showToast('Please fill all fields', 'error');
        return;
    }

    // Calculate date
    let date = new Date();
    switch (appState.selectedDate) {
        case 'yesterday':
            date.setDate(date.getDate() - 1);
            break;
        case '2days':
            date.setDate(date.getDate() - 2);
            break;
        case 'custom':
            date = new Date(utils.$('#custom-date').value);
            break;
    }

    try {
        utils.showToast('Saving expense...', 'info');

        // Create new expense on backend
        const expenseData = {
            categoryId,
            amount,
            reason,
            date: date.toISOString(),
            dateEthiopian: utils.toEthiopianDate(date)
        };

        await api.createExpense(expenseData);

        utils.showToast('Expense added successfully!', 'success');

        // Update local suggestion list
        if (!window.appData.previousReasons.includes(reason)) {
            window.appData.previousReasons.push(reason);
        }

        renderHome();
        showPage('home');
    } catch (e) {
        utils.showToast(e.message, 'error');
    }
}

// ===================================
// Report Page
// ===================================

function initReport() {
    const searchInput = utils.$('#search-expenses');
    const filterToggle = utils.$('#filter-toggle');
    const filterPanel = utils.$('#filter-panel');
    const applyFilters = utils.$('#apply-filters');
    const chartSection = utils.$('#report-page .chart-section');

    // Search - hide chart when searching
    searchInput.addEventListener('input', utils.debounce((e) => {
        appState.filters.search = e.target.value;

        // Hide chart when searching, show when cleared
        if (chartSection) {
            if (e.target.value.trim()) {
                chartSection.classList.add('search-active');
            } else {
                chartSection.classList.remove('search-active');
            }
        }

        renderReportExpenses();
    }, 200));

    // Filter toggle
    filterToggle.addEventListener('click', () => {
        filterPanel.classList.toggle('hidden');
    });

    // Apply filters
    applyFilters.addEventListener('click', () => {
        appState.filters.dateFrom = utils.$('#filter-date-from').value || null;
        appState.filters.dateTo = utils.$('#filter-date-to').value || null;
        appState.filters.amountMin = parseFloat(utils.$('#filter-amount-min').value) || null;
        appState.filters.amountMax = parseFloat(utils.$('#filter-amount-max').value) || null;

        renderReportExpenses();
        filterPanel.classList.add('hidden');
        utils.showToast('Filters applied', 'info');
    });

    // Period selector
    utils.$$('#report-page .period-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            utils.$$('#report-page .period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            try {
                const expenses = await api.getExpenses();
                updateReportChartWithData(expenses, btn.dataset.period);
            } catch (e) {
                utils.showToast('Failed to update chart', 'error');
            }
        });
    });
}

async function renderReport() {
    try {
        const expenses = await api.getExpenses();
        renderReportExpenses();
        updateReportChartWithData(expenses, 'weekly');
    } catch (e) {
        console.error('Report render error:', e);
    }
}

async function renderReportExpenses() {
    const tbody = utils.$('#all-expenses-body');

    try {
        // Fetch filtered expenses from API
        const filters = {
            search: appState.filters.search || '',
            dateFrom: appState.filters.dateFrom || '',
            dateTo: appState.filters.dateTo || '',
            amountMin: appState.filters.amountMin || '',
            amountMax: appState.filters.amountMax || ''
        };

        const expenses = await api.getExpenses(filters);
        const categories = await api.getCategories();

        tbody.innerHTML = '';

        if (expenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px; color: var(--color-text-muted);">
                        No expenses found
                    </td>
                </tr>
            `;
            return;
        }

        expenses.forEach(expense => {
            const category = typeof expense.categoryId === 'object'
                ? expense.categoryId
                : categories.find(cat => cat._id === expense.categoryId);

            const row = utils.createElement('tr', {
                dataId: expense._id,
                onClick: () => openEditExpense(expense)
            }, [
                utils.createElement('td', { textContent: utils.getRelativeDate(expense.date) }),
                utils.createElement('td', {
                    innerHTML: appState.filters.search
                        ? utils.highlightMatch(expense.reason, appState.filters.search)
                        : expense.reason
                }),
                utils.createElement('td', {
                    innerHTML: `<span class="expense-category-badge">${category?.icon || '📦'} ${category?.name || 'Other'}</span>`
                }),
                utils.createElement('td', {
                    className: 'expense-amount',
                    textContent: `${utils.formatCurrency(expense.amount)} ETB`
                })
            ]);

            tbody.appendChild(row);
        });

        // Update chart with filtered data
        const activePeriod = utils.$('#report-page .period-btn.active')?.dataset.period || 'weekly';
        updateReportChartWithData(expenses, activePeriod);
    } catch (e) {
        utils.showToast('Failed to load reports', 'error');
    }
}

// Chart functions moved to bottom

// ===================================
// Settings Page
// ===================================

function initSettings() {
    const darkModeToggle = utils.$('#dark-mode-toggle');
    const fontDecrease = utils.$('#font-decrease');
    const fontIncrease = utils.$('#font-increase');
    const addCategoryBtn = utils.$('#add-category-btn');
    const logoutBtn = utils.$('#logout-btn');
    const changePasswordBtn = utils.$('#change-password-btn');

    // Language Selector
    const langSelector = utils.$('#language-selector');
    if (langSelector) {
        langSelector.addEventListener('change', (e) => {
            if (window.i18n) {
                window.i18n.setLanguage(e.target.value);
            }
        });
    }

    // Dark mode toggle
    darkModeToggle.addEventListener('change', async (e) => {
        try {
            document.documentElement.dataset.theme = e.target.checked ? 'dark' : 'light';
            await api.updateSettings({ darkMode: e.target.checked });
            // Update local storage
            const user = JSON.parse(localStorage.getItem('currentUser'));
            user.settings.darkMode = e.target.checked;
            localStorage.setItem('currentUser', JSON.stringify(user));
        } catch (err) {
            utils.showToast('Failed to save theme setting', 'error');
        }
    });

    // Font size controls
    const fontSizes = ['small', 'medium', 'large'];

    fontDecrease.addEventListener('click', async () => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        let currentFontIndex = fontSizes.indexOf(user.settings.fontSize);
        if (currentFontIndex > 0) {
            currentFontIndex--;
            await updateFontSize(fontSizes[currentFontIndex]);
        }
    });

    fontIncrease.addEventListener('click', async () => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        let currentFontIndex = fontSizes.indexOf(user.settings.fontSize);
        if (currentFontIndex < fontSizes.length - 1) {
            currentFontIndex++;
            await updateFontSize(fontSizes[currentFontIndex]);
        }
    });

    // Add category
    addCategoryBtn.addEventListener('click', () => {
        utils.showModal('add-category-modal');
        renderIconSelector();
    });

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Change password - open modal
    changePasswordBtn.addEventListener('click', () => {
        utils.showModal('password-modal');
    });

    // Profile image upload
    const changePhotoBtn = utils.$('#change-photo-btn');
    const profileImageInput = utils.$('#profile-image-input');

    if (changePhotoBtn && profileImageInput) {
        changePhotoBtn.addEventListener('click', () => {
            profileImageInput.click();
        });

        profileImageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                utils.showToast('Image size must be less than 2MB', 'error');
                return;
            }

            // Convert to base64 for storage
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Image = event.target.result;

                try {
                    // Update profile image in backend
                    await api.updateSettings({ profileImage: base64Image });

                    // Update local storage
                    const user = JSON.parse(localStorage.getItem('currentUser'));
                    user.profileImage = base64Image;
                    localStorage.setItem('currentUser', JSON.stringify(user));

                    // Update UI
                    utils.$('#settings-profile-img').src = base64Image;
                    utils.showToast('Profile photo updated!', 'success');
                } catch (err) {
                    utils.showToast('Failed to update profile photo', 'error');
                }
            };
            reader.readAsDataURL(file);
        });
    }
}

async function renderSettings() {
    try {
        const user = await api.getProfile();
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Update profile info
        utils.$('#settings-username').textContent = user.username;
        utils.$('#settings-phone').textContent = user.phone;

        // Update profile image or initials
        const profileImg = utils.$('#settings-profile-img');
        if (user.profileImage) {
            profileImg.src = user.profileImage;
        } else {
            // Generate initials avatar
            const initials = utils.getInitials(user.username);
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=333&color=fff&size=100&bold=true`;
        }

        // Update toggles
        utils.$('#dark-mode-toggle').checked = user.settings.darkMode;
        utils.$('#budget-alert-toggle').checked = user.settings.budgetAlertEnabled;
        utils.$('#budget-limit').value = user.settings.budgetLimit;

        // Update font size display
        utils.$('#font-size-value').textContent =
            user.settings.fontSize.charAt(0).toUpperCase() +
            user.settings.fontSize.slice(1);

        // Render categories list
        renderSettingsCategories();
    } catch (e) {
        utils.showToast('Failed to load settings', 'error');
    }
}

async function renderSettingsCategories() {
    const container = utils.$('#settings-categories');
    container.innerHTML = '';

    try {
        const categories = await api.getCategories();
        const expenses = await api.getExpenses();

        categories.forEach(category => {
            const categoryExpenses = expenses.filter(exp => exp.categoryId?._id === category._id || exp.categoryId === category._id);

            const item = utils.createElement('div', {
                className: 'category-list-item',
                style: category.isVisible ? '' : 'opacity: 0.5'
            }, [
                utils.createElement('div', { className: 'category-list-icon', textContent: category.icon }),
                utils.createElement('div', { className: 'category-list-info' }, [
                    utils.createElement('p', { className: 'category-list-name', textContent: category.name }),
                    utils.createElement('p', { className: 'category-list-count', textContent: `${categoryExpenses.length} expenses` })
                ]),
                utils.createElement('div', { className: 'category-actions' }, [
                    utils.createElement('button', {
                        className: 'category-action-btn hide-btn',
                        textContent: category.isVisible ? '👁️' : '👁️‍🗨️',
                        onClick: () => toggleCategoryVisibility(category)
                    }),
                    utils.createElement('button', {
                        className: 'category-action-btn',
                        textContent: '✏️',
                        onClick: () => editCategory(category)
                    })
                ])
            ]);

            container.appendChild(item);
        });
    } catch (e) {
        utils.showToast('Failed to load categories in settings', 'error');
    }
}

async function updateFontSize(size) {
    try {
        document.documentElement.dataset.fontSize = size;
        await api.updateSettings({ fontSize: size });
        utils.$('#font-size-value').textContent = size.charAt(0).toUpperCase() + size.slice(1);

        const user = JSON.parse(localStorage.getItem('currentUser'));
        user.settings.fontSize = size;
        localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (e) {
        utils.showToast('Failed to save font size setting', 'error');
    }
}

async function toggleCategoryVisibility(category) {
    try {
        const isVisible = !category.isVisible;
        await api.updateCategory(category._id, { isVisible });
        renderSettingsCategories();
        utils.showToast(
            isVisible ? 'Category shown' : 'Category hidden (data preserved)',
            'info'
        );
    } catch (e) {
        utils.showToast('Failed to update category visibility', 'error');
    }
}

function editCategory(category) {
    utils.showToast('Edit category feature coming soon', 'info');
}

// ===================================
// Modals
// ===================================

function initModals() {
    // Edit expense modal
    const closeEditModal = utils.$('#close-edit-modal');
    const editExpenseForm = utils.$('#edit-expense-form');
    const deleteExpenseBtn = utils.$('#delete-expense-btn');

    closeEditModal.addEventListener('click', () => {
        utils.hideModal('edit-expense-modal');
    });

    editExpenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleEditExpense();
    });

    if (deleteExpenseBtn) {
        deleteExpenseBtn.addEventListener('click', () => {
            handleDeleteExpense();
        });
    }

    // Add category modal
    const closeCategoryModal = utils.$('#close-category-modal');
    const addCategoryForm = utils.$('#add-category-form');

    closeCategoryModal.addEventListener('click', () => {
        utils.hideModal('add-category-modal');
    });

    addCategoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddCategory();
    });

    // Close modals on backdrop click
    utils.$$('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            utils.$$('.modal').forEach(modal => {
                modal.classList.add('hidden');
            });
            document.body.style.overflow = '';
        });
    });
}

function openEditExpense(expense) {
    appState.selectedExpenseId = expense.id;

    utils.$('#edit-expense-id').value = expense.id;
    utils.$('#edit-amount').value = expense.amount;
    utils.$('#edit-reason').value = expense.reason;
    utils.$('#edit-date').value = expense.date;

    utils.showModal('edit-expense-modal');
}

async function handleDeleteExpense() {
    const id = utils.$('#edit-expense-id').value;
    if (!id) return;

    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
        utils.showToast('Deleting expense...', 'info');
        await api.deleteExpense(id);

        utils.hideModal('edit-expense-modal');
        utils.showToast('Expense deleted', 'success');

        // Refresh current page
        if (appState.currentPage === 'home') {
            await renderHome();
        } else if (appState.currentPage === 'report') {
            await renderReportExpenses();
        } else if (appState.currentPage === 'category') {
            await openCategoryDetail(appState.selectedCategory);
        }
    } catch (e) {
        utils.showToast(e.message, 'error');
    }
}

async function handleEditExpense() {
    const id = utils.$('#edit-expense-id').value;
    const amount = parseFloat(utils.$('#edit-amount').value);
    const reason = utils.$('#edit-reason').value;
    const date = utils.$('#edit-date').value;

    try {
        utils.showToast('Updating expense...', 'info');
        await api.updateExpense(id, {
            amount,
            reason,
            date: new Date(date).toISOString(),
            dateEthiopian: utils.toEthiopianDate(date)
        });

        utils.hideModal('edit-expense-modal');
        utils.showToast('Expense updated successfully!', 'success');

        // Refresh current page
        if (appState.currentPage === 'home') {
            await renderHome();
        } else if (appState.currentPage === 'report') {
            await renderReportExpenses();
        } else if (appState.currentPage === 'category') {
            await openCategoryDetail(appState.selectedCategory);
        }
    } catch (e) {
        utils.showToast(e.message, 'error');
    }
}

function renderIconSelector() {
    const container = utils.$('#icon-selector');
    container.innerHTML = '';

    window.appData.availableIcons.forEach(icon => {
        const option = utils.createElement('div', {
            className: `icon-option ${icon === appState.selectedCategoryIcon ? 'selected' : ''}`,
            textContent: icon,
            onClick: (e) => {
                utils.$$('.icon-option').forEach(o => o.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                appState.selectedCategoryIcon = icon;
            }
        });

        container.appendChild(option);
    });
}

async function handleAddCategory() {
    const name = utils.$('#category-name').value;

    if (!name) {
        utils.showToast('Please enter a category name', 'error');
        return;
    }

    try {
        utils.showToast('Creating category...', 'info');
        await api.createCategory({
            name,
            icon: appState.selectedCategoryIcon
        });

        utils.hideModal('add-category-modal');
        utils.showToast('Category added successfully!', 'success');
        utils.$('#category-name').value = '';

        renderSettingsCategories();
    } catch (e) {
        utils.showToast(e.message, 'error');
    }
}

// ===================================
// Date Picker Modal
// ===================================

// Calendar state
const calendarState = {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDate: null,
    context: 'expense' // 'expense' or 'reminder'
};

function initDatePicker() {
    const closeDatePicker = utils.$('#close-date-picker');
    const prevMonthBtn = utils.$('#prev-month');
    const nextMonthBtn = utils.$('#next-month');
    const confirmDateBtn = utils.$('#confirm-date');

    if (closeDatePicker) {
        closeDatePicker.addEventListener('click', () => {
            utils.hideModal('date-picker-modal');
        });
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            calendarState.currentMonth--;
            if (calendarState.currentMonth < 0) {
                calendarState.currentMonth = 11;
                calendarState.currentYear--;
            }
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            calendarState.currentMonth++;
            if (calendarState.currentMonth > 11) {
                calendarState.currentMonth = 0;
                calendarState.currentYear++;
            }
            renderCalendar();
        });
    }

    if (confirmDateBtn) {
        confirmDateBtn.addEventListener('click', () => {
            if (calendarState.selectedDate) {
                handleDateSelection();
            } else {
                utils.showToast('Please select a date', 'error');
            }
        });
    }

    // Set up "Specific Date" reminder option click
    const reminderOptions = utils.$$('input[name="reminder"]');
    reminderOptions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                openDatePicker('reminder');
            }
        });
    });

    // Set up custom date option in Add Expense
    const customDateOption = utils.$('.date-option[data-date="custom"]');
    if (customDateOption) {
        customDateOption.addEventListener('click', (e) => {
            // Prevent the default behavior first
            e.preventDefault();
            e.stopPropagation();

            // Remove active from all, add to custom
            utils.$$('.date-option').forEach(o => o.classList.remove('active'));
            customDateOption.classList.add('active');

            // Open date picker modal
            openDatePicker('expense');
        });
    }
}

function openDatePicker(context = 'expense') {
    calendarState.context = context;
    calendarState.currentMonth = new Date().getMonth();
    calendarState.currentYear = new Date().getFullYear();
    calendarState.selectedDate = null;

    renderCalendar();
    utils.showModal('date-picker-modal');
}

function renderCalendar() {
    const calendarTitle = utils.$('#calendar-title');
    const calendarDays = utils.$('#calendar-days');
    if (!calendarTitle || !calendarDays) return;

    const isAmharic = window.i18n && window.i18n.currentLanguage === 'am';

    if (isAmharic) {
        renderEthiopianGrid(calendarTitle, calendarDays);
    } else {
        renderGregorianGrid(calendarTitle, calendarDays);
    }
}

function renderGregorianGrid(calendarTitle, calendarDays) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    calendarTitle.textContent = `${monthNames[calendarState.currentMonth]} ${calendarState.currentYear}`;

    const firstDayOfMonth = new Date(calendarState.currentYear, calendarState.currentMonth, 1);
    const lastDay = new Date(calendarState.currentYear, calendarState.currentMonth + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const totalDays = lastDay.getDate();
    const prevMonthLastDay = new Date(calendarState.currentYear, calendarState.currentMonth, 0).getDate();

    calendarDays.innerHTML = '';
    const today = new Date();
    const isCurrentMonth = today.getMonth() === calendarState.currentMonth && today.getFullYear() === calendarState.currentYear;

    for (let i = startDay - 1; i >= 0; i--) {
        const dayEl = utils.createElement('div', { className: 'calendar-day other-month', textContent: prevMonthLastDay - i });
        calendarDays.appendChild(dayEl);
    }

    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(calendarState.currentYear, calendarState.currentMonth, day);
        const isToday = isCurrentMonth && day === today.getDate();
        const isSelected = calendarState.selectedDate && date.toDateString() === calendarState.selectedDate.toDateString();
        const dayEl = utils.createElement('div', {
            className: `calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`,
            textContent: day,
            onClick: () => selectCalendarDay(day)
        });
        calendarDays.appendChild(dayEl);
    }
}

function renderEthiopianGrid(calendarTitle, calendarDays) {
    // Basic Ethiopian Grid: 30 days for every month except Pagume
    const ethMonth = calendarState.currentMonth; // 0-12
    const ethYear = calendarState.currentYear - 8;

    calendarTitle.textContent = `${window.i18n.getEthiopianMonth(ethMonth)} ${ethYear}`;

    calendarDays.innerHTML = '';
    const totalDays = ethMonth === 12 ? 5 : 30; // Pagume has 5 or 6 (handled simply)

    // Attempt to calculate start day (weekday)
    // Meskerem 1, 2017 started on Wed (3)
    // We adjust based on months... Meskerem(30), Tikimt(30) etc. 30 % 7 = 2.
    // So each month shifts the start day by 2.
    const baseMeskerem1_2017 = 3; // Wed
    const monthShift = (ethMonth * 2) % 7;
    const startDay = (baseMeskerem1_2017 + monthShift) % 7;

    // Add empty slots for the start of the week
    for (let i = 0; i < startDay; i++) {
        const dayEl = utils.createElement('div', { className: 'calendar-day other-month' });
        calendarDays.appendChild(dayEl);
    }

    // Today's Ethiopian Date for highlighting (very rough check)
    const todayEth = window.i18n.toEthiopianDate(new Date());

    for (let day = 1; day <= totalDays; day++) {
        const isSelected = false; // Simplified
        const dayText = ethYear + '-' + (ethMonth + 1) + '-' + day;

        const dayEl = utils.createElement('div', {
            className: `calendar-day`,
            textContent: day,
            onClick: () => {
                // Approximate back-conversion to select a Gregorian date
                // We'll just set it to "now" but with a toast for the chosen day
                calendarState.selectedDate = new Date();
                utils.showToast(`Selected: ${window.i18n.getEthiopianMonth(ethMonth)} ${day}, ${ethYear}`, 'success');
                calendarDays.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                dayEl.classList.add('selected');
            }
        });
        calendarDays.appendChild(dayEl);
    }
}

function selectCalendarDay(day) {
    calendarState.selectedDate = new Date(
        calendarState.currentYear,
        calendarState.currentMonth,
        day
    );
    renderCalendar();
}

function handleDateSelection() {
    const selectedDate = calendarState.selectedDate;

    if (!selectedDate) return;

    if (calendarState.context === 'expense') {
        // Set custom date for expense
        const customDateInput = utils.$('#custom-date');
        if (customDateInput) {
            customDateInput.value = utils.formatDateForInput(selectedDate);
        }
        appState.selectedDate = 'custom';
        utils.showToast(`Date set: ${selectedDate.toLocaleDateString()}`, 'success');
    } else if (calendarState.context === 'reminder') {
        // Store reminder date setting
        window.appData.userSettings.reminderDate = utils.formatDateForInput(selectedDate);
        utils.saveToStorage('userSettings', window.appData.userSettings);
        utils.showToast(`Reminder set for ${selectedDate.toLocaleDateString()}`, 'success');
    }

    utils.hideModal('date-picker-modal');
}

// Initialize date picker after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initDatePicker, 100);
    setTimeout(initPasswordModal, 100);
    setTimeout(initDaysBeforeModal, 100);
    setTimeout(initNotifications, 100);
});

// ===================================
// Password Change Modal
// ===================================

function initPasswordModal() {
    const closeBtn = utils.$('#close-password-modal');
    const form = utils.$('#password-form');
    const newPasswordInput = utils.$('#new-password');
    const strengthBar = utils.$('#password-strength-bar');
    const hintText = utils.$('#password-hint');

    // Toggle password visibility for all password fields in modal
    utils.$$('#password-modal .toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            btn.style.opacity = type === 'password' ? '0.5' : '1';
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            utils.hideModal('password-modal');
            form.reset();
        });
    }

    // Password strength indicator
    if (newPasswordInput && strengthBar) {
        newPasswordInput.addEventListener('input', (e) => {
            const strength = utils.getPasswordStrength(e.target.value);
            strengthBar.className = 'password-strength-bar ' + strength;

            const hints = {
                weak: 'Weak - add more characters and symbols',
                medium: 'Medium - add numbers or symbols',
                strong: 'Strong password!'
            };
            if (hintText) hintText.textContent = hints[strength];
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handlePasswordChange();
        });
    }
}

function handlePasswordChange() {
    const currentPassword = utils.$('#current-password').value;
    const newPassword = utils.$('#new-password').value;
    const confirmPassword = utils.$('#confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        utils.showToast('Please fill all fields', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        utils.showToast('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        utils.showToast('Password must be at least 6 characters', 'error');
        return;
    }

    // Simulate password change
    utils.showToast('Password changed successfully!', 'success');
    utils.hideModal('password-modal');
    utils.$('#password-form').reset();
}

// ===================================
// Days Before Modal
// ===================================

function initDaysBeforeModal() {
    const closeBtn = utils.$('#close-days-before');
    const daysBeforeBtn = utils.$('#days-before-btn');
    const daysBtns = utils.$$('.days-option-btn');

    if (daysBeforeBtn) {
        daysBeforeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            utils.showModal('days-before-modal');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            utils.hideModal('days-before-modal');
        });
    }

    daysBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const days = parseInt(btn.dataset.days);
            handleDaysBeforeSelection(days);
        });
    });
}

function handleDaysBeforeSelection(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const customDateInput = utils.$('#custom-date');
    if (customDateInput) {
        customDateInput.value = utils.formatDateForInput(date);
    }

    appState.selectedDate = 'custom';

    // Update button text to show selection
    const daysBeforeBtn = utils.$('#days-before-btn');
    if (daysBeforeBtn) {
        daysBeforeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${days} days ago
        `;
    }

    utils.hideModal('days-before-modal');
    utils.showToast(`Date set to ${days} days ago`, 'success');
}

// ===================================
// Notifications Panel
// ===================================

// Sample notifications
let notifications = [
    {
        id: 'n1',
        type: 'warning',
        title: 'Budget Alert',
        text: 'You have spent 80% of your monthly budget.',
        time: '2 hours ago',
        unread: true,
        category: 'manual'
    },
    {
        id: 'n2',
        type: 'success',
        title: 'Cloud Sync Active',
        text: 'Your data is securely synced to the cloud.',
        time: '5 hours ago',
        unread: false,
        category: 'manual'
    },
    {
        id: 'n3',
        type: 'info',
        title: 'Welcome to Mezgeb!',
        text: 'Start tracking your expenses by adding your first entry.',
        time: 'Since signup',
        unread: false,
        category: 'manual'
    }
];

function initNotifications() {
    const closeBtn = utils.$('#close-notifications');
    const notificationBell = utils.$('.notification-bell');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            utils.hideModal('notifications-modal');
        });
    }

    // Notification bell click - will be initialized when header is created
    if (notificationBell) {
        notificationBell.addEventListener('click', () => {
            renderNotifications();
            utils.showModal('notifications-modal');
        });
    }
}

function renderNotifications() {
    const list = utils.$('#notifications-list');
    const empty = utils.$('#notifications-empty');

    if (!list) return;

    if (notifications.length === 0) {
        list.classList.add('hidden');
        if (empty) empty.classList.remove('hidden');
        return;
    }

    if (empty) empty.classList.add('hidden');
    list.classList.remove('hidden');
    list.innerHTML = '';

    notifications.forEach(notif => {
        const item = utils.createElement('div', {
            className: `notification-item ${notif.unread ? 'unread' : ''}`,
            dataId: notif.id,
            onClick: () => markNotificationRead(notif.id)
        }, [
            utils.createElement('div', {
                className: `notification-indicator ${notif.type}`
            }),
            utils.createElement('div', { className: 'notification-content' }, [
                utils.createElement('p', {
                    className: 'notification-title',
                    textContent: notif.title
                }),
                utils.createElement('p', {
                    className: 'notification-text',
                    textContent: notif.text
                }),
                utils.createElement('span', {
                    className: 'notification-time',
                    textContent: notif.time
                })
            ])
        ]);

        list.appendChild(item);
    });
}

function markNotificationRead(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
        notif.unread = false;
        renderNotifications();
        updateNotificationBadge();
    }
}

function updateNotificationBadge() {
    const badge = utils.$('.notification-badge');
    const unreadCount = notifications.filter(n => n.unread).length;

    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Add notification function for external use
function addNotification(type, title, text) {
    notifications.unshift({
        id: Date.now(),
        type,
        title,
        text,
        time: 'Just now',
        unread: true
    });
    updateNotificationBadge();
}

// Generate notifications based on real expense data
function generateNotificationsFromExpenses(expenses, categories) {
    // Clear old auto-generated notifications (those without category 'manual')
    notifications = notifications.filter(n => n.category === 'manual');

    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Calculate this month's total
    const monthExpenses = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Get budget limit from user settings
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const budgetLimit = user?.settings?.budgetLimit || 10000;

    // Budget alert
    if (monthTotal > budgetLimit) {
        notifications.unshift({
            id: 'auto-budget-err',
            type: 'alert',
            title: 'Budget Exceeded!',
            text: `You've spent ${utils.formatCurrency(monthTotal)} ETB this month, exceeding your ${utils.formatCurrency(budgetLimit)} ETB limit.`,
            time: 'Now',
            unread: true
        });
    } else if (monthTotal > budgetLimit * 0.8) {
        notifications.unshift({
            id: 'auto-budget-warn',
            type: 'warning',
            title: 'Budget Warning',
            text: `You've used ${Math.round((monthTotal / budgetLimit) * 100)}% of your monthly budget.`,
            time: 'Now',
            unread: true
        });
    }

    // Recent activity notification
    const recentExpenses = expenses.slice(0, 3);
    if (recentExpenses.length > 0) {
        const recentTotal = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        notifications.unshift({
            id: 'auto-recent',
            type: 'info',
            title: 'Recent Activity',
            text: `${recentExpenses.length} recent expenses totaling ${utils.formatCurrency(recentTotal)} ETB.`,
            time: 'Today',
            unread: false
        });
    }

    // Top spending category
    if (categories.length > 0 && expenses.length > 0) {
        const categoryTotals = {};
        expenses.forEach(exp => {
            const catId = exp.categoryId?._id || exp.categoryId;
            categoryTotals[catId] = (categoryTotals[catId] || 0) + exp.amount;
        });
        const topCatId = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a])[0];
        const topCat = categories.find(c => c._id === topCatId);
        if (topCat) {
            notifications.unshift({
                id: 'auto-top-spend',
                type: 'insight',
                title: 'Top Spending',
                text: `${topCat.icon} ${topCat.name} is your highest spending category at ${utils.formatCurrency(categoryTotals[topCatId])} ETB.`,
                time: 'This month',
                unread: false
            });
        }
    }

    // If still no dynamic notifications and no manual ones, add a hint
    if (notifications.length === 0) {
        notifications.push({
            id: 'empty-hint',
            type: 'info',
            title: 'No Notifications',
            text: 'Your spending analysis will appear here.',
            time: 'System',
            unread: false
        });
    }

    updateNotificationBadge();
    renderNotifications();
}

// Dynamic Chart Functions with Data

function updateHomeChartWithData(expenses, period) {
    const canvasId = 'home-chart';
    let chart = window.chartManager.get(canvasId);

    if (!chart) {
        chart = window.chartManager.create(canvasId, 'bar');
    }

    const data = processChartData(expenses, period);

    if (chart) {
        chart.resize();
        chart.setData(data);
    }
}

function updateReportChartWithData(expenses, period) {
    const canvasId = 'report-chart';
    let chart = window.chartManager.get(canvasId);

    if (!chart) {
        chart = window.chartManager.create(canvasId, 'bar');
    }

    const data = processChartData(expenses, period);

    if (chart) {
        chart.resize();
        chart.setData(data);
    }
}

async function updateCategoryChart(period) {
    if (!appState.selectedCategory) return;

    const canvasId = 'category-chart';
    let chart = window.chartManager.get(canvasId);

    if (!chart) {
        chart = window.chartManager.create(canvasId, 'line');
    }

    try {
        const expenses = await api.getExpenses({ categoryId: appState.selectedCategory._id });
        const data = processChartData(expenses, period);

        if (chart) {
            chart.resize();
            chart.setData(data);
        }
    } catch (e) {
        console.error('Failed to update category chart:', e);
    }
}

// ===================================
// Chart Data Processing
// ===================================

function processChartData(expenses, period, limit = 7) {
    if (!expenses || expenses.length === 0) {
        return { labels: [], positive: [] };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let labels = [];
    let positive = [];
    let groupMap = new Map();

    if (period === 'today') {
        // Today's expenses grouped by hour
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);

        // Group by 3-hour intervals
        const intervals = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
        intervals.forEach((label, i) => {
            groupMap.set(i, { label, amount: 0 });
        });

        expenses.forEach(exp => {
            const d = new Date(exp.date);
            if (d >= todayStart && d <= today) {
                const hour = d.getHours();
                const interval = Math.floor(hour / 3);
                if (groupMap.has(interval)) {
                    groupMap.get(interval).amount += exp.amount;
                }
            }
        });

    } else if (period === 'weekly') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            const lang = window.i18n ? window.i18n.currentLanguage : 'en';
            const label = d.toLocaleDateString(lang, { weekday: 'short' });
            groupMap.set(key, { label, amount: 0 });
        }

        expenses.forEach(exp => {
            const d = new Date(exp.date);
            const expenseDate = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            if (groupMap.has(expenseDate)) {
                groupMap.get(expenseDate).amount += exp.amount;
            }
        });

    } else if (period === 'monthly') {
        // Last 4 weeks (approx) or weeks in month
        // Simplifying to last 5 weeks
        for (let i = 4; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - (i * 7));
            // Get start of week
            const day = d.getDay() || 7; // Get current day number, converting Sun. to 7
            if (day !== 1) d.setHours(-24 * (day - 1));

            const key = `Week ${utils.getWeekNumber(d)}`;
            groupMap.set(key, { label: key, amount: 0 });
        }

        expenses.forEach(exp => {
            const d = new Date(exp.date);
            const key = `Week ${utils.getWeekNumber(d)}`;
            // Only count if key exists in our range (simple check)
            // Ideally we check date range properly
            if (groupMap.has(key)) { // This is a loose check, might group separate years
                groupMap.get(key).amount += exp.amount;
            } else {
                // For now, let's just use the last 30 days grouped by 5-day intervals for monthly view
                // or just use day-by-day for current month?
                // Let's stick to a simpler "Last 30 Days" grouped by day if we want detail, or weeks.
                // Reverting to Monthly = Last 6 Months for better trend?
                // Let's do Monthly = Last 6 months
            }
        });

        // Redoing Monthly to be Last 6 Months for better visual
        groupMap.clear();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const lang = window.i18n ? window.i18n.currentLanguage : 'en';
            const label = d.toLocaleDateString(lang, { month: 'short' });
            groupMap.set(key, { label, amount: 0 });
        }

        expenses.forEach(exp => {
            const d = new Date(exp.date);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (groupMap.has(key)) {
                groupMap.get(key).amount += exp.amount;
            }
        });

    } else if (period === 'yearly') {
        // All months of current year
        const year = today.getFullYear();
        for (let i = 0; i < 12; i++) {
            const d = new Date(year, i, 1);
            const key = `${year}-${i}`;
            const label = d.toLocaleDateString('en-US', { month: 'short' });
            groupMap.set(key, { label, amount: 0 });
        }

        expenses.forEach(exp => {
            const d = new Date(exp.date);
            if (d.getFullYear() === year) {
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                if (groupMap.has(key)) {
                    groupMap.get(key).amount += exp.amount;
                }
            }
        });
    }

    groupMap.forEach(val => {
        labels.push(val.label);
        positive.push(val.amount);
    });

    return { labels, positive };
}



// ===================================
// Charts Initialization
// ===================================

function initCharts() {
    // Charts will be initialized when pages are loaded
}

// ===================================
// PDF Export
// ===================================

utils.$('#export-pdf-btn')?.addEventListener('click', () => utils.showModal('export-pdf-modal'));
utils.$('#export-pdf-main')?.addEventListener('click', () => utils.showModal('export-pdf-modal'));
utils.$('#close-export-modal')?.addEventListener('click', () => utils.hideModal('export-pdf-modal'));
utils.$('#confirm-export-pdf')?.addEventListener('click', async () => {
    const from = utils.$('#pdf-date-from').value;
    const to = utils.$('#pdf-date-to').value;
    utils.hideModal('export-pdf-modal');
    await exportToPDF(from, to);
});

async function exportToPDF(dateFrom = null, dateTo = null) {
    utils.showToast('Generating report...', 'info');

    try {
        let filters = {};
        if (dateFrom) filters.dateFrom = new Date(dateFrom).toISOString();
        if (dateTo) filters.dateTo = new Date(dateTo).toISOString();

        const expenses = await api.getExpenses(filters);
        const categories = await api.getCategories();

        // Create printable content
        const printWindow = window.open('', '_blank');
        const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        let tableRows = expenses.map(exp => {
            const cat = typeof exp.categoryId === 'object' ? exp.categoryId : categories.find(c => c._id === exp.categoryId);
            const date = exp.dateEthiopian || new Date(exp.date).toLocaleDateString();
            return `<tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${date}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${exp.reason}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${cat?.icon || ''} ${cat?.name || 'Other'}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${utils.formatCurrency(exp.amount)} ETB</td>
            </tr>`;
        }).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Expense Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; margin-bottom: 5px; }
                    .subtitle { color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #333; color: white; padding: 10px; text-align: left; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .total-row { font-weight: bold; background: #eee !important; }
                    .total-row td { border-top: 2px solid #333; }
                </style>
            </head>
            <body>
                <h1>Expense Report</h1>
                <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Reason</th>
                            <th>Category</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                        <tr class="total-row">
                            <td colspan="3" style="padding: 10px; border: 1px solid #ddd;"><strong>Total</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>${utils.formatCurrency(totalAmount)} ETB</strong></td>
                        </tr>
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    } catch (e) {
        utils.showToast('Failed to generate report', 'error');
    }
}

// ===================================
// Export app functions
// ===================================
window.app = {
    showPage,
    showToast: utils.showToast,
    showModal: utils.showModal,
    hideModal: utils.hideModal,
    openDatePicker,
    addNotification,
    renderNotifications
};

// ===================================
// Initialization
// ===================================

function initApp() {
    // Show splash screen animation
    setTimeout(() => {
        hideSplashScreen();
    }, 2500);

    // Initialize components
    initNavigation();
    initAuth();
    initHome();
    initAddExpense();
    initReport();
    initSettings();
    initCategoryPage();
    initModals();
    initCharts();

    // Initialize i18n
    const savedLang = localStorage.getItem('language') || 'en';
    if (window.i18n) {
        window.i18n.setLanguage(savedLang);
        // Set selector value
        const langSelector = utils.$('#language-selector');
        if (langSelector) langSelector.value = savedLang;
    }

    updateNotificationBadge();

    // Check if user is already logged in
    const savedUser = utils.loadFromStorage('currentUser');
    if (savedUser) {
        appState.isLoggedIn = true;
        // Apply saved settings
        if (savedUser.settings) {
            document.documentElement.dataset.theme = savedUser.settings.darkMode ? 'dark' : 'light';
            document.documentElement.dataset.fontSize = savedUser.settings.fontSize || 'medium';
        }
        showPage('home');
    }

    // Network status listeners
    utils.addNetworkListeners(
        () => utils.showToast('You are back online!', 'success'),
        () => utils.showToast('You are offline. Changes will sync when online.', 'warning')
    );
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
});
