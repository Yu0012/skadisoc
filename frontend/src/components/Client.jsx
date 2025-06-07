import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaSyncAlt, FaPlus, FaEllipsisV } from "react-icons/fa";
import AddClientModal from "./AddClientModal";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import "../styles.css";
import { FaAngleLeft, FaAnglesLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";

const MySwal = withReactContent(Swal);

const Client = () => {
  // State management
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [popupOpen, setPopupOpen] = useState(null);
  const [activePlatform, setActivePlatform] = useState(localStorage.getItem("selectedPlatform") || "Facebook");
  const [clientMenuDropdown, setClientMenuDropdown] = useState(null);
  const [clientMenuPosition, setClientMenuPosition] = useState({ top: 0, left: 0 });

  // Refs and constants
  const popupRef = useRef(null);
  const platformSlug = activePlatform.toLowerCase();
  const baseUrl = `http://localhost:5000/api/clients/${platformSlug}`;
  const clientsPerPage = 7;

  // Fetch clients data
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
        setClients([]);
      }
    };
    fetchClients();
  }, [activePlatform, baseUrl]);

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

  // Client deletion handler with SweetAlert2
  const handleDeleteClient = async (clientId) => {
    setPopupOpen(null);
    setClientMenuDropdown(null);

    const client = clients.find(c => c._id === clientId);
    const clientName = client?.pageName || client?.username || client?.name || "this client";

    const result = await MySwal.fire({
      icon: 'warning',
      title: <span style={{ fontSize: '1.5rem' }}>Confirm Deletion</span>,
      html: `<p>You're about to delete <strong>${clientName}</strong>. This action cannot be undone.</p>`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      backdrop: `
        rgba(0,0,0,0.7)
        left top
        no-repeat
      `,
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
      willClose: () => {
        document.body.classList.remove('swal-blur');
        document.querySelector('.posts-container')?.classList.remove('swal-blur-container');
      }
    });

    if (result.isConfirmed) {
      try {
        MySwal.fire({
          title: 'Deleting...',
          html: 'Please wait while we remove the client',
          allowOutsideClick: false,
          didOpen: () => { MySwal.showLoading(); }
        });

        const res = await fetch(`${baseUrl}/${clientId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (!res.ok) throw new Error(res.statusText || "Delete failed");

        await MySwal.fire({
          icon: 'success',
          title: 'Deleted!',
          html: `<strong>${clientName}</strong> has been removed.`,
          showConfirmButton: false,
          timer: 2000,
          showClass: { popup: 'animate__animated animate__zoomIn' },
          hideClass: { popup: 'animate__animated animate__zoomOut' }
        });

        setClients(prev => prev.filter(c => c._id !== clientId));
      } catch (err) {
        console.error("Delete error:", err);
        await MySwal.fire({
          icon: 'error',
          title: 'Failed to Delete',
          text: err.message || 'Could not delete client. Please try again.',
          showClass: { popup: 'animate__animated animate__headShake' }
        });
      }
    }
  };

  // Other handler functions
  const togglePopup = (clientId) => {
    setPopupOpen(popupOpen === clientId ? null : clientId);
  };

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

  const handleAddClient = () => {
    setEditClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = async (client) => {
    try {
      const res = await fetch(`${baseUrl}/${client._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const fullClient = await res.json();
      if (!res.ok || !fullClient._id) throw new Error("Invalid client data");
      setEditClient(fullClient);
      setShowClientModal(true);
      setPopupOpen(null);
      setClientMenuDropdown(null);
    } catch (err) {
      console.error("Error loading client data:", err);
    }
  };

  const handleSaveClient = async (clientData) => {
    try {
      const url = editClient ? `${baseUrl}/${clientData._id}` : `${baseUrl}`;
      const method = editClient ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(clientData)
      });

      if (!res.ok) throw new Error("Save failed");

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
        text: 'Failed to save client data',
        showClass: { popup: 'animate__animated animate__headShake' }
      });
    }
  };

  const handleRefresh = () => {
    MySwal.fire({
      title: 'Refreshing...',
      timer: 1000,
      timerProgressBar: true,
      didOpen: () => { MySwal.showLoading(); },
      willClose: () => { window.location.reload(); }
    });
  };

  // Filter and pagination logic
  const filteredClients = clients.filter((c) => {
    const name = c.companyName || c.pageName || c.username || c.name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className={`posts-container ${showClientModal ? "blurred" : ""}`}>
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>
      </div>

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
            <FaSyncAlt 
              className="refresh-icon" 
              title="Refresh Data" 
              onClick={handleRefresh} 
            />
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

      <div className="client-list">
        <button className="add-client-btn" onClick={handleAddClient}>
          <FaPlus />
          <p>Add Client</p>
        </button>
        {filteredClients.map((client) => (
          <div key={client._id} className="client-object">
            <div className="popup-container">
              <FaEllipsisV 
                className="popup-icon" 
                onClick={() => togglePopup(client._id)} 
              />
              {popupOpen === client._id && (
                <div className="post-actions-dropdown" ref={popupRef}>
                  <button onClick={() => handleEditClient(client)}>Edit</button>
                  <button onClick={() => handleAssignAdmin(client)}>Assign Admin</button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDeleteClient(client._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <h3 className="client-name">
              {client.pageName || client.username || client.name || "Unnamed Client"}
            </h3>
            <p className="client-description">
              {client.pageId || client.instagramBusinessId || client.userId}
            </p>
          </div>
        ))}
      </div>
      
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