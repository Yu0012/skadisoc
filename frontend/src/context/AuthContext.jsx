import React, { createContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { resolvePermissions } from '../utils/resolvePermissions';
import { logout as apiLogout } from '../utils/auth'; // Import the logout function

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    token: null,
    user: null,
    permissions: { menus: [], actions: [] }
  });

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }
        
        const permissions = resolvePermissions(
          decoded.permissions,
          decoded.role,
          decoded.roleType
        );
        
        setAuthData({ token, user: decoded, permissions });
      } catch (err) {
        console.error('Invalid token:', err);
        await handleLogout(); // Use the proper logout handler
      }
    };
    
    validateToken();
  }, []);

  const handleLogout = async () => {
    try {
      // Only try to call the API if we have a token
      if (authData.token) {
        await apiLogout();
      }
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      // Always clear local state
      localStorage.removeItem('token');
      setAuthData({ 
        token: null, 
        user: null, 
        permissions: { menus: [], actions: [] } 
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...authData, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};