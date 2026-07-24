import axios from 'axios';

/**
 * Central axios instance for the backend API.
 *
 * Uses RELATIVE URLs (/api/...) so:
 *  - In dev: the Vite dev proxy forwards /api -> http://localhost:5001
 *  - In prod (Vercel): vercel.json rewrites /api/* -> http://34.87.35.30/api/*
 *    (server-side, so the browser stays on HTTPS and never sees the HTTP backend).
 *
 * This avoids "Mixed Content" errors that would happen if the browser tried
 * to call http://34.87.35.30 directly from an HTTPS Vercel page.
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