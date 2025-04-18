import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaSyncAlt, FaPlus, FaEllipsisV } from "react-icons/fa";
import { CiViewTable } from "react-icons/ci";
import AddClientModal from "./AddClientModal";

const Client = () => {
  // State for storing client data from API
  const [clients, setClients] = useState([]);
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for controlling modal visibility
  const [showClientModal, setShowClientModal] = useState(false);
  
  // State for client being edited (null when adding new client)
  const [editClient, setEditClient] = useState(null);
  
  // State for tracking which client's dropdown menu is open
  const [popupOpen, setPopupOpen] = useState(null);
  
  // State for toggling between card and table views
  const [changeView, setChangeView] = useState(false);
  
  // Ref for detecting clicks outside dropdown menus
  const popupRef = useRef(null);

  // State for social media account credentials
  const [socialMediaAccounts, setSocialMediaAccounts] = useState({
    Facebook: { companyToken: "", pageId: "" },
    Twitter: {
      apiKey: "",
      apiKeySecret: "",
      accessToken: "",
      accessTokenSecret: ""
    },
    LinkedIn: { companyToken: "", pageId: "" },
    Instagram: { companyToken: "", pageId: "" },
  });

  // Fetch clients data from API when component mounts
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/clients");
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchClients();
  }, []);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setPopupOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dropdown menu for a specific client
  const togglePopup = (clientId) => {
    setPopupOpen(popupOpen === clientId ? null : clientId);
  };

  // Toggle between card and table views
  const toggleView = () => {
    setChangeView((prev) => !prev);
  };

  // Open modal to add new client
  const handleAddClient = () => {
    setEditClient(null);
    setShowClientModal(true);
  };

  // Open modal to edit existing client
  const handleEditClient = (client) => {
    setEditClient(client);
    setShowClientModal(true);
    setPopupOpen(null);
  };

  // Save client data (both create and update)
  const handleSaveClient = async (clientData) => {
    try {
      const url = editClient
        ? `http://localhost:5000/api/clients/${editClient._id}`
        : "http://localhost:5000/api/clients";
      const method = editClient ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      if (!res.ok) throw new Error("Save failed");
      const result = await res.json();

      // Update clients list
      if (editClient) {
        setClients((prev) =>
          prev.map((c) => (c._id === editClient._id ? result.client : c))
        );
      } else {
        setClients((prev) => [...prev, result.client]);
      }

      setShowClientModal(false);
      setEditClient(null);
    } catch (err) {
      console.error("Error saving client:", err);
      alert("Failed to save client");
    }
  };

  // Delete a client with confirmation
  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");
      setClients((prev) => prev.filter((c) => c._id !== clientId));
    } catch (err) {
      console.error("Error deleting client:", err);
    }
  };

  // Filter clients based on search query
  const filteredClients = clients.filter((c) =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`posts-container ${showClientModal ? "blurred" : ""}`}>
      {/* Header Section - Only this part was reorganized */}
      <div className="posts-header">
        {/* Welcome message at top */}
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>

        {/* Search and actions below welcome message */}
        <div className="posts-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search clients"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
          <div className="icon-row">
            <FaSyncAlt className="refresh-icon" title="Refresh Data" />
            <CiViewTable size={30} className="action-icon" onClick={toggleView} title="Toggle View" />
          </div>
        </div>
      </div>

      {/* Card View */}
      {!changeView && (
        <div className="client-list">
          <button className="add-client-btn" onClick={handleAddClient}>
            <FaPlus />
            <p>Add Client</p>
          </button>
          {filteredClients.map((client) => (
            <div key={client._id} className="client-object">
              <div className="popup-container">
                <FaEllipsisV className="popup-icon" onClick={() => togglePopup(client._id)} />
                {popupOpen === client._id && (
                  <div className="post-actions-dropdown" ref={popupRef}>
                    <button onClick={() => handleEditClient(client)}>Edit</button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteClient(client._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <h3 className="client-name">{client.companyName}</h3>
              <p className="client-description">{client.companyDetail}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {changeView && (
        <table className="posts-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client._id}>
                <td>{client.companyName}</td>
                <td>{client.companyDetail}</td>
                <td style={{position:"relative"}}>
                  <div className="popup-container-2">
                    <FaEllipsisV
                      className="popup-icon"
                      onClick={() => togglePopup(client._id)}
                    />
                    {popupOpen === client._id && (
                      <div className="post-actions-dropdown" ref={popupRef}>
                        <button onClick={() => handleEditClient(client)}>Edit</button>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteClient(client._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Client Modal */}
      {showClientModal && (
        <AddClientModal
          onClose={() => {
            setShowClientModal(false);
            setEditClient(null);
          }}
          onSubmit={handleSaveClient}
          clientData={editClient}
          socialMediaAccounts={socialMediaAccounts}
          setSocialMediaAccounts={setSocialMediaAccounts}
        />
      )}
    </div>
  );
};

export default Client;