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
  
  // Satte to set view for Client Page, whether its block or table view
  const [activeView, setActiveView] = useState(localStorage.getItem("viewMode") || "block");
  
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
    localStorage.setItem("viewMode", view); // <- persists selection
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
              {activeView === "table" && (
                 <button className="create-user-btn" onClick={handleAddClient}>
                   Add Client
                 </button>
               )}
              <div>
                {/* Changes Views of page, whether it's Block View or Table View */}
                <button
                  className={`client-select-view-btn ${activeView === "block" ? "client-select-view-btn-selected" : ""}`}
                  id="left"
                  onClick={() => toggleView("block")}
                  disabled={activeView === "block"}
                >
                Block
                </button>
                <button
                  className={`client-select-view-btn ${activeView === "table" ? "client-select-view-btn-selected" : ""}`}
                  id="right"
                  onClick={() => toggleView("table")}
                  disabled={activeView === "table"}
                >
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Card View */}
      {activeView === "block" && (
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
      {activeView === "table" && (
        <div>
        <table className="posts-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentClients.map((client) => (
              <tr key={client._id}>
                <td>{client.companyName}</td>
                <td>{client.companyDetail}</td>
                <td style={{position:"relative"}}>
                  <div className="popup-container-2">
                    <FaEllipsisV
                      className="popup-icon"
                      onClick={(e) => menuDropdown(e, client._id)} 
                    />
                    {clientMenuDropdown === client._id && 
                     createPortal(
                       <div className="post-actions-dropdown" ref={popupRef} 
                       style={{top: clientMenuPosition.top, left: clientMenuPosition.left
                       }}>
                        <button onClick={() => handleEditClient(client)}>
                          Edit
                        </button>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteClient(client._id)}
                        >
                          Delete
                        </button>
                      </div>,
                      document.body
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {/* Pagination */}
 
         {/* Only show pagination controls if there's more than one page */}
         <div className="pagination-container">
          {/* Shows how many posts */}
           <p>
             Showing {indexOfFirstClient + 1} to {" " }
             {Math.min(indexOfLastClient, filteredClients.length)} of {" "} 
             {filteredClients.length} entries
           </p>
           
          {/* Displays buttons and adds pages depending on number of accounts */}
           <div className="pagination">
             {/* Go to first page */}
             <FaAnglesLeft 
                 className="pagination-navigation" 
                 onClick={() => setCurrentPage(1)} 
                 disabled={currentPage === 1}
             />
 
             {/* Go to previous page */}
             <FaAngleLeft 
               className="pagination-navigation" 
             onClick={() => setCurrentPage(currentPage - 1)}
             disabled={currentPage === 1} 
             />
 
             {/* Page buttons */}
             {[...Array(totalPages).keys()]
               .slice(Math.max(0, currentPage - 2), currentPage + 1)
               .map((number) => (
                 <button
                   key={number + 1}
                   onClick={() => setCurrentPage(number + 1)}
                   className={currentPage === number + 1 ? "active" : ""}
                 >
                   {number + 1}
                 </button>
               ))}
 
             {/* Go to next page */}
             <FaAngleRight 
                 className="pagination-navigation"
                 onClick={() => setCurrentPage(currentPage + 1)}
                 disabled={currentPage === totalPages}
             />
 
             {/* Go to last page */}
             <FaAnglesRight
               className="pagination-navigation"
               onClick={() => setCurrentPage(totalPages)}
               disabled={currentPage === totalPages}
             />
           </div>
         </div>
 
         </div>
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