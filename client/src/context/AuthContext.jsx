import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [googleData, setGoogleData] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const profile = await response.json();
          setUser({ ...profile, token });
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password, rememberMe = false) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.otpRequired) {
        return data; // Return directly so UI can show OTP modal
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOtp = async (email, otp) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-login-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }

      if (data.exists) {
        localStorage.setItem('token', data.user.token);
        setToken(data.user.token);
        setUser(data.user);
        setGoogleData(null);
        return { exists: true, user: data.user };
      } else {
        setGoogleData(data.googleData);
        return { exists: false, googleData: data.googleData };
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      setGoogleData(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setGoogleData(null);
  };

  const clearGoogleData = () => {
    setGoogleData(null);
  };

  const updateUserPoints = (points, badges) => {
    setUser(prev => prev ? { ...prev, points, badges } : null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, signup, logout, updateUserPoints, googleLogin, googleData, clearGoogleData, verifyLoginOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
