import React, { useState, useEffect } from 'react';
import {FaXTwitter, FaMeta, FaLinkedin} from 'react-icons/fa6';
import logo from '../assets/skadilogo_light.png';
import "../components/SocialMediaDashboard.css"; // Import your CSS file for styling

const handleFBLogin = () => {
    window.location.href = "http://localhost:5000/auth/facebook"; // Redirect to backend auth route
  };

const handleTWTLogin = () => {
  window.location.href = "http://localhost:5000/auth/twitter"; // Redirect to backend auth route
};

const SocialMediaDashboard = () => {

    return (
        <div class="CenteredContainer">
            <div>
                <img src={logo} alt="Skadi Logo" className="logo" />
                <p className='top'>Connect your Social Media to Skadi SoMed</p>
                <p>Sign in using</p>
                <div className="buttongroup">
                <button onClick={handleFBLogin} className="facebook-button">
                    <FaMeta className="icon" size={25} color="white" />
                    Login with Meta
                  </button>
                  <button onClick={handleTWTLogin} className="twitter-button">
                    <FaXTwitter className="icon" size={25} color="white" />
                    Login with X
                  </button>
                  <button className="linkedIn-button">
                    <FaLinkedin className="icon" size={25} color="white" />
                    Login with LinkedIn
                  </button>
                </div>
            </div>
        </div>
      );
};

export default SocialMediaDashboard;