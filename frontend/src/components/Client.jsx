import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaDownload, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import { ImCross } from "react-icons/im";
import { CiBoxList } from "react-icons/ci";
import { createPortal } from "react-dom";

const Client = () => {
  const [clients, setClients] = useState([]);
  const [category, setCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [clientMenuDropdown, setClientMenuDropdown] = useState(null);
  const [createClientDropdown, setCreateClientDropdown] = useState(false);
  const [editClientDropdown, setEditClientDropdown] = useState(false);
  const [socialMedia, setSocialMedia] = useState("All Social Media");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const modalRef = useRef(null);
  const mainContentRef = useRef(null);

  // Client Details
  const [companyName, setCompanyName] = useState("");
  const [companyDetail, setCompanyDetail] = useState("");
  const [companyToken, setCompanyToken] = useState("");
  const [apiToken, setApiToken] = useState(false);

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

  useEffect(() => {
    if (!createClientDropdown) {
      setCompanyName("");
      setCompanyDetail("");
      setCompanyToken("");
    }
  }, [createClientDropdown]);

  // Function to add new client to database
  const handleSubmit = async (event) => {
    event.preventDefault();

    const newClient = {
      companyName,
      companyDetail,
      companyToken,
      apiToken,
      socialMedia,
    };

    try {
      const response = await fetch("http://localhost:5000/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setCreateClientDropdown(false);
        setEditClientDropdown(false);
        setClientMenuDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={mainContentRef} className={`posts-container ${createClientDropdown || editClientDropdown ? "blurred" : ""}`}>
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
            <input type="text" placeholder="Tap to Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <FaSearch className="search-icon" />
          </div>
        </div>
      </div>

      {/* Filter & Search Section */}
      <div className="search-container">
        <select className="dropdown" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All Categories</option>
          <option>Name</option>
          <option>Description</option>
          <option>Email</option>
        </select>

        <div className="search-box">
          <input type="text" placeholder="Search by keywords" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <FaSearch className="search-icon" />
        </div>

        <button className="export-btn">
          Export <FaDownload />
        </button>

        <div className="fc-toolbar-right">
          <CiBoxList className="list-adjust-size" />
          <HiOutlineAdjustmentsVertical className="list-adjust-size" />
        </div>
      </div>

      {/* Client List */}
      <div className="client-list">
        {/* Add new Clients */}
        <button className="add-client-btn" onClick={createClientMenuDropdown}>
          <FaPlus />
          <p>Add Client</p>
        </button>

        {createClientDropdown &&
          createPortal(
            <div className="newUserMenu" ref={modalRef}>
              <ImCross className="exitButton" onClick={() => setCreateClientDropdown(false)} />
              <form className="form-group" onSubmit={handleSubmit}>
                <a className="form-title">Create New Client</a>
                <label>
                  Company Name
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Type company name here" required />
                </label>
                <label>
                  Company Details
                  <input type="text" value={companyDetail} onChange={(e) => setCompanyDetail(e.target.value)} placeholder="Type company details here" />
                </label>
                <select className="dropdown" value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)}>
                  <option>All Social Media</option>
                  <option>Facebook</option>
                  <option>Twitter</option>
                  <option>LinkedIn</option>
                  <option>Instagram</option>
                </select>
                <label id="client-API-Token">
                  <a>API Token</a>
                  <div className="api-token-row">
                    <span>Token:</span>
                    <input className="api-token-group" type="password" value={companyToken} placeholder="Enter API token here" onChange={(e) => setCompanyToken(e.target.value)} />
                  </div>
                  <div className="checkbox-wrapper">
                    <span>Enabled</span>
                    <input className="api-checkbox" type="checkbox" checked={apiToken} onChange={(e) => setApiToken(e.target.checked)} />
                  </div>
                </label>
                <input className="create-post-btn" type="submit" value="Save" />
              </form>
            </div>,
            document.body
          )}

        {clients.map((client) => (
          <div key={client.id} className="client-object">
            <h3 className="client-name">{client.companyName}</h3>
            <p className="client-description">{client.companyDetail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Client;
