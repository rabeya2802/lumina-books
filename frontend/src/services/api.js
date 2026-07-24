import axios from 'axios';

/**
 * Central axios instance for the backend API.
 *
 * In development, VITE_API_URL is usually unset, so we fall back to '' and
 * rely on the Vite dev proxy (vite.config.js proxies /api -> localhost:5001).
 *
 * In production (Vercel), set VITE_API_URL to your backend origin, e.g.
 *   https://api.yourdomain.com   or   http://XX.XX.XX.XX:5000
 */
const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  withCredentials: false,
});

// Attach the JWT token (if present in localStorage) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;