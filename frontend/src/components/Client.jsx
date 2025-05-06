import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaSyncAlt, FaPlus, FaEllipsisV } from "react-icons/fa";
import AddClientModal from "./AddClientModal";
import { createPortal } from "react-dom";
import { FaAngleLeft, FaAnglesLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";

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
  
  // Platform selection state
  const [activePlatform, setActivePlatform] = useState(localStorage.getItem("selectedPlatform") || "Facebook");

  // Ref for detecting clicks outside dropdown menus
  const popupRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 7; // Adjust to fit your layout
  
  //Edit & Delete Dropdown
  const [clientMenuDropdown, setClientMenuDropdown] = useState(null);
  const [clientMenuPosition, setClientMenuPosition] = useState({ top: 0, left: 0 });

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

  useEffect(() => {
    const fetchClients = async () => {
      let url = "";
  
      switch (activePlatform) {
        case "Facebook":
          url = "http://localhost:5000/api/facebook-clients";
          break;
        case "Instagram":
          url = "http://localhost:5000/api/instagram-clients";
          break;
        case "Twitter":
          url = "http://localhost:5000/api/twitter-clients"; // progressing
          break;
        case "LinkedIn":
          url = "http://localhost:5000/api/linkedin-clients"; // waiting for API
          break;
        default:
          return;
      }
  
      try {
        const res = await fetch(url);
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error(`Error fetching ${activePlatform} clients:`, err);
        setClients([]);
      }
    };
  
    fetchClients();
  }, [activePlatform]);
  

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // For table view dropdown (portal)
      if (
        clientMenuDropdown !== null &&
        !e.target.closest(".post-actions-dropdown") &&
        !e.target.closest(".popup-icon")
      ) {
        setClientMenuDropdown(null);
      }
  
      // For block view dropdown
      if (
        popupOpen !== null &&
        !e.target.closest(".post-actions-dropdown") &&
        !e.target.closest(".popup-icon")
      ) {
        setPopupOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupOpen, clientMenuDropdown]);

  // Toggle dropdown menu for a specific client
  const togglePopup = (clientId) => {
    setPopupOpen(popupOpen === clientId ? null : clientId);
  };

    //menu dropdown handler
    const menuDropdown = (event, clientId) => {
      event.stopPropagation();
      if (clientMenuDropdown === clientId) {
        setClientMenuDropdown(null);
      } else {
        const rect = event.currentTarget.getBoundingClientRect();
        setClientMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left });
        setClientMenuDropdown(clientId);
      }
    };


  // Changes view of Client View
   const toggleView = (view) => {
    setActiveView(view);
    localStorage.setItem("selectedPlatform", platform);
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
    setClientMenuDropdown(null);
  };

   //handles for ui inputs
   const handleRefresh = () => window.location.reload();

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
    c.companyName &&
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

    // Pagination
    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  return (
    <div className={`posts-container ${showClientModal ? "blurred" : ""}`}>
      {/* Header Section - Only this part was reorganized */}
      <div className="posts-header">
        {/* Welcome message at top */}
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>
      </div>

        {/* Search and actions below welcome message */}
        <div className="search-container">
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
          </div>
          <div className="posts-actions">
            <div className="icon-row">
              <FaSyncAlt className="refresh-icon" title="Refresh Data" onclick={handleRefresh} id="client"/>
              <div>
                {["Facebook", "Instagram", "Twitter", "LinkedIn"].map((platform) => (
                  <button
                    key={platform}
                    className={`client-select-view-btn ${activePlatform === platform ? "client-select-view-btn-selected" : ""}`}
                    onClick={() => setActivePlatform(platform)}
                  >
                    {platform}
                  </button>
                ))}
            </div>
            </div>
          </div>
        </div>

      {/* Block View for selected platform */}
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