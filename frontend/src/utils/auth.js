import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { resolvePermissions } from './resolvePermissions';

export const login = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });

    const { token } = response.data;

    if (token) {
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      return decoded.permissions;
    } else {
      throw new Error('No token received');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};