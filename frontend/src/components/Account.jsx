import React, { useState, useEffect, useRef } from "react";
import "../styles.css";
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { createPortal } from "react-dom";

const Accounts = () => {
  // UI and data states
  const [accounts, setAccounts] = useState([]);
  const [category, setCategory] = useState("Username");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(10);
  const [createUserDropdown, setCreateUserDropdown] = useState(false);

  // Refs for modal and outside click detection
  const modalRef = useRef(null);
  const mainContentRef = useRef(null);

  // Checkbox selection states
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Form fields for new account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  // Fetch accounts from backend on mount
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

  // Checkbox selection handlers
  const handleCheckboxChange = (accountId) => {
    setSelectedAccounts((prevSelected) =>
      prevSelected.includes(accountId)
        ? prevSelected.filter((id) => id !== accountId)
        : [...prevSelected, accountId]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAccounts([]);
    } else {
      const allAccountIds = filteredAccounts.map((account) => account._id);
      setSelectedAccounts(allAccountIds);
    }
    setIsAllSelected(!isAllSelected);
  };

  const handleDeselectAll = () => {
    setSelectedAccounts([]);
  };

  // Search input and category change handlers
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // Toggle Add User modal visibility
  const toggleCreateUserDropdown = () => {
    setCreateUserDropdown(!createUserDropdown);
  };

  // Close modal if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setCreateUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create a new account
  const handleSubmit = async (event) => {
    event.preventDefault();

    const newAccount = { name, email, phoneNum, address, password };

    try {
      const response = await fetch("http://localhost:5000/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });

      if (response.ok) {
        const savedAccount = await response.json();
        setAccounts([...accounts, savedAccount]);
        setCreateUserDropdown(false);
        setName("");
        setEmail("");
        setPhoneNum("");
        setAddress("");
        setPassword("");
      } else {
        console.error("Failed to save account");
      }
    } catch (error) {
      console.error("Error saving account:", error);
    }
  };

  // Filter accounts based on selected category and search query
  const filteredAccounts = accounts.filter((account) => {
    if (!searchQuery) return true;

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

  // Pagination logic
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);

  // Automatically update "select all" checkbox
  useEffect(() => {
    const allChecked =
      filteredAccounts.length > 0 &&
      selectedAccounts.length === filteredAccounts.length;
    setIsAllSelected(allChecked);
  }, [selectedAccounts, filteredAccounts]);

  return (
    <div ref={mainContentRef} className={`posts-container ${createUserDropdown ? "blurred" : ""}`}>
      {/* Header Section */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>
      </div>

      {/* Search + Filter Section */}
      <div className="search-container">
        {/* Category filter dropdown */}
        <select className="dropdown" value={category} onChange={handleCategoryChange}>
          <option value="ID">ID</option>
          <option value="Username">Username</option>
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="Address">Address</option>
        </select>

        {/* Search bar */}
        <div className="search-box">
          <input
            type="text"
            placeholder={`Search by ${category}`}
            value={searchQuery}
            onChange={handleSearch}
          />
          <FaSearch className="search-icon" />
        </div>

        {/* Add user button + refresh */}
        <button className="create-user-btn" onClick={toggleCreateUserDropdown}>
          <FaPlus /> Add User
        </button>
        <FaSyncAlt className="refresh-icon" title="Refresh Data" />
      </div>

      {/* Add User Modal */}
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
            <th>
              <input
                type="checkbox"
                id="checkbox-selectAll"
                checked={isAllSelected}
                onChange={handleSelectAll}
              />
            </th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone No.</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {currentAccounts.map((account) => (
            <tr key={account._id}>
              <td>
                <input
                  type="checkbox"
                  className="checkbox-rowSelection"
                  checked={selectedAccounts.includes(account._id)}
                  onChange={() => handleCheckboxChange(account._id)}
                />
              </td>
              <td>{account.name}</td>
              <td>{account.email}</td>
              <td>{account.phoneNum}</td>
              <td>{account.address}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Actions for selected users */}
      {selectedAccounts.length > 0 && (
        <div className="checkbox-selection">
          <button className="unselect-selected-btn" onClick={handleDeselectAll}>
            Deselect All
          </button>
          <button className="delete-selected-btn">
            Delete Selected Accounts
          </button>
        </div>
      )}
    </div>
  );
};

export default Accounts;
