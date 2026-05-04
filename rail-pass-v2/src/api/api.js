import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only treat 401 (token expired/invalid) as a session expiry.
        // 403 (Forbidden) means the user IS authenticated but lacks permission —
        // do NOT wipe the session or redirect, let the component handle it.
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?reason=session_expired';
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials),
    signup: (userData) => api.post('/auth/signup', userData),
};

export const trainApi = {
    search: (source, destination, date) => api.get(`/trains/search?source=${source}&destination=${destination}&date=${date}`),
    getAll: () => api.get('/trains/all'),
    getById: (id, date) => api.get(`/trains/${id}${date ? `?date=${date}` : ''}`),
    add: (data) => api.post('/trains/add', data),
    update: (id, data) => api.put(`/trains/update/${id}`, data),
    delete: (id) => api.delete(`/trains/delete/${id}`),
};

export const bookingApi = {
    book: (data) => api.post('/bookings/book', data),
    getHistory: (userId) => api.get(`/bookings/history/${userId}`),
    getByPnr: (pnr) => api.get(`/bookings/${pnr}`),
    cancel: (pnr) => api.post(`/bookings/cancel/${pnr}`),
    replace: (data) => api.post('/bookings/replace', data),
    getAll: () => api.get('/bookings/all'),
};

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
};

export const userApi = {
    getAll: () => api.get('/users/all'),
};

export default api;
