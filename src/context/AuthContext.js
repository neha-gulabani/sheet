import React, { createContext, useState, useEffect, useContext } from 'react';
import { getToken, setToken, removeToken } from '../utils/localStorage';
import { loginUser, signupUser, verifyToken } from '../services/auth';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await verifyToken(token);
          setCurrentUser(userData);
        } catch (error) {
          removeToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { token, user } = await loginUser(email, password);
    setToken(token);
    setCurrentUser(user);
    return user;
  };

  const signup = async (name, email, password) => {
    const { token, user } = await signupUser(name, email, password);
    setToken(token);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    removeToken();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};