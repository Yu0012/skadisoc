import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaSyncAlt, FaPlus, FaEllipsisV } from "react-icons/fa";
import AddClientModal from "./AddClientModal";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import "../styles.css";
import { FaAngleLeft, FaAnglesLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";
import config from '../config';


const MySwal = withReactContent(Swal);

const Client = () => {
  // ========== STATE MANAGEMENT ==========

  // User data states
  const [username, setUsername] = useState("");
  // Client data states
  const [clients, setClients] = useState([]); // Stores all client data
  const [searchQuery, setSearchQuery] = useState(""); // Search input value
  
  // Modal and dropdown states
  const [showClientModal, setShowClientModal] = useState(false); // Controls add/edit client modal
  const [editClient, setEditClient] = useState(null); // Stores client being edited
  const [popupOpen, setPopupOpen] = useState(null); // Tracks which client's popup is open
  
  // Platform selection states
  const [activePlatform, setActivePlatform] = useState(
    localStorage.getItem("selectedPlatform") || "Facebook" // Currently selected platform
  );
  
  // Menu dropdown states
  const [clientMenuDropdown, setClientMenuDropdown] = useState(null); // Tracks which client's menu is open
  const [clientMenuPosition, setClientMenuPosition] = useState({ top: 0, left: 0 }); // Menu position

  // ========== REFS & CONSTANTS ==========
  const popupRef = useRef(null); // Reference for popup container
  const platformSlug = activePlatform.toLowerCase(); // Platform name in lowercase for API URLs
  const baseUrl = `${config.API_BASE}/api/clients/${platformSlug}`; // Base API endpoint
  const clientsPerPage = 7; // Number of clients to show per page (if implementing pagination)



  const fetchClients = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${baseUrl}/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch clients");
    const data = await res.json();
    setClients(data.clients || []);
  } catch (err) {
    console.error(`Error fetching clients:`, err);
    setClients([]);
  }
};

  // ========== INITIALIZATION ==========
  // Fetch user info when component mounts
    useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const res = await fetch(`${config.API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user info");

        const data = await res.json();
        setUsername(data.username); // username is sent from backend
      } catch (err) {
        console.error("User info fetch error:", err);
      }
    };

    fetchUserInfo();
  }, []);

  // ========== DATA FETCHING ==========
  // Fetch clients when component mounts or platform changes
  useEffect(() => {
    const fetchClients = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${baseUrl}/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch clients");
        const data = await res.json();
        setClients(data.clients || []);
      } catch (err) {
        console.error(`Error fetching clients:`, err);
        setClients([]); // Reset clients on error
      }
    };
    fetchClients();
  }, [activePlatform, baseUrl]);

  // ========== EVENT HANDLERS ==========
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clientMenuDropdown !== null && !e.target.closest(".post-actions-dropdown") && !e.target.closest(".popup-icon")) {
        setClientMenuDropdown(null);
      }
      if (popupOpen !== null && !e.target.closest(".post-actions-dropdown") && !e.target.closest(".popup-icon")) {
        setPopupOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupOpen, clientMenuDropdown]);

  /**
   * Handles client deletion with confirmation dialog
   * @param {string} clientId - ID of the client to delete
   */
  const handleDeleteClient = async (clientId) => {
    // setPopupOpen(null);
    // setClientMenuDropdown(null);

    // Find client to get their name for confirmation message
    const client = clients.find(c => c._id === clientId);
    const clientName = client?.pageName || client?.username || client?.name || "this client";

    // Show confirmation dialog
    const result = await MySwal.fire({
      icon: 'warning',
      title: 'Confirm Deletion',
      html: `You're about to delete <strong>${clientName}</strong>. This action cannot be undone.`,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      backdrop: `rgba(0,0,0,0.7) left top no-repeat`,
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
        backdrop: 'animate__animated animate__fadeIn'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        htmlContainer: 'swal-html',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      },
      willOpen: () => {
        document.body.classList.add('swal-blur');
        document.querySelector('.posts-container')?.classList.add('swal-blur-container');
      },
      preConfirm: () => true,  // ensures fire() resolves correctly on confirm
      willClose: () => {
        document.body.classList.remove('swal-blur');
        document.querySelector('.posts-container')?.classList.remove('swal-blur-container');
      },
      didClose: () => {
        setPopupOpen(null);
        setClientMenuDropdown(null);
      }

    });

    // If user confirms deletion
    if (result.isConfirmed) {
      try {
        // Show loading indicator
        MySwal.fire({
          title: 'Deleting...',
          html: 'Please wait while we remove the client',
          allowOutsideClick: false,
          didOpen: () => { MySwal.showLoading(); }
        });

        // Send DELETE request to API
        const res = await fetch(`${baseUrl}/${clientId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (!res.ok) throw new Error(res.statusText || "Delete failed");

        // Show success message
        await MySwal.fire({
          icon: 'success',
          title: 'Deleted!',
          html: `<strong>${clientName}</strong> has been removed.`,
          showConfirmButton: false,
          timer: 2000,
          showClass: { popup: 'animate__animated animate__zoomIn' },
          hideClass: { popup: 'animate__animated animate__zoomOut' }
        });
        await fetchClients();
        // Update client list
        setClients(prev => prev.filter(c => c._id !== clientId));
      } catch (err) {
        console.error("Delete error:", err);
        // Show error message
        await MySwal.fire({
          icon: 'error',
          title: 'Failed to Delete',
          text: err.message || 'Could not delete client. Please try again.',
          showClass: { popup: 'animate__animated animate__headShake' }
        });
      }
    }else if (result.isDismissed) {
      // Clean up blur and dropdown if user cancelled
      document.body.classList.remove('swal-blur');
      document.querySelector('.posts-container')?.classList.remove('swal-blur-container');
      setPopupOpen(null);
      setClientMenuDropdown(null);
    }



  };

  // Toggle client action popup
  const togglePopup = (clientId) => {
    setPopupOpen(popupOpen === clientId ? null : clientId);
  };

  // Handle client menu dropdown
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

  // Open add client modal
  const handleAddClient = () => {
    setEditClient(null);
    setShowClientModal(true);
  };

  /**
   * Loads client data for editing
   * @param {Object} client - The client to edit
   */
  const handleEditClient = async (client) => {
    try {
      // Fetch full client data
      const res = await fetch(`${baseUrl}/${client._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const fullClient = await res.json();
      if (!res.ok || !fullClient._id) throw new Error("Invalid client data");
      
      // Set up modal for editing
      setEditClient(fullClient);
      setShowClientModal(true);
      setPopupOpen(null);
      setClientMenuDropdown(null);
    } catch (err) {
      console.error("Error loading client data:", err);
    }
  };

  /**
   * Saves client data (create or update)
   * @param {Object} clientData - The client data to save
   */
  const handleSaveClient = async (clientData) => {
    try {
      const platform = (clientData.platform || activePlatform).toLowerCase();
      const baseUrl = `${config.API_BASE}/api/clients/${platform}`;
      const url = clientData._id ? `${baseUrl}/${clientData._id}` : baseUrl;
      const method = clientData._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(clientData)
      });

      if (!res.ok) throw new Error("Save failed");

      // Refresh the list
      const fetchRes = await fetch(`${baseUrl}/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await fetchRes.json();
      setClients(data.clients || []);

      setShowClientModal(false);
      setEditClient(null);
    } catch (err) {
      console.error("Error saving client:", err);
      MySwal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Failed to save client data'
      });
    }
  };


  // Refresh the page
  const handleRefresh = () => {
    MySwal.fire({
      title: 'Refreshing...',
      timer: 1000,
      timerProgressBar: true,
      didOpen: () => { MySwal.showLoading(); },
      willClose: () => { window.location.reload(); }
    });
  };

  // Filter clients based on search query
  const filteredClients = clients.filter((c) => {
    const name = c.companyName || c.pageName || c.username || c.name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ========== RENDER ==========
  return (
    <div className={`posts-container ${showClientModal ? "blurred" : ""}`}>
      {/* Header Section */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">{username || "Loading..."}</h2>
        </div>
      </div>

      {/* Search and Actions Section */}
      <div className="search-container">
        {/* Search Box */}
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

        {/* Action Buttons and Platform Toggle */}
        <div className="posts-actions">
          <div className="icon-row">
            {/* Refresh Button */}
            <FaSyncAlt 
              className="refresh-icon" 
              title="Refresh Data" 
              onClick={handleRefresh} 
            />
            
            {/* Platform Toggle Group */}
            <div className="platform-toggle-group">
              {["Facebook", "Instagram", "Twitter"].map((platform) => (
                <button
                  key={platform}
                  className={`platform-toggle-btn ${activePlatform === platform ? "active" : ""}`}
                  onClick={() => {
                    setActivePlatform(platform);
                    localStorage.setItem("selectedPlatform", platform);
                  }}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="client-list">
        {/* Add Client Button */}
        <button className="add-client-btn" onClick={handleAddClient}>
          <FaPlus />
          <p>Add Client</p>
        </button>

        {/* Client Cards */}
        {filteredClients.map((client) => (
          <div key={client._id} className="client-object">
            {/* Client Actions Dropdown */}
            <div className="popup-container">
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

            {/* Client Info */}
            <h3 className="client-name">
              {client.pageName || client.username || client.name || "Unnamed Client"}
            </h3>
            <p className="client-description">
              {client.pageId || client.instagramBusinessId || client.userId}
            </p>
          </div>
        ))}
      </div>
      
      {/* Add/Edit Client Modal */}
      {showClientModal && (
        <AddClientModal
          onClose={() => {
            setShowClientModal(false);
            setEditClient(null);
          }}
          selectedPlatform={activePlatform}
          onSubmit={handleSaveClient}
          clientData={editClient}
        />
      )}
    </div>
  );
};

export default Client;