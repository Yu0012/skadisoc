import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaSyncAlt, FaPlus, FaEllipsisV } from "react-icons/fa";
import { CiViewTable } from "react-icons/ci";
import AddClientModal from "./AddClientModal";
import { createPortal } from "react-dom";

const Client = () => {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [popupOpen, setPopupOpen] = useState(null);
  const [changeView, setChangeView] = useState(false);
  const popupRef = useRef(null);


  // Social accounts
  const [socialMediaAccounts, setSocialMediaAccounts] = useState({
    Facebook: { companyToken: "", pageId: "" },
    Twitter: { companyToken: "", pageId: "" },
    LinkedIn: { companyToken: "", pageId: "" },
    Instagram: { companyToken: "", pageId: "" },
  });

  // Fetch clients
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

  // Outside click to close popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setPopupOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePopup = (clientId) => {
    setPopupOpen(popupOpen === clientId ? null : clientId);
  };

  const toggleView = () => {
    setChangeView((prev) => !prev);
  };



  //--------- 📌 Client Funtion-------------- //

  const handleAddClient = () => {
    setEditClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = (client) => {
    setEditClient(client);
    setShowClientModal(true);
    setPopupOpen(null);
  };

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

  const filteredClients = clients.filter((c) =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  //--------- 📌End Client-------------- //


  return (
    <div className={`posts-container ${showClientModal ? "blurred" : ""}`}>
      {/* Header */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>

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

      

      {/* Block View */}
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
                  <div className="popup-menu" ref={popupRef}>
                    <button onClick={() => handleEditClient(client)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteClient(client._id)}>Delete</button>
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
                <td stylel={{positon:"relative"}}>
                  <div className="popup-container-2">
                    <FaEllipsisV
                      className="popup-icon"
                      onClick={() => togglePopup(client._id)}
                    />
                    {popupOpen === client._id && (
                      <div className="popup-menu" ref={popupRef}>
                        <button onClick={() => handleEditClient(client)}>Edit</button>
                        <button className="delete-button" onClick={() => handleDeleteClient(client._id)}>Delete</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}


      {/* Modal */}
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
