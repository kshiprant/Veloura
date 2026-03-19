import axios from 'axios';

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:10000/api'
).trim();

if (import.meta.env.DEV) {
  console.log('API BASE URL:', BASE_URL);
}

if (!import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_URL) {
  console.error('API URL is not set. Falling back to localhost.');
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('veloura_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API ERROR:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;
