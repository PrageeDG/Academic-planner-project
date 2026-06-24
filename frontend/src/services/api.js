import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => {
    if (data instanceof FormData) {
      return api.put('/users/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    return api.put('/users/profile', data);
  },
  getSettings: () => api.get('/users/settings'),
  updateSettings: (data) => api.put('/users/settings', data),
  getAllUsers: () => api.get('/users'),
};

// Burnout analysis endpoints
export const burnoutAPI = {
  analyzeBurnout: () => api.get('/burnout/analyze'),
  getHistory: (limit = 10) => api.get(`/burnout/history?limit=${limit}`),
  getLatest: () => api.get('/burnout/latest'),
};

// Collision detection endpoints
export const collisionAPI = {
  analyzeCollisions: () => api.get('/collision/analyze'),
  checkTaskCollision: (data) => api.post('/collision/check', data),
  getResolutions: () => api.get('/collision/resolutions'),
  createResolution: (data) => api.post('/collision/resolutions', data),
  updateResolution: (id, data) => api.put(`/collision/resolutions/${id}`, data),
  deleteResolution: (id) => api.delete(`/collision/resolutions/${id}`),
};

// Task endpoints
export const taskAPI = {
  createTask: (data) => api.post('/tasks', data),
  getTasks: () => api.get('/tasks'),
  getTask: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export default api;
