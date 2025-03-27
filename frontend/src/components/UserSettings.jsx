import React, { useState } from "react";
import "../styles.css";

const UserSettings = () => {
  // State for input fields and feedback message
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Handle password reset form submission
  const handlePasswordReset = (e) => {
    e.preventDefault();

    // Check for empty fields
    if (!newPassword || !confirmPassword) {
      setMessage("⚠️ Please fill in both fields.");
      return;
    }

    // Check for matching passwords
    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    // Simulate a successful password reset (replace with real API call)
    setMessage("✅ Password has been successfully updated.");

    // Reset input fields
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="settings-container">
      <h2>🔧 User Settings</h2>

      <form className="settings-form" onSubmit={handlePasswordReset}>
        <h3>🔐 Reset Password</h3>

        {/* New password input */}
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="settings-input"
        />

        {/* Confirm password input */}
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="settings-input"
        />

        {/* Submit button */}
        <button type="submit" className="reset-btn">Reset Password</button>

        {/* Feedback message */}
        {message && <p className="reset-message">{message}</p>}
      </form>
    </div>
  );
};

export default UserSettings;
