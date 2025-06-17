// export default UserProfile;
import React, { useState, useEffect } from "react";
import "../styles.css";
import config from "../config"; // Adjust the path as necessary
import Swal from "sweetalert2";




const UserProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);
  const [updatedData, setUpdatedData] = useState({ username: '', email: '' });
  const [user, setUser] = useState({});
  const [UserId, setUserId] = useState(null);
  



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

        if (!response.ok || !data.username) {
          console.error("Failed to fetch profile: No user in response");
          return;
        }

        setUser({
          id: data._id,
          username: data.username,
          email: data.email,
          role: data.role,
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

  const handleEdit = () => {
    setUpdatedData({
      username: user.username || '',
      email: user.email || '',
    });
    setEditMode(true);
  };


  const handleChange = (e) => {
    setUpdatedData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };


  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const { username, email } = updatedData;

    try {
      const usernameRes = await fetch(`${config.API_BASE}/api/auth/user/username/${user.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });

      const emailRes = await fetch(`${config.API_BASE}/api/auth/user/email/${user.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!usernameRes.ok || !emailRes.ok) {
        throw new Error('Failed to update username or email');
      }

      // Manually update user state since backend doesn't return updated user
      setUser(prev => ({
        ...prev,
        username,
        email,
      }));

      setEditMode(false);
      Swal.fire("✅ Updated!", "Your profile was updated.", "success");
    } catch (error) {
      console.error("❌ Update failed:", error);
      Swal.fire("❌ Error", "Update failed. Please try again.", "error");
    }
  };


  const handleCancel = () => {
    setEditMode(false);
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
      <div className="avatar-user-profile">
        {user?.username ? (
          <span className="avatar-letter-user-profile">{user.username.charAt(0).toUpperCase()}</span>
        ) : (
          <span className="avatar-letter-user-profile">?</span>
        )}
      </div>


        {editMode ? (
          <div className="profile-form">
            <input
              type="text"
              name="username"
              value={updatedData.username}
              onChange={handleChange}
              className="profile-input"
              placeholder="Insert Name Here"
            />
            <input
              type="email"
              name="email"
              value={updatedData.email}
              onChange={handleChange}
              className="profile-input"
              placeholder="Insert Email Here"
            />

            <div className="profile-btn-group">
              <button onClick={handleSave} className="save-btn">Save</button>
              <button onClick={() => setEditMode(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p><strong>Name:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>

            <button onClick={handleEdit} className="edit-btn">✏️ Edit Profile</button>


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
