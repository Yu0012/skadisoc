import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaXTwitter, FaMeta, FaLinkedin } from 'react-icons/fa6'; // Social icons
import clientLogo from '../assets/skadilogo_light.png'; // Skadi logo
import styles from "../components/SocialMediaDashboard.module.css"; // CSS module

// ⬇️ Handlers to redirect to backend OAuth routes
const handleFBLogin = () => {
  window.location.href = "http://localhost:5000/auth/facebook"; // Replace with your backend live URL
};

const handleTWTLogin = () => {
  window.location.href = "http://localhost:5000/auth/twitter";
};

const handleLinkedInLogin = () => {
  window.location.href = "http://localhost:5000/auth/linkedin";
};

const SocialMediaDashboard = () => {
  const navigate = useNavigate(); // Enables programmatic navigation

  return (
    <div className={styles.pageWrapper}>
      {/* 🔙 Top-left Back to Login Button */}
      <div className={styles.backButton} onClick={() => navigate('/login')}>
        <FaArrowLeft style={{ marginRight: '6px' }} />
        Back to Login
      </div>

      {/* 📦 Centered Login Card */}
      <div className={styles.CenteredContainer}>
        <div>
          {/* 🖼 Skadi Logo */}
          <img src={clientLogo} alt="Skadi Logo" className={styles.clientLogo} />

          {/* 📄 Intro Text */}
          <div className={styles.textContainer}>
            <p>Connect your Social Media to Skadi SoMed</p>
            <p>Sign in using</p>
          </div>

          {/* 🔘 Social Login Buttons */}
          <div className={styles.buttongroup}>
            {/* Meta / Facebook Login */}
            <button onClick={handleFBLogin} className={styles['facebook-button']}>
              <FaMeta className={styles.icon} size={25} color="white" />
              Login with Meta
            </button>

            {/* X (Twitter) Login */}
            <button onClick={handleTWTLogin} className={styles['twitter-button']}>
              <FaXTwitter className={styles.icon} size={25} color="white" />
              Login with X
            </button>

            {/* LinkedIn Login */}
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
