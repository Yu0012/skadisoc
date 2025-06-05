import React, { useState, useEffect } from "react"; 
import { ImCross } from "react-icons/im";
import axios from 'axios';
import "./CreateUserForm.css";
import rolePermissions from '../utils/rolePermissions';
import roleTypePermissions from '../utils/roleTypePermissions';

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


  useEffect(() => {
    if (roleType) {
      setAvailableMenus(roleTypePermissions[roleType]?.menus || []);
    }
    if (role) {
      setAvailableActions(rolePermissions[role]?.actions || []);
    }
  }, [role, roleType]);

  const handlePlatformChange = async (platform) => {
    setSelectedPlatform(platform);
    setPlatformClients([]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/clients/${platform}/unassigned`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch unassigned platform clients");
      const data = await res.json();
      setPlatformClients(data.clients);
    } catch (err) {
      console.error(`Error loading ${platform} unassigned clients:`, err);
    }
  };

  useEffect(() => {
    handlePlatformChange("facebook");
  }, []);

  return (
    <div className="newUserMenu">
      <ImCross className="exitButton" onClick={onClose} />
      <form className="form-group" onSubmit={onSubmit}>
        <a className="form-title">{isEditing ? "Edit User" : "Create New User"}</a>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-two-column">
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
            <label>Role Type:
              <select value={roleType} onChange={(e) => setRoleType(e.target.value)} required>
                <option value="">Select Role Type</option>
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </label>
            <label>Role:
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
          </div>

          <div className="form-right-column">
            <div className="permissions-display">
              <h4>Assigned Permissions</h4>
              <div className="permission-section">
                <h5>Menus (based on Role Type):</h5>
                {availableMenus.length > 0 ? (
                  <ul>{availableMenus.map(menu => <li key={menu}>{menu}</li>)}</ul>
                ) : (
                  <p>No menus assigned</p>
                )}
              </div>
              <div className="permission-section">
                <h5>Actions (based on Role):</h5>
                {availableActions.length > 0 ? (
                  <ul>{availableActions.map(action => <li key={action}>{action}</li>)}</ul>
                ) : (
                  <p>No actions assigned</p>
                )}
              </div>
            </div>

            <div className="client-assignment">
              <h4>Assigned Clients (Optional)</h4>
              <div className="platform-navbar">
                {["facebook", "instagram", "twitter"].map((platform) => (
                  <button
                    key={platform}
                    className={selectedPlatform === platform ? "active" : ""}
                    onClick={() => handlePlatformChange(platform)}
                    type="button"
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </button>
                ))}
              </div>

              {platformClients.length > 0 && (
                <div className="client-checkboxes">
                  <label>Assign {selectedPlatform} Clients:</label>
                  <div className="assign-users-container">
                    {platformClients.map((client) => {
                      const isChecked =
                        selectedPlatform === "facebook"
                          ? facebookClients.includes(client._id)
                          : selectedPlatform === "instagram"
                          ? instagramClients.includes(client._id)
                          : twitterClients.includes(client._id);

                          const toggleClient = (platform, clientId) => {
                            setSelectedClients((prev) => {
                              const current = prev[platform] || [];
                              return {
                                ...prev,
                                [platform]: current.includes(clientId)
                                  ? current.filter(id => id !== clientId)
                                  : [...current, clientId]
                              };
                            });
                          };

                      return (
                        <label key={client._id}>
                          <input type="checkbox" checked={isChecked} onChange={toggleClient} />
                          {client.companyName || client.username || client.pageName || client._id}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <input className="create-post-btn" type="submit" value="Save" style={{color: "white"}} />
      </form>
    </div>
  );
};

export default CreateUserForm;
