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

  // Update available menus and actions when role or roleType changes
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
      const res = await fetch(`http://localhost:5000/api/${platform}-clients`);
      if (!res.ok) throw new Error("Failed to fetch platform clients");
      const data = await res.json();
      setPlatformClients(data);
    } catch (err) {
      console.error(`Error loading ${platform} clients:`, err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        {
          username,
          email,
          password,
          role,
          roleType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('User created successfully!');
      onClose(); // Close the form on success
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  useEffect(() => {
    handlePlatformChange("facebook");
  }, []);

  return (
    <div className="newUserMenu">
      <ImCross className="exitButton" onClick={onClose} />
      <form className="form-group" onSubmit={handleSubmit}>
        <a className="form-title">{isEditing ? "Edit User" : "Create New User"}</a>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-two-column">
          {/* Left Column */}
          <div className="form-left-column">
            <label>Username: 
              <input 
                type="text" 
                className="newAccountForm" 
                value={username} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </label>
            <label>Email: 
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </label>
            <label>Password: 
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </label>
            <label>Confirm Password: 
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </label>
            <label>Role Type:
              <select 
                value={roleType} 
                onChange={(e) => setRoleType(e.target.value)} 
                required
              >
                <option value="">Select Role Type</option>
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </label>
            <label>Role:
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
          </div>

          {/* Right Column - Display only (not editable) */}
          <div className="form-right-column">
            <div className="permissions-display">
              <h4>Assigned Permissions</h4>
              
              <div className="permission-section">
                <h5>Menus (based on Role Type):</h5>
                {availableMenus.length > 0 ? (
                  <ul>
                    {availableMenus.map(menu => (
                      <li key={menu}>{menu}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No menus assigned</p>
                )}
              </div>
              
              <div className="permission-section">
                <h5>Actions (based on Role):</h5>
                {availableActions.length > 0 ? (
                  <ul>
                    {availableActions.map(action => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No actions assigned</p>
                )}
              </div>
            </div>

            {/* <div className="client-assignment">
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

                      const toggleClient = () => {
                        const setList =
                          selectedPlatform === "facebook"
                            ? setFacebookClients
                            : selectedPlatform === "instagram"
                            ? setInstagramClients
                            : setTwitterClients;

                        const currentList =
                          selectedPlatform === "facebook"
                            ? facebookClients
                            : selectedPlatform === "instagram"
                            ? instagramClients
                            : twitterClients;

                        if (isChecked) {
                          setList(currentList.filter((id) => id !== client._id));
                        } else {
                          setList([...currentList, client._id]);
                        }
                      };

                      return (
                        <label key={client._id}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={toggleClient}
                          />
                          {client.companyName || client.username}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div> */}
          </div>
        </div>
        <input 
          className="create-post-btn" 
          type="submit" 
          value="Save" 
          style={{color: "white"}}
        />
      </form>
    </div>
  );
};

export default CreateUserForm;