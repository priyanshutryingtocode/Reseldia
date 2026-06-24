import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error, fallback = 'Something went wrong.') => {
  return error.response?.data?.message
    || error.response?.data?.error
    || error.response?.data?.msg
    || error.message
    || fallback;
};

export default api;
