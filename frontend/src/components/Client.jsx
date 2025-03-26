import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaDownload, FaSyncAlt, FaPlus, FaEllipsisV } from "react-icons/fa";
import { CiViewTable, CiBoxList } from "react-icons/ci";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import AddClientModal from "./AddClientModal";
import { createPortal } from "react-dom";

const Client = () => {
  // UI state
  const [clients, setClients] = useState([]); // Client list
  const [category, setCategory] = useState("All Categories"); // (not currently used)
  const [searchQuery, setSearchQuery] = useState(""); // (not currently used)
  const [showClientModal, setShowClientModal] = useState(false); // (not currently used)
  const [editClient, setEditClient] = useState(null); // (for editing client)
  const [createClientDropdown, setCreateClientDropdown] = useState(false); // Controls add client modal visibility
  const [popupOpen, setPopupOpen] = useState(null); // Controls which client's popup menu is open
  const popupRef = useRef(null); // Ref for popup menu outside click
  const [changeView, setChangeView] = useState(false); // View toggle: false = card, true = table

  // Menu dropdown for table view
  const [clientMenuDropdown, setClientMenuDropdown] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Form fields for client info
  const [companyName, setCompanyName] = useState("");
  const [companyDetail, setCompanyDetail] = useState("");
  const [socialMedia, setSocialMedia] = useState("Facebook");

  // Social media credentials per client
  const [socialMediaAccounts, setSocialMediaAccounts] = useState({
    Facebook: { companyToken: "", pageId: "" },
    Twitter: { companyToken: "", pageId: "" },
    LinkedIn: { companyToken: "", pageId: "" },
    Instagram: { companyToken: "", pageId: "" },
  });

  // Fetch clients on load
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/clients");
        if (!response.ok) throw new Error("Failed to fetch clients");
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);

  // Dropdown menu handler for table view
  const menuDropdown = (event, companyName) => {
    event.stopPropagation();
    if (clientMenuDropdown === companyName) {
      setClientMenuDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left });
      setClientMenuDropdown(companyName);
    }
  };

  // Toggle between card and table views
  const setClientView = () => {
    setChangeView((prev) => !prev);
  };

  // Toggle add-client modal
  const createClientMenuDropdown = () => {
    setCreateClientDropdown((prev) => !prev);
  };

  // Toggle popup menu per client (block view)
  const togglePopup = (clientId) => {
    setPopupOpen(popupOpen === clientId ? null : clientId);
  };

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopupOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Submit new client form
  const handleSubmit = async (event) => {
    event.preventDefault();

    const socialAccounts = Object.entries(socialMediaAccounts)
      .filter(([_, data]) => data.companyToken || data.pageId)
      .map(([platform, data]) => ({
        platform,
        companyToken: data.companyToken,
        pageId: data.pageId,
      }));

    const newClient = {
      companyName,
      companyDetail,
      socialAccounts,
    };

    try {
      const response = await fetch("http://localhost:5000/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) throw new Error("Failed to add client");

      const savedClient = await response.json();
      setClients((prevClients) => [...prevClients, savedClient]);
      setCreateClientDropdown(false); // Close modal
      alert("Client successfully added!");
    } catch (error) {
      console.error("Error adding client:", error);
      alert("Failed to add client. Please try again.");
    }
  };

  // Update social media credentials
  const handleInputChange = (platform, field, value) => {
    setSocialMediaAccounts((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  // Trigger edit action
  const handleEditClient = (client) => {
    console.log("Edit client:", client);
    alert(`Editing client: ${client.companyName}`);
    // Replace with modal open logic
  };

  // Delete client
  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/clients/${clientId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete client");

        setClients(clients.filter((client) => client._id !== clientId));
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  return (
    <div className="posts-container">
      {/* Header */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>

        <div className="posts-actions">
          <FaSyncAlt className="refresh-icon" title="Refresh Data" />
          <CiViewTable className="view-icon" title="Change View" onClick={setClientView} />
        </div>
      </div>

      {/* Add Client Modal */}
      {createClientDropdown && (
        <AddClientModal
          onClose={() => setCreateClientDropdown(false)}
          onSubmit={handleSubmit}
          companyName={companyName}
          setCompanyName={setCompanyName}
          companyDetail={companyDetail}
          setCompanyDetail={setCompanyDetail}
          socialMedia={socialMedia}
          setSocialMedia={setSocialMedia}
          socialMediaAccounts={socialMediaAccounts}
          handleInputChange={handleInputChange}
        />
      )}

      {/* Block/Card View */}
      {!changeView && (
        <div>
          <div className="client-list">
            {/* Add Client Button */}
            <button className="add-client-btn" onClick={createClientMenuDropdown}>
              <FaPlus />
              <p>Add Client</p>
            </button>

            {/* Client Cards */}
            {clients.map((client) => (
              <div key={client._id} className="client-object">
                {/* Popup Menu */}
                <div className="popup-container">
                  <FaEllipsisV className="popup-icon" onClick={() => togglePopup(client._id)} />
                  {popupOpen === client._id && (
                    <div className="popup-menu" ref={popupRef}>
                      <button onClick={() => handleEditClient(client)}>Edit</button>
                      <button className="delete-button" onClick={() => handleDeleteClient(client._id)}>Delete</button>
                    </div>
                  )}
                </div>

                {/* Client Info */}
                <h3 className="client-name">{client.companyName}</h3>
                <p className="client-description">{client.companyDetail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table View */}
      {changeView && (
        <div>
          <table className="posts-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Client Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id}>
                  <td>{client.companyName}</td>
                  <td>{client.companyDetail}</td>
                  <td>
                    <FaEllipsisV className="action-icon" onClick={(e) => menuDropdown(e, companyName)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dropdown (Table View) */}
      {clientMenuDropdown !== null &&
        createPortal(
          <div className="post-actions-dropdown" style={{ top: menuPosition.top, left: menuPosition.left }}>
            <button>Edit</button>
            <button>Duplicate</button>
            <button className="delete-btn">Delete</button>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Client;
