import React, { useState, useEffect } from 'react';
import styles from './AuthForm.module.css';
import { login } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Correct image imports from assets folder
import logoLight from '../assets/skadiLogo_light.png';
import logoDark from '../assets/skadiLogo.png'; // Using available dark logo
import sunIcon from '../assets/icon-sun-light.png'; // For dark background
import moonIcon from '../assets/icon-moon.png'; // For light background

/**
 * Authentication Form Component
 * Handles user login with email/password and theme toggling
 */
const AuthForm = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Navigation hook
  const navigate = useNavigate();

  /**
   * Initialize theme based on user preference or system settings
   * Runs once on component mount
   */
  useEffect(() => {
    // Check for saved theme preference in localStorage
    const savedMode = localStorage.getItem('darkMode');
    
    // Detect system color scheme preference
    const hours = new Date().getHours();
    const systemDarkMode = hours < 6 || hours >= 18; // Night time (6PM-6AM)

    // Use saved preference if exists, otherwise use system preference
    const initialMode = savedMode !== null ? savedMode === 'true' : systemDarkMode;
    
    setIsDarkMode(initialMode);
    document.documentElement.classList.toggle('dark-theme', initialMode);
  }, []);

  /**
   * Toggle between light/dark theme
   */
  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    
    // Update state and localStorage
    setIsDarkMode(nextMode);
    localStorage.setItem('darkMode', nextMode);
    
    // Apply smooth transition
    document.documentElement.classList.add("theme-transition");
    document.documentElement.classList.toggle("dark-theme", nextMode);
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 400);
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Attempt login
      const { permissions } = await login(email, password);
      setPermissions(permissions);

      // Show success notification
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

    } catch (err) {
      // Show error notification
      Swal.fire({
        title: 'Login Failed',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  /**
   * Redirect to dashboard when permissions are set
   */
  useEffect(() => {
    if (permissions) {
      navigate('/dashboard');
    }
  }, [permissions, navigate]);

  return (
    <div className={`${styles.authFormContainer} ${isDarkMode ? styles.dark : ''}`}>
      {/* Theme toggle button (top-right corner) */}
      <button
        className={styles.themeToggleButton}
        onClick={toggleTheme}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <img
          src={isDarkMode ? sunIcon : moonIcon}
          alt="Theme Toggle"
          style={{ width: '20px', height: '20px' }}
        />
      </button>

      {/* Main form card */}
      <div className={styles.authForm}>
        {/* Form header with logo */}
        <div className={styles.authHeader}>
          <div className={styles.logoContainer}>
            <img src={isDarkMode ? logoDark : logoLight} alt="Company Logo" />
          </div>
          <h1>Welcome Back</h1>
          <p>Please enter your details to login</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            {/* Email input field */}
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <div className={styles.inputContainer}>
                <div className={styles.inputIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className={styles.inputField}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Password input field */}
            <div className={styles.formGroup}>
              <div className={styles.labelContainer}>
                <label htmlFor="password">Password</label>
              </div>
              <div className={styles.inputContainer}>
                <div className={styles.inputIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={styles.inputField}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="your password"
                    className={styles.passwordInput}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {/* Password visibility toggle */}
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className={styles.submitButton}>
              <button type="submit">Login</button>
            </div>
          </div>
        </form>

        {/* Divider with "Or" text */}
        <div className={styles.dividerContainer}>
          <div className={styles.dividerLine}></div>
          <div className={styles.dividerText}>Or continue with</div>
          <div className={styles.dividerLine}></div>
        </div>

        {/* Guest login button */}
        <div className={styles.socialLoginButtons}>
          <button
            type="button"
            className={styles.googleBtn}
            onClick={() => window.open(`/client-login`, "_blank")}
          >
            Guest Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;