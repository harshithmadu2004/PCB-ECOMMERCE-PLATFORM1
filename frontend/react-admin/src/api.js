import axios from 'axios';

const DJANGO_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000/api';
const FASTAPI_URL = import.meta.env.VITE_FASTAPI_CART_URL || 'http://localhost:8001';

export const getAuthToken = () => localStorage.getItem('react_pcb_token');
export const setAuthData = (token, user) => {
  localStorage.setItem('react_pcb_token', token);
  localStorage.setItem('react_pcb_user', JSON.stringify(user));
};
export const clearAuthData = () => {
  localStorage.removeItem('react_pcb_token');
  localStorage.removeItem('react_pcb_user');
};
export const getCurrentUser = () => {
  const u = localStorage.getItem('react_pcb_user');
  if (u) {
    try { return JSON.parse(u); } catch (e) { return null; }
  }
  return null;
};

export const djangoApi = axios.create({ baseURL: DJANGO_URL });
djangoApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fastapiApi = axios.create({ baseURL: FASTAPI_URL });
fastapiApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
