import React, { useState, useEffect } from 'react';
import { FaXTwitter, FaMeta, FaLinkedin, FaArrowLeft } from 'react-icons/fa6';
import { BsMoon, BsSun } from 'react-icons/bs';
import clientLogo from '../assets/skadilogo_light.png';
import clientLogoDark from '../assets/skadiLogo.png';
import styles from "../components/SocialMediaDashboard.module.css";

const SocialMediaDashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    applyTheme(newMode);
  };

  const applyTheme = (darkMode) => {
    if (darkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    applyTheme(savedMode);
  }, []);

  const handleFBLogin = () => {
    window.location.href = "http://localhost:5000/auth/facebook";
  };

  const handleTWTLogin = () => {
    window.location.href = "http://localhost:5000/auth/twitter";
  };

  const handleLinkedInLogin = () => {
    window.location.href = "http://localhost:5000/auth/linkedin";
  };

  const handleBackToLogin = () => {
    // Close the current window
    window.close();
    
    // Fallback in case window.close() doesn't work
    window.location.href = '/login'; // Redirect to login page if window remains open
  };

  return (
    <div className={`${styles.pageWrapper} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.themeToggle} onClick={toggleTheme}>
        {isDarkMode ? <BsSun size={20} /> : <BsMoon size={20} />}
      </div>
      
      <div className={styles.backButton} onClick={handleBackToLogin}>
        <FaArrowLeft size={20} />
        <span>Back to Login</span>
      </div>
      
      <div className={styles.CenteredContainer}>
        <div>
          <img 
            src={isDarkMode ? clientLogoDark : clientLogo} 
            alt="Skadi Logo" 
            className={styles.clientLogo} 
          />
          <div className={styles.textContainer}>
            <p>Connect your Social Media to Skadi SoMed</p>
            <p>Sign in using</p>
          </div>
          <div className={styles.buttongroup}>
            <button onClick={handleFBLogin} className={styles['facebook-button']}>
              <FaMeta className={styles.icon} size={25} color="white" />
              Login with Meta
            </button>
            <button onClick={handleTWTLogin} className={styles['twitter-button']}>
              <FaXTwitter className={styles.icon} size={25} color="white" />
              Login with X
            </button>
            <button onClick={handleLinkedInLogin} className={styles['linkedIn-button']}>
              <FaLinkedin className={styles.icon} size={25} color="white" />
              Login with LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaDashboard;