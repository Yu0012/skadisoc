import React, { useState } from "react";
import "../styles.css";

const UserSettings = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handlePasswordReset = (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMessage("⚠️ Please fill in both fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    // Simulate API call here
    setMessage("✅ Password has been successfully updated.");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="settings-container">
      <h2>🔧 User Settings</h2>

      <form className="settings-form" onSubmit={handlePasswordReset}>
        <h3>🔐 Reset Password</h3>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="settings-input"
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="settings-input"
        />

        <button type="submit" className="reset-btn">Reset Password</button>
        {message && <p className="reset-message">{message}</p>}
      </form>
    </div>
  );
};

export default UserSettings;
