import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  const checkAuth = useCallback(() => {
    try {
      const userStr = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      if (userStr && savedToken) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setToken(savedToken);
      }
    } catch (err) {
      console.error('Error checking authentication:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/auth/login', { email, password });
      const { token, id, email: userEmail, name, role } = res.data;

      const user = { id, email: userEmail, name, role };

      setCurrentUser(user);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      Cookies.set('authToken', token, { expires: 7 });

      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (email, password, name, role = 'worker') => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/auth/register', {
        email,
        password,
        name,
        role
      });

      const { token, id, email: userEmail, name: userName, role: userRole } = res.data;
      const user = { id, email: userEmail, name: userName, role: userRole };

      setCurrentUser(user);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      Cookies.set('authToken', token, { expires: 7 });

      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    Cookies.remove('authToken');
  };

  // Update profile
  const updateProfile = (userData) => {
    try {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      setError(err.message || 'An error occurred updating profile');
      return { success: false, error: err.message };
    }
  };

  const value = {
    currentUser,
    token,
    loading,
    error,
    checkAuth,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
