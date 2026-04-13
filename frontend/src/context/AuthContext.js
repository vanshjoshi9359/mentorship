import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Bump this version whenever you want to force-clear old tokens
const APP_VERSION = 'findit-v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If stored version doesn't match, wipe everything
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
      localStorage.clear();
      delete axios.defaults.headers.common['Authorization'];
      localStorage.setItem('app_version', APP_VERSION);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      // Token is invalid or expired — clear everything silently
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/google`, { credential });
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Google login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8b949e',
        fontSize: '18px',
        fontFamily: 'system-ui, sans-serif'
      }}>
        🔍 Loading FindIt...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
