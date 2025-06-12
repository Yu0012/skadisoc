import React, { useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import axios from 'axios';
import "./CreateUserForm.css";
import rolePermissions from '../utils/rolePermissions';
import roleTypePermissions from '../utils/roleTypePermissions';
import config from '../config';

const CreateUserForm = ({
  username, setName,
  email, setEmail,
  password, setPassword,
  role, setRole,
  roleType, setRoleType,
  onClose,
  onSubmit,
  isEditing,
  setFacebookClients,
  setInstagramClients,
  setTwitterClients,
  facebookClients,
  instagramClients,
  twitterClients,
}) => {
  // 🔐 Local states for handling form fields and platform clients
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const [platformClients, setPlatformClients] = useState([]);
  const [availableMenus, setAvailableMenus] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedClients, setSelectedClients] = useState({
    facebook: [],
    instagram: [],
    twitter: []
  });

  // 🔒 Check if the user is a superadmin + admin before allowing creation
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return setError("No token found");

      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      if (!(tokenPayload.roleType === 'superadmin' && tokenPayload.role === 'admin')) {
        setError("You are not authorized to create users");
      }
    } catch (err) {
      console.error("Invalid token or parsing error", err);
      setError("Authorization failed");
    }
  }, []);

  // 🧠 Load available menus and actions based on role/roleType
  useEffect(() => {
    if (roleType) {
      setAvailableMenus(roleTypePermissions[roleType]?.menus || []);
    }
    if (role) {
      setAvailableActions(rolePermissions[role]?.actions || []);
    }
  }, [role, roleType]);

  // 🌐 Load unassigned clients for the selected platform
  const handlePlatformChange = async (platform) => {
    setSelectedPlatform(platform);
    setPlatformClients([]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.API_BASE}/api/clients/${platform}/unassigned`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch unassigned platform clients");
      const data = await res.json();
      setPlatformClients(data.clients);
    } catch (err) {
      console.error(`Error loading ${platform} unassigned clients:`, err);
    }
  };

  // 📦 Load Facebook clients by default
  useEffect(() => {
    handlePlatformChange("facebook");
  }, []);

  const handleSubmit = (e) => {
  e.preventDefault(); // prevent page reload

  // Validate matching passwords
  if (password !== confirmPassword) {
    setError("❌ Password and Confirm Password must be the same");
    return;
  }

  // Clear any old error and call parent onSubmit
  setError(null);
  onSubmit(e);
};


  return (
    <div className="newUserMenu">
      {/* ❌ Close button */}
      <ImCross className="exitButton" onClick={onClose} />

      {/* 📋 Form start */}
      <form className="form-group" onSubmit={handleSubmit}>
        <a className="form-title">{isEditing ? "Edit User" : "Create New User"}</a>

        {/* 🛑 Error or ✅ success messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-two-column">
          {/* ⬅️ Left column: User details */}
          <div className="form-left-column">
            <label>Username:
              <input type="text" className="newAccountForm" value={username} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label>Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <label>Password:
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>

            <label>Confirm Password:
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </label>

            {/* 🔽 Styled Role Type dropdown */}
            <div className="role-select-wrapper">
              <label>Role Type:</label>
              <select value={roleType} onChange={(e) => setRoleType(e.target.value)} required>
                <option value="">Select Role Type</option>
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* 🔽 Styled Role dropdown */}
            <div className="role-select-wrapper">
              <label>Role:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>

          {/* ➡️ Right column: Permission summary */}
          <div className="form-right-column">
            <div className="permissions-display">
              <h4>Assigned Permissions</h4>

              {/* Menus shown based on Role Type */}
              <div className="permission-section">
                <h5>Menus (based on Role Type):</h5>
                {availableMenus.length > 0 ? (
                  <ul>{availableMenus.map(menu => <li key={menu}>{menu}</li>)}</ul>
                ) : (
                  <p>No menus assigned</p>
                )}
              </div>

              {/* Actions shown based on Role */}
              <div className="permission-section">
                <h5>Actions (based on Role):</h5>
                {availableActions.length > 0 ? (
                  <ul>{availableActions.map(action => <li key={action}>{action}</li>)}</ul>
                ) : (
                  <p>No actions assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 💾 Save button */}
        <input className="create-post-btn" type="submit" value="Save" style={{ color: "white" }} />
      </form>
    </div>
  );
};

export default CreateUserForm;
