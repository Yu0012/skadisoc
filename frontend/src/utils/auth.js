import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { resolvePermissions } from './resolvePermissions';
import config from '../config';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${config.API_BASE}/api/auth/login`, {
      email,
      password
    });

    const { token } = response.data;
    
    if (!token) throw new Error('No token received');
    
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    
    // Return the resolved permissions
    const permissions = resolvePermissions(
      decoded.permissions,
      decoded.role,
      decoded.roleType
    );
    
    return { 
      token,
      user: decoded,
      permissions 
    };
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Account deactivated. Please contact administrator.');
    }
    if (error.response?.status === 401) {
      throw new Error('Invalid credentials');
    }
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Add this to src/utils/auth.js
export const logout = async () => {
  try {
    const response = await axios.post(`${config.API_BASE}/api/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};