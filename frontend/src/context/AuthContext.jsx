import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    if (token) {
      // Здесь можно получить информацию о пользователе с бэкенда
      // Например, через эндпоинт /auth/me/
      const fetchUser = async () => {
        try {
          // Раскомментируйте, когда добавите эндпоинт /auth/me/
          // const response = await api.get('/auth/me/');
          // setUser(response.data);

          // Пока используем заглушку
          setUser({
            username: localStorage.getItem('username') || 'User',
            avatarUrl: null // Здесь можно добавить URL аватара
          });
        } catch (error) {
          console.error('Error fetching user:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('username', username); // Сохраняем username
      setToken(access_token);
      setUser({ username, avatarUrl: null });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  };

  const register = async (username, password) => {
    try {
      const response = await apiRegister(username, password);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};