import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:8000/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('askdb-token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('askdb-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize headers and auth state
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to login');
      }

      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('askdb-token', data.access_token);
      localStorage.setItem('askdb-user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      return true;
    } catch (error) {
      toast.error(error.message || 'Login failed. Ensure the backend server is running.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to sign up');
      }

      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('askdb-token', data.access_token);
      localStorage.setItem('askdb-user', JSON.stringify(data.user));
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Signup failed. Ensure the backend server is running.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('askdb-token');
    localStorage.removeItem('askdb-user');
    toast.success('Successfully logged out');
  };

  const authenticatedFetch = async (url, options = {}) => {
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: authHeaders,
    });

    if (response.status === 401) {
      // Session expired
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        authenticatedFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export { API_BASE_URL };
