import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export const TOKEN_STORAGE_KEY = 'token';

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
  }
};

export const clearStoredToken = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('email');
  } catch {
  }
};

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const isAuthAttempt = (url = '') => url.includes('/user/login') || url.includes('/user/register');

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && !isAuthAttempt(error.config?.url) && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

export const toErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const data = error?.response?.data;

  if (data?.fieldErrors) {
    const first = Object.values(data.fieldErrors)[0];
    if (first) return first;
  }
  if (data?.message) return data.message;
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (error?.message === 'Network Error') return 'Cannot reach the server. Is the API running?';
  return error?.message || fallback;
};

export default apiClient;
