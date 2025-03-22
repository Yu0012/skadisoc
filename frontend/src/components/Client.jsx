import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaDownload, FaSyncAlt, FaPlus, FaEllipsisV } from "react-icons/fa";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import { CiBoxList } from "react-icons/ci";
import AddClientModal from "./AddClientModal";

const Client = () => {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [popupOpen, setPopupOpen] = useState(null);
  const popupRef = useRef(null);

  // Load clients from database
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/clients");
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  // Toggle popup menu
  const togglePopup = (clientId) => {
    setPopupOpen(popupOpen === clientId ? null : clientId);
  };

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopupOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Open Add modal
  const handleAddClient = () => {
    setEditClient(null);
    setShowClientModal(true);
  };

  // Open Edit modal
  const handleEditClient = (client) => {
    setEditClient(client);
    setShowClientModal(true);
    setPopupOpen(null);
  };

  // Save (Add or Update)
  const handleSaveClient = async (clientData) => {
    try {
      const url = editClient
        ? `http://localhost:5000/api/clients/${editClient._id}`
        : "http://localhost:5000/api/clients";

      const method = editClient ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) throw new Error("Save failed");
      const result = await response.json();

      if (editClient) {
        // update local state
        setClients((prev) =>
          prev.map((c) => (c._id === editClient._id ? result.client : c))
        );
      } else {
        setClients((prev) => [...prev, result.client]);
      }

      setShowClientModal(false);
      setEditClient(null);
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/clients/${clientId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Delete failed");

        setClients((prev) => prev.filter((c) => c._id !== clientId));
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  return (
    <div className={`posts-container ${showClientModal ? "blurred" : ""}`}>
      {/* Top Section */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>

        <div className="posts-actions">
          <FaSyncAlt className="refresh-icon" title="Refresh Data" />
          <button className="create-post-btn" onClick={handleAddClient}>
            <FaPlus /> Create Post
          </button>

          <div className="search-box">
            <input
              type="text"
              placeholder="Tap to Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="client-list">
        <button className="add-client-btn" onClick={handleAddClient}>
          <FaPlus />
          <p>Add Client</p>
        </button>

        {clients.map((client) => (
          <div key={client._id} className="client-object">
            {/* Menu Icon */}
            <div className="popup-container">
              <FaEllipsisV className="popup-icon" onClick={() => togglePopup(client._id)} />
              {popupOpen === client._id && (
                <div className="popup-menu" ref={popupRef}>
                  <button onClick={() => handleEditClient(client)}>Edit</button>
                  <button onClick={() => handleDeleteClient(client._id)}>Delete</button>
                </div>
              )}
            </div>

            {/* Client Info */}
            <h3 className="client-name">{client.companyName}</h3>
            <p className="client-description">{client.companyDetail}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showClientModal && (
        <AddClientModal
          onClose={() => {
            setShowClientModal(false);
            setEditClient(null);
          }}
          onSubmit={handleSaveClient}
          clientData={editClient}
        />
      )}
    </div>
  );
};

export default Client;
