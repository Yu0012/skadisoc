import React, { useState, useEffect, useRef } from "react";
import "../styles.css"; // Import global styles
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa"; // Icons
import { ImCross } from "react-icons/im"; 
import { createPortal } from "react-dom";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]); // Store accounts from DB
  const [category, setCategory] = useState("Username"); // Default search category
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(10);
  const [createUserDropdown, setCreateUserDropdown] = useState(false);

  const modalRef = useRef(null);
  const mainContentRef = useRef(null);

  // Account details 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  // Fetch accounts from MongoDB
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/accounts");
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        } else {
          console.error("Failed to fetch accounts");
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // Toggle "Add User" popup
  const toggleCreateUserDropdown = () => {
    setCreateUserDropdown(!createUserDropdown);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setCreateUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Save new account to MongoDB
  const handleSubmit = async (event) => {
    event.preventDefault();

    const newAccount = {
      name,
      email,
      phoneNum,
      address,
      password,
    };

    try {
      const response = await fetch("http://localhost:5000/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAccount),
      });

      if (response.ok) {
        const savedAccount = await response.json();
        setAccounts([...accounts, savedAccount]); // Update UI
        setCreateUserDropdown(false); // Close modal
        setName(""); setEmail(""); setPhoneNum(""); setAddress(""); setPassword(""); // Reset form
      } else {
        console.error("Failed to save account");
      }
    } catch (error) {
      console.error("Error saving account:", error);
    }
  };

  // Filter accounts based on search query and selected category
  const filteredAccounts = accounts.filter((account) => {
    if (!searchQuery) return true; // Show all if search query is empty

    switch (category) {
      case "ID":
        return account._id.toString().includes(searchQuery);
      case "Username":
        return account.name.toLowerCase().includes(searchQuery.toLowerCase());
      case "Email":
        return account.email.toLowerCase().includes(searchQuery.toLowerCase());
      case "Phone":
        return account.phoneNum.toLowerCase().includes(searchQuery.toLowerCase());
      case "Address":
        return account.address.toLowerCase().includes(searchQuery.toLowerCase());
      default:
        return true;
    }
  });

  // Pagination Logic
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);

  return (
    <div ref={mainContentRef} className={`posts-container ${createUserDropdown ? "blurred" : ""}`}>
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
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-container">
        {/* Search Category Dropdown */}
        <select className="dropdown" value={category} onChange={handleCategoryChange}>
          <option value="ID">ID</option>
          <option value="Username">Username</option>
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="Address">Address</option>
        </select>

        {/* Search Box */}
        <div className="search-box">
          <input
            type="text"
            placeholder={`Search by ${category}`}
            value={searchQuery}
            onChange={handleSearch}
          />
          <FaSearch className="search-icon" />
        </div>

        <button className="create-user-btn" onClick={toggleCreateUserDropdown}>
          <FaPlus /> Add User
        </button>
      </div>

      {/* Add User Popup */}
      {createUserDropdown &&
        createPortal(
          <div className="newUserMenu" ref={modalRef}>
            <ImCross className="exitButton" onClick={toggleCreateUserDropdown} />
            <form className="form-group" onSubmit={handleSubmit}>
              <a className="form-title">Create New User</a>
              <label>Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></label>
              <label>Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
              <label>Phone: <input type="number" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} required /></label>
              <label>Address: <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required /></label>
              <label>Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
              <input className="create-post-btn" type="submit" value="Save" />
            </form>
          </div>,
          document.body
        )}

      {/* Accounts Table */}
      <table className="posts-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Phone No.</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {currentAccounts.map((account) => (
            <tr key={account._id}>
              <td>{account.name}</td>
              <td>{account.email}</td>
              <td>{account.phoneNum}</td>
              <td>{account.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Accounts;
