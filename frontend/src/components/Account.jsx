import React, { useState, useEffect } from "react";
import "../styles.css"; // Import global styles
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa"; // Icons
import accountsData from "../data/accounts.json";
import { createPortal } from "react-dom";


const Accounts = () => {
  const [accounts, setAccounts] = useState([]); // Store accounts data
  const [category, setCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(10);
  const [accountMenuDropdown, setAccountMenuDropdown] = useState(null);  // Triggers dropdown menu
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 }); // Handles positioning for dropdown menu

  useEffect(() => {
    setAccounts(accountsData); // Fetch data from JSON (simulate API call)
  }, []);

  // Toggle dropdown menu & set its position
  const menuDropdown = (event, accountID) => {
    event.stopPropagation(); // Prevents event bubbling
    if (accountMenuDropdown === accountID) {
      setAccountMenuDropdown(null); // Close menu if it's already open
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left });
      setAccountMenuDropdown(accountID);
    }
  };
  
  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu")) {
        setAccountMenuDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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

  // Filtered accounts based on search query
  const filteredAccounts = accounts.filter((account) =>
    account.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);

  return (
    <div className="posts-container">
      {/* Top Section (Welcome Message, Refresh & Create Post) */}
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
          <input
            type="text"
            placeholder="Tap to Search"
            value={searchQuery}
            onChange={handleSearch}
          />
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
          <option>Account</option>
          <option>ID</option>
          <option>Username</option>
          <option>Email</option>
        </select>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by ID/Name"
            value={searchQuery}
            onChange={handleSearch}
          />
          <FaSearch className="search-icon" />
        </div>

        <div className="fc-toolbar-right">
        <button className="create-user-btn" onClick={handleCreatePost}>
            <FaPlus /> User
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <table className="posts-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th></th>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone No.</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentAccounts.map((account) => (
            <tr key={account.id} className="account-row">
              <td><input type="checkbox" /></td>
              <td>{account.entry}</td>
              <td>{account.id}</td>
              <td>{account.username}</td>
              <td>{account.email}</td>
              <td>{account.tele_num}</td>
              <td className="ellipsis-cell">{account.address}</td>
              <td><FaEllipsisV className="account-Ellipsis" onClick={(e) => menuDropdown(e, account.id)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Menu Dropdown content */}
      {accountMenuDropdown !== null &&
        createPortal(
          <div className="dropdown-menu action" style={{ top: menuPosition.top, left: menuPosition.left }}>
            <a>Edit</a>
            <a id="Delete">Delete</a>
          </div>,
          document.body
        )}
      

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          &laquo;
        </button>
        {Array.from({ length: Math.ceil(filteredAccounts.length / accountsPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredAccounts.length / accountsPerPage)}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default Accounts;
