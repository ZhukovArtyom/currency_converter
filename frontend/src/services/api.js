import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Аутентификация
export const register = (username, password) =>
  api.post('/auth/register/', { username, password });

export const login = (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  return api.post('/auth/login/', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

// Валюты
export const getCurrencies = () => api.get('/currency/list/');
export const getExchangeRates = (base = 'USD') =>
  api.get(`/currency/exchange/?base=${base}`);
export const convertCurrency = (fromCurrency, toCurrency, amount) =>
  api.post('/currency/convert/', { from_currency: fromCurrency, to_currency: toCurrency, amount });

export default api;