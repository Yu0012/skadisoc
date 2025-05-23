import React, { useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import "./CreateUserForm.css";


const CreateUserForm = ({
  username, setName,
  email, setEmail,
  password, setPassword,
  role, setRole,
  assignedClients, setAssignedClients,
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
  const [facebookOptions, setFacebookOptions] = useState([]);
  const [instagramOptions, setInstagramOptions] = useState([]);
  const [twitterOptions, setTwitterOptions] = useState([]);
  const [platformClients, setPlatformClients] = useState([]);

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
  
  return (
    <div className="newUserMenu">
      <ImCross className="exitButton" onClick={onClose} />
      <form className="form-group" onSubmit={onSubmit}>
        <a className="form-title">{isEditing ? "Edit User" : "Create New User"}</a>
        <label>Name: <input type="text" className="newAccountForm" value={username} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <label>Role:
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label>Assigned Clients:</label>
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
            {platformClients.map((client) => (
              <label key={client._id} style={{ display: "block", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  value={client._id}
                  checked={assignedClients.includes(client._id)}
                  onChange={(e) => {
                    const clientId = e.target.value;
                    if (e.target.checked) {
                      setAssignedClients([...assignedClients, clientId]);
                    } else {
                      setAssignedClients(assignedClients.filter((id) => id !== clientId));
                    }
                  }}
                />
                {client.companyName || client.username}
              </label>
            ))}
          </div>
        )}
        <input className="create-post-btn" type="submit" value="Save" />
      </form>
    </div>
  );
};

export default CreateUserForm;
