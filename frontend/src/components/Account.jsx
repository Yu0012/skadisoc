import React, { useState, useEffect, useRef } from "react";
import "../styles.css";
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { createPortal } from "react-dom";
import { FaAngleLeft, FaAnglesLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";
import CreateUserForm from "../components/CreateUserForm";


const Accounts = () => {
  //ui and data states
  const [accounts, setAccounts] = useState([]);
  const [category, setCategory] = useState("Username");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(10);
  const [createUserDropdown, setCreateUserDropdown] = useState(false);

  //refs for modal and outside click detection
  const modalRef = useRef(null);
  const mainContentRef = useRef(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);

  // Account details 
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleType, setRoleType] = useState("admin");
  const [password, setPassword] = useState("");

  //Edit & Delete Dropdown
  const [accountMenuDropdown, setAccountMenuDropdown] = useState(null);
  const [accountMenuPosition, setAccountMenuPosition] = useState({ top: 0, left: 0 });

  // Edit Account
  const [editAccount, setEditAccount] = useState(null);


  // Fetch accounts from MongoDB
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users");
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.reverse());
        } else {
          console.error("Failed to fetch accounts");
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  //menu dropdown handler
  const menuDropdown = (event, accountId) => {
    event.stopPropagation();
    if (accountMenuDropdown === accountId) {
      setAccountMenuDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setAccountMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left });
      setAccountMenuDropdown(accountId);
    }
  };

  // Close popup when clicking outside (may not be good as user may accidentally leave data in form)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close the account dropdown if clicked outside of it
      if (accountMenuDropdown && !event.target.closest(`.post-actions-dropdown`) && !event.target.closest('.popup-icon')) {
        setAccountMenuDropdown(null); // Close the dropdown
      }
    };
  
    // Add event listener on mount
    document.addEventListener("mousedown", handleClickOutside);
  
    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountMenuDropdown]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the user list after deletion
        const updated = accounts.filter((acc) => acc._id !== id);
        setAccounts(updated);
      } else {
        console.error('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  //search input and category changes handlers 
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


  // Save new account to MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const accountData = {username,email , password, roleType,};
    const isEditing = !!editAccount;
  
    try {
      const response = await fetch(
        isEditing
          ? `http://localhost:5000/api/users/${editAccount._id}`
          : "http://localhost:5000/api/users",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(accountData),
        }
      );
  
      if (!response.ok) throw new Error("Save failed");
  
      const result = await response.json();
      const saved = result.account || result;
  
    const fetchAccounts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users");
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.reverse());
        } else {
          console.error("Failed to fetch accounts");
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

      fetchAccounts();

      // Reset state
      setEditAccount(null);
      setCreateUserDropdown(false);
      setName("");
      setPassword("");
    } catch (err) {
      console.error("Account save error:", err);
      alert("Failed to save account.");
    }
  };
  

  // Filter accounts based on search query and selected category
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

  // Pagination Logic
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);

   //handles for ui inputs
   const handleRefresh = () => window.location.reload();


  return (
    <div ref={mainContentRef} className={`posts-container ${createUserDropdown ? "blurred" : ""}`}>
      {/* Top Section */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-container">
        <div className="search-container-left">
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
        </div>

        <div className="posts-actions">
        <FaSyncAlt className="refresh-icon" title="Refresh Data" onClick={handleRefresh}/>
          <button className="create-user-btn" onClick={toggleCreateUserDropdown}>
              <FaPlus /> Add User
            </button>
        </div>
      </div>

      {createUserDropdown &&
        createPortal(
          <CreateUserForm
            username={username}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            role={roleType}
            setRole={setRoleType}
            onClose={toggleCreateUserDropdown}
            onSubmit={handleSubmit}
            isEditing={!!editAccount}
          />,
          document.body
        )}


      {/* Accounts Table */}
      <table className="posts-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Access</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentAccounts.map((account) => (
            <tr key={account._id}>
              <td>{account.username}</td>
              <td>{account.email}</td>
              <td>{account.roleType}</td>
              <td>{Array.isArray(account.assignedClients) ? account.assignedClients.join(', ') : account.assignedClients}</td>
              <td>
              <FaEllipsisV className="popup-icon" onClick={(e) => menuDropdown(e, account._id)} />

                {accountMenuDropdown === account._id &&
                  createPortal(
                    <div
                      className="post-actions-dropdown"
                      style={{ top: accountMenuPosition.top, left: accountMenuPosition.left }}
                    >
                      <button onClick={() => handleEditAccount(account)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(account._id)}>Delete</button>
                    </div>,
                    document.body
                  )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination-container">
        <p>
          Showing {indexOfFirstAccount + 1} to{" "}
          {Math.min(indexOfLastAccount, filteredAccounts.length)} of{" "}
          {filteredAccounts.length} entries
        </p>
        <div className="pagination">
          <FaAnglesLeft 
            className="pagination-navigation" 
            onClick={() => setCurrentPage(1)} 
            disabled={currentPage === 1}
          />
          <FaAngleLeft 
            className="pagination-navigation" 
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          />
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
          <FaAngleRight 
            className="pagination-navigation"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          />
          <FaAnglesRight
            className="pagination-navigation"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          />
        </div>
      </div>

    </div>
  );
};

export default Accounts;
