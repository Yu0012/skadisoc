import React, { useState } from "react";
import "../styles.css";

const UserSettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle password reset form submission
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("⚠️ Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ New passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token"); // JWT from login
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`❌ ${data.message || "Failed to reset password."}`);
      } else {
        setMessage("✅ Password has been successfully updated.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage("❌ An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>🔧 User Settings</h2>

      <form className="settings-form" onSubmit={handlePasswordReset}>
        <h3>🔐 Reset Password</h3>

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="settings-input"
        />

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

        <button type="submit" className="reset-btn" disabled={loading}>
          {loading ? "Updating..." : "Reset Password"}
        </button>

        {message && <p className="reset-message">{message}</p>}
      </form>
    </div>
  );
};

export default UserSettings;
