import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { BsMoon, BsSun } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// App logo (light/dark mode)
import logoLight from '../assets/skadiLogo_light.png';
import logoDark from '../assets/skadiLogo.png';

// Floating background icons
import facebookIcon from '../assets/facebook.png';
import instagramIcon from '../assets/instagram.png';
import twitterIcon from '../assets/twitter.png';

// Auth function
import { login } from '../utils/auth';

// CSS module
import styles from './AuthForm.module.css';

const AuthForm = () => {
  // State for showing/hiding password
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Theme (light/dark) and logo
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoSrc, setLogoSrc] = useState(logoLight);

  const navigate = useNavigate();

  // Toggle password visibility
  const togglePassword = () => setShowPassword(!showPassword);

  // Toggle between dark and light mode
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    const newTheme = newMode ? 'dark' : 'light';
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.dataset.selectedTheme = newTheme;
    document.body.dataset.selectedTheme = newTheme;
  };

  // On mount, check saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const dark = savedTheme === 'dark';
    setIsDarkMode(dark);
    document.documentElement.dataset.selectedTheme = savedTheme;
    document.body.dataset.selectedTheme = savedTheme;
  }, []);

  // Update logo based on theme
  useEffect(() => {
    setLogoSrc(isDarkMode ? logoDark : logoLight);
  }, [isDarkMode]);

  // Handle login form submission
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

  // Navigate to guest login page
  const handleGuestLogin = () => {
    navigate('/client-login');
  };

  return (
    <div className={`${styles.wrapper} ${isDarkMode ? styles.dark : styles.light}`}>
      
      {/* 🌟 Floating background icons */}
      <div className={styles.bgIcons}>
        {/* Facebook icons */}
        <img src={facebookIcon} className={`${styles.bgIcon} ${styles.facebook1}`} alt="facebook" />
        <img src={facebookIcon} className={`${styles.bgIcon} ${styles.facebook2}`} alt="facebook" />
        <img src={facebookIcon} className={`${styles.bgIcon} ${styles.facebook3}`} alt="facebook" />
        <img src={facebookIcon} className={`${styles.bgIcon} ${styles.facebook3}`} alt="facebook" />
        <img src={facebookIcon} className={`${styles.bgIcon} ${styles.facebook3}`} alt="facebook" />

        {/* Instagram icons */}
        <img src={instagramIcon} className={`${styles.bgIcon} ${styles.instagram1}`} alt="instagram" />
        <img src={instagramIcon} className={`${styles.bgIcon} ${styles.instagram2}`} alt="instagram" />
        <img src={instagramIcon} className={`${styles.bgIcon} ${styles.instagram3}`} alt="instagram" />
        <img src={instagramIcon} className={`${styles.bgIcon} ${styles.instagram3}`} alt="instagram" />
        <img src={instagramIcon} className={`${styles.bgIcon} ${styles.instagram3}`} alt="instagram" />

        {/* Twitter icons */}
        <img src={twitterIcon} className={`${styles.bgIcon} ${styles.twitter1}`} alt="twitter" />
        <img src={twitterIcon} className={`${styles.bgIcon} ${styles.twitter2}`} alt="twitter" />
        <img src={twitterIcon} className={`${styles.bgIcon} ${styles.twitter3}`} alt="twitter" />
        <img src={twitterIcon} className={`${styles.bgIcon} ${styles.twitter3}`} alt="twitter" />
        <img src={twitterIcon} className={`${styles.bgIcon} ${styles.twitter3}`} alt="twitter" />

      </div>

      {/* ☀️🌙 Theme toggle */}
      <div className={styles.themeToggle} onClick={toggleTheme}>
        {isDarkMode ? <BsSun /> : <BsMoon />}
      </div>

      {/* 🔐 Login form card */}
      <div className={styles.card}>
        <img src={logoSrc} alt="Skadi Systems" className={styles.logo} />
        <h2>Welcome Back</h2>
        <p className={styles.subtitle}>Please enter your details to login</p>

        {/* Login form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          {/* Password input with eye toggle */}
          <div className={`${styles.formGroup} ${styles.passwordGroup}`}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="your password"
              />
              <div className={styles.eyeToggle} onClick={togglePassword}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button type="submit" className={styles.loginBtn}>Login</button>
        </form>

        {/* Divider and Guest Login */}
        <div className={styles.actions}>
          <div className={styles.divider}>
            <hr />
            <span>Or continue with</span>
            <hr />
          </div>
          <button type="button" onClick={handleGuestLogin} className={styles.guestBtn}>
            Guest Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
