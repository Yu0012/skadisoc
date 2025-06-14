import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { BsMoon, BsSun } from 'react-icons/bs';
import logoLight from '../assets/skadiLogo_light.png';
import logoDark from '../assets/skadiLogo.png';
import '../styles.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoSrc, setLogoSrc] = useState(logoLight);
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(!showPassword);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.body.setAttribute('data-selected-theme', 'dark');
    } else {
      document.body.removeAttribute('data-selected-theme');
    }
    localStorage.setItem('darkMode', newMode);
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    if (savedMode) {
      document.body.setAttribute('data-selected-theme', 'dark');
    } else {
      document.body.removeAttribute('data-selected-theme');
    }
  }, []);

  useEffect(() => {
    setLogoSrc(isDarkMode ? logoDark : logoLight);
  }, [isDarkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);

      Swal.fire({
        title: 'Login Successful!',
        text: 'Redirecting to your dashboard...',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      navigate('/dashboard');
    } catch (err) {
      Swal.fire({
        title: 'Login Failed',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="theme-toggle-global" onClick={toggleTheme}>
        {isDarkMode ? <BsSun /> : <BsMoon />}
      </div>

      <div className="login-card">
        <img src={logoSrc} alt="Skadi Systems" className="login-logo" />
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Please enter your details to login</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group password-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="your password"
              />
              <div className="eye-inline-toggle" onClick={togglePassword}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="login-actions">
          <div className="divider">
            <hr />
            <span>Or continue with</span>
            <hr />
          </div>
          <button className="guest-btn">Guest Login</button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;