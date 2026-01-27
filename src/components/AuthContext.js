import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('token') !== null;
  });
  const [user, setUser] = useState(null); // Store user info

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null); // Clear user info on logout
  };

  const setUserFromToken = (token) => {
    // Assuming the token is valid and contains user info
    setUser({}); // Set user info (empty object since we are removing authorization)
    setIsAuthenticated(true); // Update authentication state
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUserFromToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 