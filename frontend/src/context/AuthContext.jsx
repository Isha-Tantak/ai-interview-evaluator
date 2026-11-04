import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_name');
    if (token && savedUser) {
      setUser({ name: savedUser });
    }
  }, [token]);

  const login = (jwtToken, userName) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user_name', userName);
    setToken(jwtToken);
    setUser({ name: userName });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);