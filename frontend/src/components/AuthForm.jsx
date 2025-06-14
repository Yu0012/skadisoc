import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { BsMoon, BsSun } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { login } from '../utils/auth';

import logoLight from '../assets/skadiLogo_light.png';
import logoDark from '../assets/skadiLogo.png';
import facebookIcon from '../assets/facebook.png';
import twitterIcon from '../assets/twitter.png';
import instagramIcon from '../assets/instagram.png';

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
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-selected-theme', newTheme);
    document.documentElement.setAttribute('data-selected-theme', newTheme);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const savedTheme = storedTheme === 'dark' ? 'dark' : 'light';

    // ✅ Ensure it's stored if undefined
    if (!storedTheme) {
      localStorage.setItem('theme', 'light');
    }

    setIsDarkMode(savedTheme === 'dark');
    document.body.setAttribute('data-selected-theme', savedTheme);
    document.documentElement.setAttribute('data-selected-theme', savedTheme);
  }, []);

  useEffect(() => {
    setLogoSrc(isDarkMode ? logoDark : logoLight);
  }, [isDarkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
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

      setTimeout(() => {
        navigate('/dashboard');
      }, 1600);
    } catch (error) {
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
    <>
      {/* 🔵 Background Icons */}
      <div className="login-background-icons">
        <img src={facebookIcon} className="icon fb1" alt="Facebook" />
        <img src={facebookIcon} className="icon fb2" alt="Facebook" />
        <img src={facebookIcon} className="icon fb3" alt="Facebook" />
        <img src={twitterIcon} className="icon tw1" alt="Twitter" />
        <img src={twitterIcon} className="icon tw2" alt="Twitter" />
        <img src={twitterIcon} className="icon tw3" alt="Twitter" />
        <img src={instagramIcon} className="icon ig1" alt="Instagram" />
        <img src={instagramIcon} className="icon ig2" alt="Instagram" />
        <img src={instagramIcon} className="icon ig3" alt="Instagram" />
      </div>

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
    </>
  );
};

export default LoginForm;
