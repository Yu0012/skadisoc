import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaDownload, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa"; // Icons
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import { CiBoxList } from "react-icons/ci";

import clientsData from "../data/clients.json"; // Example data

const Client = () => {
  const [clients, setClients] = useState([]);
  const [category, setCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [clientMenuDropdown, setClientMenuDropdown] = useState(null);

  // Loads clients from data example
  useEffect(() => {
    setClients(clientsData);
  }, []);
  
  // Add new client with unique ID
  const addClient = () => {
    const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
    const newClient = {
      id: newId,
      username: `New Client`,
      desc: "New client details...",
    };

    setClients([...clients, newClient]);
  };

  const getProfilePic = (pic) => {
    try {
      return require(`../assets/${pic}`);
    } catch (error) {
      return require("../assets/client-woman.png"); // Fallback image
    }
  };
  
  //Ensures dropdown menu only drops for the client the user is clicking
  const menuDropdown = (clientId) => {
    setClientMenuDropdown(clientMenuDropdown === clientId ? null : clientId);
  };


  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Refresh Function - Reloads data
  const handleRefresh = () => {
    window.location.reload();
  };

  // Create Post Function (Placeholder for real functionality)
  const handleCreatePost = () => {
    console.log("Redirecting to Create Post Page...");
    // You can add navigation logic here
  };

  return (
    <div className="posts-container">
          {/* Top Section (Welcome Message, Refresh, Create Post and Search Bar) */}
          <div className="posts-header">
            <div className="welcome-message">
              <p>Welcome,</p>
              <h2 className="user-name">Amber Broos</h2>
            </div>
    
            <div className="posts-actions">
              <FaSyncAlt className="refresh-icon" onClick={handleRefresh} title="Refresh Data" />
              <button className="create-post-btn" onClick={handleCreatePost}>
                <FaPlus /> Create Post
              </button>

              <div className="search-box">
                <input type="text" placeholder="Tap to Search" value={searchQuery} onChange={handleSearch} />
                <FaSearch className="search-icon" />
              </div>
            </div>
          </div>
    
          {/* Filter & Search Section */}
          <div className="search-container">
            <select
              className="dropdown"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All Categories</option>
              <option>Name</option>
              <option>Description</option>
              <option>Email</option>
            </select>
    
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by keywords"
                value={searchQuery}
                onChange={handleSearch}
              />
              <FaSearch className="search-icon" />
            </div>
    
            <button className="export-btn">
              Export <FaDownload />
            </button>

            <div className="fc-toolbar-right">
              <CiBoxList className="list-adjust-size"/>
              <HiOutlineAdjustmentsVertical className="list-adjust-size"/>
            </div>
          </div>

      {/* Client List*/ }
      <div className="client-list">
        {/* Add new Clients */ }
        <button className="add-client-btn" onClick={addClient}>
          <FaPlus/> 
          <p>Add Client</p>
      </button>

      {clients.map((client) => (
        <div key={client.id} className="client-object">
          {/* Menu only drops where the ellipsis is clicked at, using client ID */}
          <FaEllipsisV className="client-Ellipsis" onClick={() => menuDropdown(client.id)}/>
          {/* Returns data from JSON file. (Note: For profile pic, just put filename within the JSON file for profile_pic property. 
              Images are in assets folder) */}
          {/* <img src={getProfilePic(client.profile_pic)}  className="client-profile" alt="Client" /> */}
          <h3 className="client-name">{client.username}</h3>
          <p className="client-description">{client.desc}</p>

          {/* Dropdown Menu for Client */}
          {clientMenuDropdown === client.id && (
            <div className="dropdown-menu action">
              <a>Edit</a>
              <a id="Delete">Delete</a>
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  );
};

export default Client;
