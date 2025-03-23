import React, { useState } from "react";
import "../styles.css";
import defaultAvatar from "../assets/man.jpg";

const UserProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState({
    name: "Francis Hill",
    email: "francis.hill@example.com",
    role: "Social Media Manager",
    avatar: defaultAvatar,
  });

  const [previewAvatar, setPreviewAvatar] = useState(null);

  const [stats] = useState({
    totalPosts: 12,
    published: 8,
    scheduled: 4,
    lastLogin: "March 22, 2025, 9:14 AM",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser({ ...user, avatar: imageUrl });
      setPreviewAvatar(file);
    }
  };

  const handleSave = () => {
    setEditMode(false);
    // You can implement saving to backend/localStorage here
  };

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
        <img src={user.avatar} alt="User Avatar" className="profile-avatar" />

        {editMode ? (
          <div className="profile-form">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="avatar-upload"
            />
            <input
              name="name"
              value={user.name}
              onChange={handleChange}
              className="profile-input"
            />
            <input
              name="email"
              value={user.email}
              onChange={handleChange}
              className="profile-input"
            />
            <input
              name="role"
              value={user.role}
              onChange={handleChange}
              className="profile-input"
            />
            <div className="profile-btn-group">
              <button onClick={handleSave} className="save-btn">Save</button>
              <button onClick={handleCancel} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h2>{user.name}</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <button onClick={() => setEditMode(true)} className="edit-btn">✏️ Edit Profile</button>

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
