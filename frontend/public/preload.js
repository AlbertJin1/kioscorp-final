const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // User authentication
    validateSession: async () => {
        const response = await fetch('/api/validate-session/');
        return response.json();
    },
    register: async (data) => {
        const response = await fetch('/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    registerOwner: async (data) => {
        const response = await fetch('/api/register-owner/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    login: async (data) => {
        const response = await fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    logout: async () => {
        const response = await fetch('/api/logout/', {
            method: 'POST',
        });
        return response.json();
    },
    resetPassword: async (data) => {
        const response = await fetch('/api/reset-password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    updateProfile: async (data) => {
        const response = await fetch('/api/profile/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    changePassword: async (data) => {
        const response = await fetch('/api/change-password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    getUsers: async () => {
        const response = await fetch('/api/users/');
        return response.json();
    },
    addUser: async (data) => { // Fixed function name
        const response = await fetch('/api/users/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    getUserById: async (userId) => { // Fixed function name
        const response = await fetch(`/api/users/${userId}/`);
        return response.json();
    },
    updateUser: async (userId, data) => { // Fixed function name
        const response = await fetch(`/api/users/${userId}/update/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    deleteUser: async (userId) => { // Fixed function name
        const response = await fetch(`/api/users/${userId}/delete/`, {
            method: 'DELETE',
        });
        return response.json();
    },
    updateProfilePicture: async (data) => {
        const response = await fetch('/api/update-profile-picture/', {
            method: 'PUT',
            body: data,
        });
        return response.json();
    },
    getProfilePicture: async () => {
        const response = await fetch('/api/profile-picture/');
        return response.blob();
    },
    getProfilePictureAdmin: async (userId) => {
        const response = await fetch(`/api/users/${userId}/profile-picture/`);
        return response.blob();
    },
    // Logs
    getLogs: async () => {
        const response = await fetch('/logs/');
        return response.json();
    },
    // Categories
    getMainCategories: async () => {
        const response = await fetch('/api/main-categories/');
        return response.json();
    },
    getSubCategories: async () => {
        const response = await fetch('/api/sub-categories/');
        return response.json();
    },
    getSubCategoryDetail: async (subCategoryId) => {
        const response = await fetch(`/api/sub-categories/${subCategoryId}/`);
        return response.json();
    },
    // Products
    getProducts: async () => {
        const response = await fetch('/api/products/');
        return response.json();
    },
    getProductDetail: async (productId) => {
        const response = await fetch(`/api/products/${productId}/`);
        return response.json();
    },
    lowSellingProducts: async () => {
        const response = await fetch('/api/low-selling-products/');
        return response.json();
    },
    // Orders
    createOrder: async (data) => {
        const response = await fetch('/api/create-order/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    payOrder: async (orderId, data) => {
        const response = await fetch(`/api/orders/pay/${orderId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    getOrderCounts: async () => {
        const response = await fetch('/api/orders/counts/');
        return response.json();
    },
    getPendingOrders: async () => {
        const response = await fetch('/api/orders/pending/');
        return response.json();
    },
    voidOrder: async (orderId) => {
        const response = await fetch(`/api/orders/void/${orderId}/`, {
            method: 'PATCH',
        });
        return response.json();
    },
    getOrderHistory: async () => {
        const response = await fetch('/api/orders/history/');
        return response.json();
    },
    // Sales
    getSalesData: async () => {
        const response = await fetch('/api/sales/data/');
        return response.json();
    },
    getMonthlySales: async () => {
        const response = await fetch('/api/sales/monthly/');
        return response.json();
    },
    getSalesByCategory: async () => {
        const response = await fetch('/api/sales/category/');
        return response.json();
    },
    getTopSellingProducts: async () => {
        const response = await fetch('/api/top-selling-products/');
        return response.json();
    },
    getCustomerCountByMonth: async () => {
        const response = await fetch('/api/customers/counts/month/');
        return response.json();
    },
    // Feedback
    createFeedback: async (data) => {
        const response = await fetch('/api/feedback/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    getSatisfactionOverview: async () => {
        const response = await fetch('/api/feedback/satisfaction/');
        return response.json();
    },
    // Miscellaneous
    printReceipt: async (data) => {
        const response = await fetch('/api/print-receipt/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    clearSalesData: async () => {
        const response = await fetch('/api/sales/clear/', {
            method: 'DELETE',
        });
        return response.json();
    },
    clearCustomerData: async () => {
        const response = await fetch('/api/customers/clear/', {
            method: 'DELETE',
        });
        return response.json();
    },
    ping: async () => {
        const response = await fetch('/api/ping/');
        return response.json();
    },
});
