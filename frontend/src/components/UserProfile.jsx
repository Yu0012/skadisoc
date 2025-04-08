import React, { useState } from "react";
import "../styles.css";
import defaultAvatar from "../assets/man.jpg";

const UserProfile = () => {
  // Toggle edit mode
  const [editMode, setEditMode] = useState(false);

  // User profile state
  const [user, setUser] = useState({
    name: "Francis Hill",
    email: "francis.hill@example.com",
    role: "Social Media Manager",
    avatar: defaultAvatar,
  });

  // Preview image state for avatar change
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // Dummy stats (could come from backend)
  const [stats] = useState({
    totalPosts: 12,
    published: 8,
    scheduled: 4,
    lastLogin: "March 22, 2025, 9:14 AM",
  });

  // Handle text input change (name, email, role)
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle avatar image file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser({ ...user, avatar: imageUrl }); // Update avatar preview
      setPreviewAvatar(file); // Save file for possible backend upload
    }
  };

  // Save changes (stub for backend integration)
  const handleSave = () => {
    setEditMode(false);
    // Optionally save `user` and `previewAvatar` to backend here
  };

  // Cancel editing and reset values
  const handleCancel = () => {
    setEditMode(false);
    setPreviewAvatar(null);
    setUser({
      name: "Francis Hill",
      email: "francis.hill@example.com",
      role: "Social Media Manager",
      avatar: defaultAvatar,
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Avatar */}
        <img src={user.avatar} alt="User Avatar" className="profile-avatar" />

        {editMode ? (
          // Edit Mode UI
          <div className="profile-form">
            {/* Avatar uploader */}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="avatar-upload"
            />
            {/* Editable fields */}
            <input
              name="name"
              value={user.name}
              onChange={handleChange}
              placeholder="Insert Name Here"
              className="profile-input"
            />
            <input
              name="email"
              value={user.email}
              onChange={handleChange}
              placeholder="Insert Email Here"
              className="profile-input"
            />
            <input
              name="role"
              value={user.role}
              onChange={handleChange}
              placeholder="Insert Role Here"
              className="profile-input"
            />
            {/* Action buttons */}
            <div className="profile-btn-group">
              <button onClick={handleSave} className="save-btn">Save</button>
              <button onClick={handleCancel} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          // View Mode UI
          <>
            <h2>{user.name}</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>

            {/* Enable edit mode */}
            <button onClick={() => setEditMode(true)} className="edit-btn">✏️ Edit Profile</button>

            {/* Stats display */}
            <div className="user-stats">
              <h3>📊 Activity Summary</h3>
              <ul>
                <li>Total Posts: <strong>{stats.totalPosts}</strong></li>
                <li>Published Posts: <strong>{stats.published}</strong></li>
                <li>Scheduled Posts: <strong>{stats.scheduled}</strong></li>
                <li>Last Login: <strong>{stats.lastLogin}</strong></li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
