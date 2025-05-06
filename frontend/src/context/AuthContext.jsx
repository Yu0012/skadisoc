import React, { createContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { resolvePermissions } from '../utils/resolvePermissions'; // 🆕 import

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    token: null,
    user: null,
    permissions: { menus: [], actions: [] }
  });

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const permissions = resolvePermissions(
        decoded.permissions,
        decoded.role,
        decoded.roleType
      );
      setAuthData({ token, user: decoded, permissions });
    } catch (err) {
      console.error('Invalid token:', err);
      localStorage.removeItem('token');
    }
  }
}, []);


  const logout = () => {
    localStorage.removeItem('token');
    setAuthData({ token: null, user: null, permissions: { menus: [], actions: [] } });
  };

  return (
    <AuthContext.Provider value={{ ...authData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
