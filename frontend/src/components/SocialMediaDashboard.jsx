import React, { useState, useEffect } from 'react';
import {FaXTwitter, FaMeta, FaLinkedin, FaArrowLeft} from 'react-icons/fa6';
import clientLogo from '../assets/skadilogo_light.png';
import styles from "../components/SocialMediaDashboard.module.css"; // Import your CSS file for styling
import { useNavigate } from 'react-router-dom';
import config from '../config';

const handleFBLogin = () => {
    window.location.href = `${config.API_BASE}/auth/facebook`; // Redirect to backend auth route
  };

const handleTWTLogin = () => {
  window.location.href = `${config.API_BASE}/auth/twitter`; // Redirect to backend auth route
};

const handleLinkedInLogin = () => {
  window.location.href = `${config.API_BASE}/auth/linkedin`; // Redirect to backend auth route
};



const SocialMediaDashboard = () => {
  const navigate = useNavigate();
    return (
      <div className={styles.pageWrapper}>

        <div class={styles.CenteredContainer}>
            <div>
                <img src={clientLogo} alt="Skadi Logo" className={styles.clientLogo} />
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
                </div>
            </div>
        </div>
      </div>
      );
};

export default SocialMediaDashboard;