import axios from 'axios';
import { supabase } from '../lib/supabase';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
axiosClient.interceptors.request.use(
  async config => {
    // Get current session from Supabase
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor for errors (optional)
axiosClient.interceptors.response.use(
  response => response,
  error => {
    // You can handle global 401 here
    if (error.response?.status === 401) {
      // e.g., supabase.auth.signOut() or redirect
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
