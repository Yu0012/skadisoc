import React, { useState, useEffect, useRef } from "react";
import "../styles.css";
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { createPortal } from "react-dom";
import { FaAngleLeft, FaAnglesLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";
import CreateUserForm from "../components/CreateUserForm";
import AssignClients from "../components/AssignClients";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import config from '../config';
import axios from 'axios';

const Accounts = () => {

  
  // ========== STATE MANAGEMENT ==========
  // Data states
  const [accounts, setAccounts] = useState([]); // Stores all user accounts
  const [filteredAccounts, setFilteredAccounts] = useState([]); // Stores filtered accounts
  
  // Search states
  const [category, setCategory] = useState("Username"); // Current search category
  const [searchQuery, setSearchQuery] = useState(""); // Search input value
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1); // Current pagination page
  const [accountsPerPage] = useState(8); // Number of accounts per page
  
  // Modal states
  const [createUserDropdown, setCreateUserDropdown] = useState(false); // Create user modal
  const [assignClientPopup, setAssignClientPopup] = useState(false); // Assign clients modal
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // Delete confirmation
  
  // Account selection states
  const [selectedUserId, setSelectedUserId] = useState(null); // ID of user being assigned clients
  const [selectedAccounts, setSelectedAccounts] = useState([]); // Selected accounts for batch operations
  const [accountMenuDropdown, setAccountMenuDropdown] = useState(null); // Tracks which account's menu is open
  const [accountMenuPosition, setAccountMenuPosition] = useState({ top: 0, left: 0 }); // Dropdown position
  
  // Form states
  const [loggedInUsername, setLoggedInUsername] = useState("");

  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer"); // User role (viewer/editor/admin)
  const [roleType, setRoleType] = useState("admin"); // Role type (admin/manager/etc)
  const [password, setPassword] = useState("");
  const [facebookClients, setFacebookClients] = useState([]); // Assigned FB clients
  const [instagramClients, setInstagramClients] = useState([]); // Assigned IG clients
  const [twitterClients, setTwitterClients] = useState([]); // Assigned Twitter clients
  const [menus, setMenus] = useState([]); // Menu permissions
  const [actions, setActions] = useState([]); // Action permissions
  

  //refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit state
  const [editAccount, setEditAccount] = useState(null); // Stores account being edited

  // ========== REFS & HOOKS ==========
  const modalRef = useRef(null);
  const mainContentRef = useRef(null);
  const navigate = useNavigate();

  // ========== DATA FETCHING ==========
  // Fetch accounts from backend API
  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.API_BASE}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data.users);
        setFilteredAccounts(data.users); // Initialize filtered accounts
      } else {
        console.error("Failed to fetch accounts");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

    useEffect(() => {
    const interval = setInterval(() => {
      fetchAccounts();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${config.API_BASE}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user info");

      const data = await res.json();
      setLoggedInUsername(data.username);
    } catch (err) {
      console.error("User info fetch error:", err);
    }
  };

  fetchUserInfo();
}, []);


  // ========== UI HANDLERS ==========
  // Handle click on account menu dropdown
  const menuDropdown = (event, accountId) => {
    event.stopPropagation();
    if (accountMenuDropdown === accountId) {
      setAccountMenuDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setAccountMenuPosition({ 
        top: rect.bottom + window.scrollY, 
        left: rect.left 
      });
      setAccountMenuDropdown(accountId);
    }
  };

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuDropdown && 
          !event.target.closest(`.post-actions-dropdown`) && 
          !event.target.closest('.popup-icon')) {
        setAccountMenuDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountMenuDropdown]);

  // ========== ACCOUNT OPERATIONS ==========
  // Prepare account data for editing
  const handleEditAccount = (account) => {
    setEditAccount(account);
    setName(account.username || "");
    setEmail(account.email || "");
    setPassword(""); // Leave empty for optional password reset
    setRole(account.role || "viewer");
    setRoleType(account.roleType || "admin");
    setFacebookClients(account.facebookClients || []);
    setInstagramClients(account.instagramClients || []);
    setTwitterClients(account.twitterClients || []);
    setMenus(account.permissions?.menus || []);
    setActions(account.permissions?.actions || []);
    setCreateUserDropdown(true);
    setAccountMenuDropdown(null);
  };

  /**
   * Handles the deletion of a user account with confirmation
   * @param {string} id - The ID of the user account to delete
   */
  const handleDelete = async (id) => {
    setAccountMenuDropdown(null); // Close any open account menu dropdown
    setIsDeleteConfirmOpen(true); // Activate blur effect for background
    
    // Show confirmation dialog using SweetAlert
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This user will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      backdrop: true, // Show backdrop for modal focus
    });

    setIsDeleteConfirmOpen(false); // Deactivate blur effect after dialog closes

    // Proceed with deletion if user confirmed
    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      try {
        // Send DELETE request to API endpoint
        const response = await fetch(`${config.API_BASE}/api/auth/users/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Show success notification
          Swal.fire('Deleted!', 'The user has been deleted.', 'success');
          // Refresh the account list
          fetchAccounts();
        } else {
          // Show error if deletion failed
          Swal.fire('Error', 'Failed to delete user', 'error');
        }
      } catch (err) {
        // Show error if network request failed
        Swal.fire('Error', 'An error occurred while deleting the user', 'error');
      }
    }
  };

  // ========== SEARCH & FILTER ==========
  // Handle search input changes
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query) {
      setFilteredAccounts(accounts);
      return;
    }
    
    const filtered = accounts.filter((account) => {
      switch (category) {
        case "ID":
          return account._id.toString().includes(query);
        case "Username":
          return account.username?.toLowerCase().includes(query.toLowerCase());
        case "Email":
          return account.email?.toLowerCase().includes(query.toLowerCase());
        default:
          return true;
      }
    });
    
    setFilteredAccounts(filtered);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle search category change
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // ========== FORM HANDLING ==========
  // Toggle create user modal
  const toggleCreateUserDropdown = () => {
    setEditAccount(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("viewer");
    setRoleType("admin");
    setFacebookClients([]);
    setInstagramClients([]);
    setTwitterClients([]);
    setCreateUserDropdown(!createUserDropdown);
  };

  // Save account (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const accountData = {
      username,
      email, 
      password, 
      role, 
      roleType, 
      facebookClients, 
      instagramClients, 
      twitterClients, 
      permissions: { menus, actions }
    };
  
    try {
      const token = localStorage.getItem("token");
      const url = editAccount 
        ? `${config.API_BASE}/api/auth/users/${editAccount._id}`
        : `${config.API_BASE}/api/auth/register`;
      
      const response = await fetch(url, {
        method: editAccount ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountData),
      });
  
      if (!response.ok) throw new Error("Save failed");

      await fetchAccounts();
      setCreateUserDropdown(false);
      Swal.fire('Success', `Account ${editAccount ? 'updated' : 'created'} successfully`, 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to save account', 'error');
    }
  };

  // ========== PAGINATION LOGIC ==========
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);

  // Pagination navigation functions
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  // Refresh page
    const handleRefresh = () => {
      setIsRefreshing(true);
      Swal.fire({
        title: 'Refreshing...',
        timer: 1000,
        timerProgressBar: true,
        didOpen: () => Swal.showLoading(),
        willClose: () => {
          setIsRefreshing(false);
          window.location.reload(); // or call fetchData() if you only want to re-fetch
        }
      });
    };

  return (
    <div className="account-page-wrapper">
      {/* 🔲 Main content container with conditional blur */}
      <div className={`posts-container ${createUserDropdown || assignClientPopup || isDeleteConfirmOpen ? "blurred" : ""}`}>
        {/* Header Section */}
        <div className="posts-header">
          <div className="welcome-message">
            <p>Welcome,</p>
            <h2 className="user-name">{loggedInUsername || "Loading..."}</h2>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="search-container">
          <div className="search-container-left">
            <select className="dropdown" value={category} onChange={handleCategoryChange}>
              <option value="ID">ID</option>
              <option value="Username">Username</option>
              <option value="Email">Email</option>
            </select>

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

        {/* Accounts Table */}
        <table className="posts-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>RoleType</th>
              <th>Role</th>

              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAccounts.map((account) => (
              <tr key={account._id}>
                <td>{account.username}</td>
                <td>{account.email}</td>
                <td>{account.roleType.charAt(0).toUpperCase() + account.roleType.slice(1)}</td>
                <td>{account.role.charAt(0).toUpperCase() + account.role.slice(1)}</td>
                <td>
                  <FaEllipsisV 
                    className="popup-icon" 
                    onClick={(e) => menuDropdown(e, account._id)} 
                  />
                  {accountMenuDropdown === account._id &&
                    createPortal(
                      <div
                        className="post-actions-dropdown"
                        style={{ top: accountMenuPosition.top, left: accountMenuPosition.left }}
                      >
                        <button onClick={() => handleEditAccount(account)}>Edit</button>
                        {account.role === 'editor' && (
                          <button onClick={() => {
                            setSelectedUserId(account._id);
                            setAssignClientPopup(true);
                            setAccountMenuDropdown(null);
                          }}>
                            Assign Clients
                          </button>
                        )}
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDelete(account._id)}
                        >
                          Delete
                        </button>
                      </div>,
                      document.body
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Fixed Pagination Section */}
      <div className="pagination-fixed">
        <div className="pagination-container">
          <p>
            Showing {indexOfFirstAccount + 1} to{" "}
            {Math.min(indexOfLastAccount, filteredAccounts.length)} of{" "}
            {filteredAccounts.length} entries
          </p>
          <div className="pagination">
            <FaAnglesLeft 
              className={`pagination-navigation ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={goToFirstPage} 
            />
            <FaAngleLeft 
              className={`pagination-navigation ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={goToPrevPage}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                Math.abs(page - currentPage) <= 2
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "active" : ""}
                >
                  {page}
                </button>
              ))}
            <FaAngleRight 
              className={`pagination-navigation ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={goToNextPage}
            />
            <FaAnglesRight
              className={`pagination-navigation ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={goToLastPage}
            />
          </div>
        </div>
      </div>

      {/* ✅ Modal Portals - rendered outside main content */}
      {createUserDropdown && createPortal(
        <CreateUserForm
          username={username}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          role={role}
          setRole={setRole}
          roleType={roleType}
          setRoleType={setRoleType}
          facebookClients={facebookClients}
          setFacebookClients={setFacebookClients}
          instagramClients={instagramClients}
          setInstagramClients={setInstagramClients}
          twitterClients={twitterClients}
          setTwitterClients={setTwitterClients}
          menus={menus}
          setMenus={setMenus}
          actions={actions}
          setActions={setActions}
          onClose={toggleCreateUserDropdown}
          onSubmit={handleSubmit}
          isEditing={!!editAccount}
        />,
        document.body
      )}

      {assignClientPopup && selectedUserId && createPortal(
        <AssignClients
          userId={selectedUserId}
          onClose={() => setAssignClientPopup(false)}
        />,
        document.body
      )}
    </div>
  );
};

export default Accounts;