// export default UserProfile;
import React, { useState, useEffect } from "react";
import "../styles.css";
import defaultAvatar from "../assets/man.jpg";
import config from "../config"; // Adjust the path as necessary




const UserProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);


  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    avatar: defaultAvatar,
  });

  const [previewAvatar, setPreviewAvatar] = useState(null);

  const [stats, setStats] = useState({
    totalPosts: 0,
    draft: 0,
    posted: 0,
    scheduled: 0,
    lastLogin: "", // You can set this on backend if needed
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${config.API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to fetch profile:", data.message);
          return;
        }

        setUser({
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: data.profilePicture || defaultAvatar,
        });

        setStats({
          totalPosts: data.postStats?.total || 0,
          draft: data.postStats?.draft || 0,
          posted: data.postStats?.posted || 0,
          scheduled: data.postStats?.scheduled || 0,
          lastLogin: data.lastLogin || "Unavailable",
        });
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

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
    // Optional backend update logic here
  };

  const handleCancel = () => {
    setEditMode(false);
    setPreviewAvatar(null);
    // Reset to original or refetch
      if (originalUser) {
        setUser(originalUser); // restore saved values
      }
  };

  const formatMalaysiaTime = (isoString) => {
  if (!isoString) return "Unavailable";
  try {
    const date = new Date(isoString);
    return date.toLocaleString("en-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch (err) {
    return "Invalid Date";
  }
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
              placeholder="Insert Name Here"
            />
            <input
              name="email"
              value={user.email}
              onChange={handleChange}
              className="profile-input"
              placeholder="Insert Email Here"
            />
            <input
              name="role"
              value={user.role}
              onChange={handleChange}
              className="profile-input"
              placeholder="Insert Role Here"
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

            <button onClick={() => {
              setOriginalUser(user); // save current state
              setEditMode(true);
            }} className="edit-btn">✏️ Edit Profile</button>


            <div className="user-stats">
              <h3>📊 Activity Summary</h3>
              <ul>
                <li>Total Posts: <strong>{stats.totalPosts}</strong></li>
                <li>Draft Posts: <strong>{stats.draft}</strong></li>
                <li>Posted Posts: <strong>{stats.posted}</strong></li>
                <li>Scheduled Posts: <strong>{stats.scheduled}</strong></li>
                <li>Last Login: <strong>{formatMalaysiaTime(stats.lastLogin)}</strong></li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
