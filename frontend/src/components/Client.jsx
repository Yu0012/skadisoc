import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaDownload, FaSyncAlt, FaPlus, FaEllipsisV } from "react-icons/fa";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import { CiBoxList } from "react-icons/ci";
import AddClientModal from "./AddClientModal";

const Client = () => {
  const [clients, setClients] = useState([]);
  const [category, setCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [createClientDropdown, setCreateClientDropdown] = useState(false);
  const [popupOpen, setPopupOpen] = useState(null);
  const popupRef = useRef(null);

  // Client Details
  const [companyName, setCompanyName] = useState("");
  const [companyDetail, setCompanyDetail] = useState("");
  const [socialMedia, setSocialMedia] = useState("Facebook");

  // Store API tokens and Page IDs for each social media platform
  const [socialMediaAccounts, setSocialMediaAccounts] = useState({
    Facebook: { companyToken: "", pageId: "" },
    Twitter: { companyToken: "", pageId: "" },
    LinkedIn: { companyToken: "", pageId: "" },
    Instagram: { companyToken: "", pageId: "" },
  });

  // Load clients from database
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

  const createClientMenuDropdown = () => {
    setCreateClientDropdown((prev) => !prev);
  };

  const togglePopup = (clientId) => {
    setPopupOpen(popupOpen === clientId ? null : clientId);
  };

  // Close popup when clicking outside
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const socialAccounts = Object.entries(socialMediaAccounts)
      .filter(([_, data]) => data.companyToken || data.pageId) // skip empty ones
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

      if (!response.ok) {
        throw new Error("Failed to add client");
      }

      const savedClient = await response.json();
      setClients((prevClients) => [...prevClients, savedClient]); // Update state
      setCreateClientDropdown(false); // Close modal

      alert("Client successfully added!");
    } catch (error) {
      console.error("Error adding client:", error);
      alert("Failed to add client. Please try again.");
    }
  };

  const handleInputChange = (platform, field, value) => {
    setSocialMediaAccounts((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const handleEditClient = (client) => {
    console.log("Edit client:", client);
    alert(`Editing client: ${client.companyName}`);
    // Add logic here to open an edit modal
  };

  

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
      {/* Top Section */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>

        <div className="posts-actions">
          <FaSyncAlt className="refresh-icon" title="Refresh Data" />
          <button className="create-post-btn">
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
        {/* Add new Clients */}
        <button className="add-client-btn" onClick={createClientMenuDropdown}>
          <FaPlus />
          <p>Add Client</p>
        </button>

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

        {clients.map((client) => (
          <div key={client._id} className="client-object">
            {/* Popup Menu */}
            <div className="popup-container">
              <FaEllipsisV className="popup-icon" onClick={() => togglePopup(client._id)} />
              {popupOpen === client._id && (
                <div className="popup-menu" ref={popupRef}>
                  <button onClick={() => handleEditClient(client)}>Edit</button>
                  <button onClick={() => handleDeleteClient(client._id)}>Delete</button>
                </div>
              )}
            </div>

            {/* Client Details */}
            <h3 className="client-name">{client.companyName}</h3>
            <p className="client-description">{client.companyDetail}</p>
          </div>
        ))}
      </div>


      
    </div>
  );
};

export default Client;
