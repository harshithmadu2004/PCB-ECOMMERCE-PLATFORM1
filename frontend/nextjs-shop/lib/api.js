import axios from 'axios';

const DJANGO_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api';
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_CART_URL || 'http://localhost:8001';

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('pcb_token');
  }
  return null;
};

export const setAuthData = (token, user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pcb_token', token);
    localStorage.setItem('pcb_user', JSON.stringify(user));
  }
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pcb_token');
    localStorage.removeItem('pcb_user');
  }
};

export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('pcb_user');
    if (userStr) {
      try { return JSON.parse(userStr); } catch (e) { return null; }
    }
  }
  return null;
};

// Django Axios Instance
export const djangoApi = axios.create({
  baseURL: DJANGO_URL,
});

djangoApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// FastAPI Axios Instance
export const fastapiApi = axios.create({
  baseURL: FASTAPI_URL,
});

fastapiApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
