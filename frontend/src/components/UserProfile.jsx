import React, { useState, useEffect } from "react";
import "../styles.css"; // Import your global stylesheet

const UserProfile = () => {
  // Toggle between view and edit mode
  const [editMode, setEditMode] = useState(false);

  // Store user profile information
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    avatar: "", // not used anymore since we switch to text avatar
  });

  // Optional: for future use if file upload is reintroduced
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // Store user activity statistics
  const [stats, setStats] = useState({
    totalPosts: 0,
    draft: 0,
    posted: 0,
    scheduled: 0,
    lastLogin: "",
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("❌ Failed to fetch profile:", data.message);
          return;
        }

        // Populate user profile
        setUser({
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: data.profilePicture || "", // fallback not used now
        });

        // Populate stats
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

  // Handle input field changes (name, email, role)
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Optional: file upload handler (not in use unless you allow avatars again)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser({ ...user, avatar: imageUrl });
      setPreviewAvatar(file);
    }
  };

  // Save changes (stubbed for real backend)
  const handleSave = () => {
    setEditMode(false);
    // ✅ Optional: Send `user` data and `previewAvatar` to your backend here
  };

  // Cancel editing and reset
  const handleCancel = () => {
    setEditMode(false);
    setPreviewAvatar(null);
    // Optionally refetch or reset to known good state
  };

  // Get first letter of email for avatar circle
  const getInitial = () => {
    return user.email?.charAt(0)?.toUpperCase() || "?";
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Avatar Circle with First Letter */}
        <div className="profile-avatar-initial">
          {getInitial()}
        </div>

        {editMode ? (
          // === Edit Mode View ===
          <div className="profile-form">
            {/* Hidden avatar uploader if needed in future */}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="avatar-upload"
              style={{ display: "none" }}
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

            {/* Save & Cancel Button Group */}
            <div className="profile-btn-group">
              <button onClick={handleSave} className="save-btn">Save</button>
              <button onClick={handleCancel} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          // === View Mode ===
          <>
            <h2>{user.name}</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>

            {/* Enable edit mode */}
            <button onClick={() => setEditMode(true)} className="edit-btn">
              ✏️ Edit Profile
            </button>

            {/* User Activity Stats */}
            <div className="user-stats">
              <h3>📊 Activity Summary</h3>
              <ul>
                <li>Total Posts: <strong>{stats.totalPosts}</strong></li>
                <li>Draft Posts: <strong>{stats.draft}</strong></li>
                <li>Posted Posts: <strong>{stats.posted}</strong></li>
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
