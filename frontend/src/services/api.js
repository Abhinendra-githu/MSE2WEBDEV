import axios from 'axios';

// Get base URL from environment or fallback to localhost
let rawURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();

// Clean up baseURL: strip trailing slashes
rawURL = rawURL.replace(/\/+$/, '');

// Normalize so it always ends with /api (without duplicate /api)
const baseURL = rawURL.endsWith('/api') ? rawURL : `${rawURL}/api`;

const api = axios.create({
  baseURL,
  timeout: 60000, // 60s timeout for Render free tier cold starts
});

// Interceptor to add auth token if available
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }
  return config;
});

export default api;
export { baseURL };
