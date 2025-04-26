import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaFacebook } from 'react-icons/fa';

const SocialMediaDashboard = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");

  useEffect(() => {
    if (clientId) {
      console.log("Client ID from query:", clientId);
      // Optional: Fetch existing data or preload info
    }
  }, [clientId]);

  const handleLogin = () => {
    // Optional: You could POST this client ID to the server when tokens are received
    window.location.href = `http://localhost:5000/auth/facebook?clientId=${clientId}`;
  };

  return (
    <div className="CenteredContainer">
      <div>
        <h1>Skadi Social Media</h1>
        <p>Connect your Social Media to Skadi SoMed</p>
        <p>Connected Client ID: {clientId}</p>
        <h2>Platform</h2>
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700"
        >
          Login with Facebook
        </button>
      </div>
    </div>
  );
};

export default SocialMediaDashboard;
