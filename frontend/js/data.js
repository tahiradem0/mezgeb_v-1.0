/* ===================================
   EXPENSE TRACKER - Static Data
   =================================== */

// Sample User Data
const userData = {
    id: 'user_001',
    username: 'Mezgeb',
    phone: '+251 912 345 678',
    email: 'mezgeb@example.com',
    profileImage: 'https://ui-avatars.com/api/?name=Mezgeb&background=333&color=fff&size=100',
    biometricEnabled: true,
    createdAt: '2025-01-15'
};

// Sample Categories
const categories = [
    {
        id: 'cat_001',
        name: 'House',
        icon: '🏠',
        color: '#8BC34A',
        totalSpent: 25000,
        lastUpdated: '2026-01-28',
        isVisible: true
    },
    {
        id: 'cat_002',
        name: 'Shop',
        icon: '🏪',
        color: '#FF9800',
        totalSpent: 18500,
        lastUpdated: '2026-01-27',
        isVisible: true
    },
    {
        id: 'cat_003',
        name: 'Transport',
        icon: '🚗',
        color: '#2196F3',
        totalSpent: 8750,
        lastUpdated: '2026-01-26',
        isVisible: true
    },
    {
        id: 'cat_004',
        name: 'Food',
        icon: '🍔',
        color: '#E91E63',
        totalSpent: 12300,
        lastUpdated: '2026-01-28',
        isVisible: true
    },
    {
        id: 'cat_005',
        name: 'Healthcare',
        icon: '💊',
        color: '#4CAF50',
        totalSpent: 5200,
        lastUpdated: '2026-01-20',
        isVisible: true
    },
    {
        id: 'cat_006',
        name: 'Entertainment',
        icon: '🎬',
        color: '#9C27B0',
        totalSpent: 3500,
        lastUpdated: '2026-01-25',
        isVisible: true
    }
];

// Sample Expenses
const expenses = [
    {
        id: 'exp_001',
        categoryId: 'cat_001',
        amount: 2500,
        reason: 'Electricity bill payment',
        date: '2026-01-28',
        dateEthiopian: 'Tir 20, 2018',
        createdAt: '2026-01-28T08:30:00Z'
    },
    {
        id: 'exp_002',
        categoryId: 'cat_004',
        amount: 350,
        reason: 'Buying milk and bread',
        date: '2026-01-28',
        dateEthiopian: 'Tir 20, 2018',
        createdAt: '2026-01-28T07:15:00Z'
    },
    {
        id: 'exp_003',
        categoryId: 'cat_003',
        amount: 150,
        reason: 'Taxi to office',
        date: '2026-01-28',
        dateEthiopian: 'Tir 20, 2018',
        createdAt: '2026-01-28T06:45:00Z'
    },
    {
        id: 'exp_004',
        categoryId: 'cat_002',
        amount: 5000,
        reason: 'Stock purchase for shop',
        date: '2026-01-27',
        dateEthiopian: 'Tir 19, 2018',
        createdAt: '2026-01-27T14:20:00Z'
    },
    {
        id: 'exp_005',
        categoryId: 'cat_001',
        amount: 8500,
        reason: 'Monthly rent payment',
        date: '2026-01-27',
        dateEthiopian: 'Tir 19, 2018',
        createdAt: '2026-01-27T10:00:00Z'
    },
    {
        id: 'exp_006',
        categoryId: 'cat_004',
        amount: 1200,
        reason: 'Lunch at restaurant',
        date: '2026-01-27',
        dateEthiopian: 'Tir 19, 2018',
        createdAt: '2026-01-27T12:30:00Z'
    },
    {
        id: 'exp_007',
        categoryId: 'cat_003',
        amount: 800,
        reason: 'Fuel for car',
        date: '2026-01-26',
        dateEthiopian: 'Tir 18, 2018',
        createdAt: '2026-01-26T16:00:00Z'
    },
    {
        id: 'exp_008',
        categoryId: 'cat_005',
        amount: 2500,
        reason: 'Medicine purchase',
        date: '2026-01-26',
        dateEthiopian: 'Tir 18, 2018',
        createdAt: '2026-01-26T11:30:00Z'
    },
    {
        id: 'exp_009',
        categoryId: 'cat_006',
        amount: 500,
        reason: 'Movie tickets',
        date: '2026-01-25',
        dateEthiopian: 'Tir 17, 2018',
        createdAt: '2026-01-25T19:00:00Z'
    },
    {
        id: 'exp_010',
        categoryId: 'cat_001',
        amount: 3500,
        reason: 'Water bill payment',
        date: '2026-01-25',
        dateEthiopian: 'Tir 17, 2018',
        createdAt: '2026-01-25T09:00:00Z'
    },
    {
        id: 'exp_011',
        categoryId: 'cat_002',
        amount: 7500,
        reason: 'Shop maintenance',
        date: '2026-01-24',
        dateEthiopian: 'Tir 16, 2018',
        createdAt: '2026-01-24T15:00:00Z'
    },
    {
        id: 'exp_012',
        categoryId: 'cat_004',
        amount: 650,
        reason: 'Groceries shopping',
        date: '2026-01-24',
        dateEthiopian: 'Tir 16, 2018',
        createdAt: '2026-01-24T10:30:00Z'
    },
    {
        id: 'exp_013',
        categoryId: 'cat_003',
        amount: 200,
        reason: 'Bus fare',
        date: '2026-01-23',
        dateEthiopian: 'Tir 15, 2018',
        createdAt: '2026-01-23T08:00:00Z'
    },
    {
        id: 'exp_014',
        categoryId: 'cat_001',
        amount: 1500,
        reason: 'Internet subscription',
        date: '2026-01-22',
        dateEthiopian: 'Tir 14, 2018',
        createdAt: '2026-01-22T14:00:00Z'
    },
    {
        id: 'exp_015',
        categoryId: 'cat_006',
        amount: 1200,
        reason: 'Concert ticket',
        date: '2026-01-21',
        dateEthiopian: 'Tir 13, 2018',
        createdAt: '2026-01-21T18:00:00Z'
    }
];

// Previous Reasons (for autocomplete)
const previousReasons = [
    'Electricity bill payment',
    'Buying milk and bread',
    'Taxi to office',
    'Stock purchase for shop',
    'Monthly rent payment',
    'Lunch at restaurant',
    'Fuel for car',
    'Medicine purchase',
    'Movie tickets',
    'Water bill payment',
    'Shop maintenance',
    'Groceries shopping',
    'Bus fare',
    'Internet subscription',
    'Concert ticket',
    'Phone recharge',
    'Coffee at cafe',
    'Buying clothes',
    'Gift purchase',
    'Stationery items'
];

// Available Icons for Categories
const availableIcons = [
    '🏠', '🏪', '🏢', '🚗', '🍔', '💊', '📚', '👔', '🎮', '✈️',
    '🏥', '🎓', '💡', '📱', '🛒', '🎬', '⚽', '🎵', '💄', '🐕',
    '🏋️', '☕', '🍕', '🎁', '💻', '📺', '🎨', '🔧', '🌿', '🏦',
    '💳', '🎭', '🚌', '⛽', '🧹', '👶', '💈', '🍺', '🏊', '🎿',
    '📷', '🎸', '🎯', '🎲', '🚿', '💎', '🎪', '🏕️', '🎠', '🛍️'
];

// Chart Data - Weekly
const weeklyChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    positive: [2500, 1800, 3200, 2100, 4500, 1200, 3000],
    negative: [500, 300, 800, 400, 600, 200, 350]
};

// Chart Data - Monthly
const monthlyChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    positive: [12500, 15800, 11200, 14100],
    negative: [2500, 1800, 3200, 2100]
};

// Chart Data - Yearly
const yearlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    positive: [45000, 52000, 48000, 55000, 62000, 58000, 51000, 49000, 53000, 47000, 56000, 45750],
    negative: [8000, 6500, 7200, 9000, 8500, 7800, 6900, 7500, 8200, 7100, 9500, 8000]
};

// User Settings
const userSettings = {
    darkMode: false,
    fontSize: 'medium', // small, medium, large
    budgetLimit: 10000,
    budgetAlertEnabled: true,
    reminderSchedule: 'weekly', // daily, weekly, monthly, custom
    reminderTime: '09:00',
    notificationsEnabled: true
};

// Ethiopian Months
const ethiopianMonths = [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
    'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
];

// Ethiopian Days
const ethiopianDays = ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'];

// Export all data
window.appData = {
    userData,
    categories,
    expenses,
    previousReasons,
    availableIcons,
    weeklyChartData,
    monthlyChartData,
    yearlyChartData,
    userSettings,
    ethiopianMonths,
    ethiopianDays
};
