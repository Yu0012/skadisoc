import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { BsMoon, BsSun } from 'react-icons/bs';
import logoLight from '../assets/skadiLogo_light.png';
import logoDark from '../assets/skadiLogo.png';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import styles from './AuthForm.module.css';

const AuthForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoSrc, setLogoSrc] = useState(logoLight);
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(!showPassword);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    const newTheme = newMode ? 'dark' : 'light';
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newTheme); // ✅ Use 'theme', not 'darkMode'
    document.documentElement.dataset.selectedTheme = newTheme;
    document.body.dataset.selectedTheme = newTheme;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const dark = savedTheme === 'dark';
    setIsDarkMode(dark);
    document.documentElement.dataset.selectedTheme = savedTheme;
    document.body.dataset.selectedTheme = savedTheme;
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

  const handleGuestLogin = () => {
    navigate('/client-login');
  };

  return (
    <div className={`${styles.wrapper} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.themeToggle} onClick={toggleTheme}>
        {isDarkMode ? <BsSun /> : <BsMoon />}
      </div>

      <div className={styles.card}>
        <img src={logoSrc} alt="Skadi Systems" className={styles.logo} />
        <h2>Welcome Back</h2>
        <p className={styles.subtitle}>Please enter your details to login</p>

        <form onSubmit={handleSubmit} className={styles.form}>
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

          <button type="submit" className={styles.loginBtn}>Login</button>
        </form>

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
