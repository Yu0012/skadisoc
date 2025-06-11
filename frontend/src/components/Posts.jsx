import React, { useState, useEffect } from "react";
import "../styles.css";
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa";
import { createPortal } from "react-dom";
import CreatePostModal from "./CreatePostModal";
import { FaAngleLeft, FaAnglesLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";
import facebookIcon from '../assets/facebook.png';
import twitterIcon from '../assets/twitter.png';
import instagramIcon from '../assets/instagram.png';
import linkedinIcon from '../assets/linkedin.png';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Initialize SweetAlert2 with React support
const MySwal = withReactContent(Swal);

const Posts = () => {
  // State declarations with explanations:

  // Stores all posts fetched from the API
  const [posts, setPosts] = useState([]);
  
  // Current selected category filter
  const [category, setCategory] = useState("All Categories");
  
  // Search query input value
  const [searchQuery, setSearchQuery] = useState("");
  
  // Current pagination page number
  const [currentPage, setCurrentPage] = useState(1);
  
  // Number of posts to display per page
  const [postsPerPage] = useState(7);
  
  // ID of the post whose dropdown menu is currently open
  const [postMenuDropdown, setPostMenuDropdown] = useState(null);
  
  // Position coordinates for the dropdown menu
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  // Array of selected post IDs for bulk actions
  const [selectedPosts, setSelectedPosts] = useState([]);
  
  // Controls visibility of the create/edit post modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Stores the post being edited (null when creating new)
  const [editingPost, setEditingPost] = useState(null);
  
  // Tracks if all visible posts are selected
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // Controls visibility of platform selection modal
  const [isPlatformSelectOpen, setIsPlatformSelectOpen] = useState(false);
  
  // Stores the selected platform for new posts
  const [selectedPlatforms, setSelectedPlatforms] = useState(null);
  
  // Configuration for sorting (key and direction)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Mapping of platform names to their icon components
  const platformIcons = {
    facebook: <img src={facebookIcon} className="inline-icon" alt="Facebook" />,
    twitter: <img src={twitterIcon} className="inline-icon" alt="Twitter" />,
    instagram: <img src={instagramIcon} className="inline-icon" alt="Instagram" />,
    linkedin: <img src={linkedinIcon} className="inline-icon" alt="LinkedIn" />
  };

  /**
   * Fetches posts from the backend API
   * Handles authentication with JWT token
   * Updates the posts state with fetched data
   */
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/posts", {
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      MySwal.fire({
        title: 'Error',
        text: 'Failed to fetch posts. Please try again.',
        icon: 'error',
        confirmButtonColor: '#0D286E',
      });
    }
  };

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  /**
   * Handles search input changes
   * @param {Object} e - The event object
   */
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  /**
   * Callback after successful post creation
   * Refreshes the posts list and closes modal
   */
  const handlePostCreated = () => {
    fetchPosts();
    setIsModalOpen(false);
  };

  /**
   * Initiates the post creation flow
   * Opens platform selection first
   */
  const handleCreatePostClick = () => {
    setIsPlatformSelectOpen(true);
  };
  
  /**
   * Handles refresh action with loading indicator
   * Resets filters and pagination after refresh
   */
  const handleRefresh = () => {
    MySwal.fire({
      title: 'Refreshing...',
      timer: 1000,
      timerProgressBar: true,
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading();
      },
      willClose: () => {
        fetchPosts();
        setCurrentPage(1);
        setSearchQuery("");
        setCategory("All Categories");
      }
    });
  };

  /**
   * Initiates post editing flow
   * @param {string} postId - ID of the post to edit
   */
  const handleEditPost = async (postId) => {
    setPostMenuDropdown(null); // Close dropdown
    
    // Fetch full post details
    const fullPost = await fetchPostById(postId);
    if (!fullPost) {
      MySwal.fire({
        title: 'Error',
        text: 'Failed to load post for editing',
        icon: 'error',
        confirmButtonColor: '#0D286E',
      });
      return;
    }

    // Prevent editing of already posted content
    if (fullPost.status === "posted") {
      MySwal.fire({
        title: 'Cannot Edit',
        text: 'Posted content cannot be edited.',
        icon: 'warning',
        confirmButtonColor: '#0D286E',
      });
      return;
    }

    // Set up editing state
    setEditingPost(fullPost);
    setIsModalOpen(true);
  };

  /**
   * Handles post deletion with confirmation dialog
   * @param {string} postId - ID of the post to delete
   */
  const handleDeletePost = async (postId) => {
    setPostMenuDropdown(null); // Close dropdown immediately

    // Show confirmation dialog
    const result = await MySwal.fire({
      title: 'Delete this post?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0D286E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: 'white',
      color: '#0a0f5c',
      backdrop: `
        rgba(0, 0, 0, 0.4)
        left top
        no-repeat
        fixed
        !important
      `,
      didOpen: () => {
        document.body.classList.add("swal-blur");
      },
      willClose: () => {
        document.body.classList.remove("swal-blur");
      },
      customClass: {
        popup: 'swal2-border-radius',
      }
    });

    if (!result.isConfirmed) return;

    try {
      // Send delete request to API
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete post");

      // Update UI by removing deleted post
      setPosts((prev) => prev.filter((p) => p._id !== postId));

      // Show success notification
      await MySwal.fire({
        title: 'Deleted!',
        text: 'Your post has been successfully deleted.',
        icon: 'success',
        confirmButtonColor: '#0D286E',
        background: 'white',
        color: '#0a0f5c',
      });
    } catch (err) {
      console.error("Delete error:", err);
      await MySwal.fire({
        title: 'Error',
        text: 'Failed to delete the post. Please try again.',
        icon: 'error',
        confirmButtonColor: '#0D286E',
        background: 'white',
        color: '#0a0f5c',
      });
    }
  };

  /**
   * Fetches a single post by ID
   * @param {string} id - The post ID to fetch
   * @returns {Object|null} The post data or null if error
   */
  const fetchPostById = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch post");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching post by ID:", error);
      return null;
    }
  };
  
  /**
   * Toggles dropdown menu for a post
   * @param {Object} event - The click event
   * @param {string} postID - The post ID to show menu for
   */
  const menuDropdown = (event, postID) => {
    event.stopPropagation();
    if (postMenuDropdown === postID) {
      setPostMenuDropdown(null);
    } else {
      // Calculate position for dropdown
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({ 
        top: rect.bottom + window.scrollY, 
        left: rect.left 
      });
      setPostMenuDropdown(postID);
    }
  };

  // Filter posts based on search query and category
  const filteredPosts = posts.filter((post) => {
    const valueToSearch = category === "All Categories"
      ? Object.values(post).join(" ").toLowerCase()
      : Array.isArray(post[category])
        ? post[category].join(", ").toLowerCase()
        : post[category]?.toString().toLowerCase() || "";
  
    return valueToSearch.includes(searchQuery.toLowerCase());
  });

  // Sort posts based on current sort configuration
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (!sortConfig.key) return 0;
  
    const valA = a[sortConfig.key]?.toString().toLowerCase() || "";
    const valB = b[sortConfig.key]?.toString().toLowerCase() || "";
  
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".post-actions-dropdown")) {
        setPostMenuDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Pagination calculations
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  /**
   * Toggles selection of a post
   * @param {string} postID - The post ID to toggle
   */
  const handleCheckboxChange = (postID) => {
    setSelectedPosts((prevSelected) =>
      prevSelected.includes(postID)
        ? prevSelected.filter((id) => id !== postID)
        : [...prevSelected, postID]
    );
  };

  /**
   * Handles column sorting
   * @param {string} key - The column key to sort by
   */
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Clears all post selections
  const handleDeselectAll = () => {
    setSelectedPosts([]);
    setIsAllSelected(false);
  };

  return (
    <div className="posts-page-wrapper">
      {/* Main content container */}
      <div className={`posts-container ${isModalOpen ? "blurred" : ""}`}>
        {/* Header section */}
        <div className="posts-header">
          <div className="welcome-message">
            <p>Welcome,</p>
            <h2 className="user-name">Amber Broos</h2>
          </div>
        </div>

        {/* Search and filter section */}
        <div className="search-container">
          <div className="search-container-left">
            {/* Category filter dropdown */}
            <select
              className="dropdown"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All Categories">All Categories</option>
              <option value="client">Client</option>
              <option value="content">Content</option>
              <option value="selectedPlatforms">Platform</option>
              <option value="status">Status</option>
            </select>

            {/* Search input */}
            <div className="search-box">
              <input
                type="text"
                placeholder={`Search by ${category === "All Categories" ? "any field" : category}`}
                value={searchQuery}
                onChange={handleSearch}
              />
              <FaSearch className="search-icon" />
            </div>
          </div>
        
          {/* Action buttons */}
          <div className="posts-actions">
            <FaSyncAlt className="refresh-icon" onClick={handleRefresh} />
            <button className="create-post-btn" onClick={handleCreatePostClick}>
              <FaPlus /> Create Post
            </button>
          </div>
        </div>

        {/* Posts Table */}
        <table className="posts-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("client")}>Client</th>
              <th onClick={() => handleSort("title")}>Title</th>
              <th>Content</th>
              <th onClick={() => handleSort("selectedPlatforms")}>Platforms</th>
              <th onClick={() => handleSort("status")}>Status</th>            
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.map((post) => (
              <tr key={post._id}>
                <td>{post.clientName}</td>
                <td>{post.title || "-"}</td>
                <td>{post.content}</td>

                <td> 
                  {/* Render platform icons */}
                  {post.selectedPlatforms.length > 0
                    ? post.selectedPlatforms.map((platform, index) => (
                        <span key={index}>
                          {platformIcons[platform.toLowerCase()] || platform}
                        </span>
                      ))
                    : "-"}
                </td>
                <td>
                  {/* Status highlight with color coding */}
                  <span className={`status-highlight ${post.status?.toLowerCase()}`}>
                  {post.status?.toUpperCase() || "-"}
                  </span>
                </td>
                <td>
                  {/* Action menu */}
                  <FaEllipsisV className="popup-icon" onClick={(e) => menuDropdown(e, post._id)} />
                  {postMenuDropdown === post._id &&
                    createPortal(
                      <div className="post-actions-dropdown" style={{ top: menuPosition.top, left: menuPosition.left }}>
                        {post.status !== "posted" && (
                          <button onClick={() => handleEditPost(post._id)}>Edit</button>
                        )}
                        <button className="delete-btn" onClick={() => handleDeletePost(post._id)}>Delete</button>
                      </div>,
                      document.body
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bulk actions section */}
        {selectedPosts.length > 0 && (
          <div className="checkbox-selection">
            <button className="unselect-selected-btn" onClick={handleDeselectAll}>
              Deselect All
            </button>
            <button
              className="delete-selected-btn"
              onClick={() => console.log("Delete posts:", selectedPosts)}
            >
              Delete Selected Posts
            </button>
          </div>
        )}
      </div>

      {/* Pagination section */}
      <div className={`pagination-container ${isModalOpen || postMenuDropdown ? 'disabled' : ''}`}>
        <p className={`${isModalOpen || postMenuDropdown ? 'pagination-disabled-text' : ''}`}>
          Showing {indexOfFirstPost + 1} to{" "}
          {Math.min(indexOfLastPost, filteredPosts.length)} of{" "}
          {filteredPosts.length} entries
        </p>

        <div className={`pagination ${isModalOpen || postMenuDropdown ? 'disabled' : ''}`}>
          {/* First page button */}
          <FaAnglesLeft
            className={`pagination-navigation ${currentPage === 1 ? "disabled" : ""}`}
            onClick={() => {
              if (currentPage !== 1 && !isModalOpen && !postMenuDropdown) {
                setCurrentPage(1);
              }
            }}
          />
          
          {/* Previous page button */}
          <FaAngleLeft
            className={`pagination-navigation ${currentPage === 1 ? "disabled" : ""}`}
            onClick={() => {
              if (currentPage > 1 && !isModalOpen && !postMenuDropdown) {
                setCurrentPage(currentPage - 1);
              }
            }}
          />

          {/* Page number buttons */}
          {[...Array(totalPages).keys()]
            .slice(Math.max(0, currentPage - 2), currentPage + 1)
            .map((number) => (
              <button
                key={number + 1}
                onClick={() => !(isModalOpen || postMenuDropdown) && setCurrentPage(number + 1)}
                className={currentPage === number + 1 ? "active" : ""}
                disabled={isModalOpen || postMenuDropdown}
              >
                {number + 1}
              </button>
            ))}
          
          {/* Next page button */}
          <FaAngleRight
            className={`pagination-navigation ${currentPage === totalPages ? "disabled" : ""}`}
            onClick={() => {
              if (currentPage < totalPages && !isModalOpen && !postMenuDropdown) {
                setCurrentPage(currentPage + 1);
              }
            }}
          />
          
          {/* Last page button */}
          <FaAnglesRight
            className={`pagination-navigation ${currentPage === totalPages ? "disabled" : ""}`}
            onClick={() => {
              if (currentPage !== totalPages && !isModalOpen && !postMenuDropdown) {
                setCurrentPage(totalPages);
              }
            }}
          />
        </div>
      </div>

      {/* Platform selection modal */}
      {isPlatformSelectOpen && createPortal(
        <div className="platform-dropdown-wrapper">
          <div className="platform-dropdown-horizontal animate-slide-down">
            {["Facebook", "Instagram", "Twitter", "LinkedIn"].map((platform) => (
              <button
                key={platform}
                onClick={() => {
                  setSelectedPlatforms(platform);
                  setIsModalOpen(true);
                  setIsPlatformSelectOpen(false);
                }}
              >
                {platform}
              </button>
            ))}
            <button className="cancel-btn" onClick={() => setIsPlatformSelectOpen(false)}>Cancel</button>
          </div>
        </div>,
        document.body
      )}
      
      {/* Create/Edit Post Modal */}
      {isModalOpen && (
        <CreatePostModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPost(null);
          }}
          onPostCreated={handlePostCreated}
          initialData={editingPost}
          onSave={async (savedPost) => {
            setPosts((prevPosts) => {
              const existingIndex = prevPosts.findIndex(p => p._id === savedPost._id);
              if (existingIndex !== -1) {
                // Update existing post
                const updatedPosts = [...prevPosts];
                updatedPosts[existingIndex] = savedPost;
                return updatedPosts;
              } else {
                // Add new post
                return [...prevPosts, savedPost];
              }
            });
          }}
          platform={editingPost?.selectedPlatforms?.[0] || selectedPlatforms}
        />
      )}
    </div>
  );
};

export default Posts;