import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { BsMoon, BsSun } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { login } from '../utils/auth'; // 🔐 Your login API
import logoLight from '../assets/skadiLogo_light.png';
import logoDark from '../assets/skadiLogo.png';
import '../styles.css';

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
      const result = await login(email, password);
      console.log('✅ Login successful:', result);

      // ✅ SweetAlert2 Success Popup
      Swal.fire({
        title: 'Login Successful!',
        text: 'Welcome back 🎉',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        background: isDarkMode ? '#1e1e1e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });

      // ⏳ Delay navigation for animation
      setTimeout(() => {
        navigate('/dashboard');
      }, 1600);
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      Swal.fire({
        title: 'Login Failed',
        text: error.message || 'Login failed. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        background: isDarkMode ? '#1e1e1e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
    }
  };

  const handleGuestLogin = () => {
    navigate('/client-login');
    window.open('/client-login', '_blank');
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
            />
          </div>

          <div className="form-group password-group">
            <div className="password-label-wrapper">
              <label className="form-label">Password</label>
              <div className="eye-inline-toggle" onClick={togglePassword}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="login-actions">
          <div className="divider">
            <hr />
            <span>Or continue with</span>
            <hr />
          </div>
          <button type="button" className="guest-btn" onClick={handleGuestLogin}>
            Guest Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
