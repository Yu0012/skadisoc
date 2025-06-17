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
import config from '../config';

const Posts = () => {
  // State declarations
  const [posts, setPosts] = useState([]);//All posts
  const [category, setCategory] = useState("All Categories"); // Category filter
  const [searchQuery, setSearchQuery] = useState("");//search input
  const [currentPage, setCurrentPage] = useState(1);// current pagination page
  const [postsPerPage] = useState(8); //number of post per page
  const [postMenuDropdown, setPostMenuDropdown] = useState(null);//current opened dropdown
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 }) //positon for dorpdown menu
  const [selectedPosts, setSelectedPosts] = useState([]);// selected post IDs
  const [isModalOpen, setIsModalOpen] = useState(false); //modal open state
  const [editingPost, setEditingPost] = useState(null);
  const [isAllSelected, setIsAllSelected] = useState(false);// whether all visible posts are selected
  const [isPlatformSelectOpen, setIsPlatformSelectOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [username, setUsername] = useState("");


  //Replaces text to icons for social media
  const platformIcons = {
    facebook: <img src={facebookIcon} className="inline-icon" alt="Facebook" />,
    twitter: <img src={twitterIcon} className="inline-icon" alt="Twitter"/>,
    instagram: <img src={instagramIcon} className="inline-icon" alt="Instagram"/>,
    linkedin: <img src={linkedinIcon} className="inline-icon" alt="LinkedIn"/>
  };

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.API_BASE}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` } 
      });
      if(!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      };
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

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
        setUsername(data.username); // username is sent from backend
      } catch (err) {
        console.error("User info fetch error:", err);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    fetchPosts(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchPosts(); // Refresh every 60 seconds
    }, 60000); // 60,000 ms = 1 minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  
  // 📌 Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // 📌 Handle Post Creation - Update UI After New Post
  const handlePostCreated = () => {
    fetchPosts(); // Reload posts after a new post is added
    setIsModalOpen(false);
  };

  const handleCreatePostClick = () => {
    setIsPlatformSelectOpen(true);
  };
  
  //handles for ui inputs
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
  
  const handleCreatePost = async (formValues) => {
  try {
    const token = localStorage.getItem("token");

    const payload = {
      title: formValues.title,
      content: formValues.content,
      client: formValues.client,
      clientName: formValues.clientName,
      scheduledDate: formValues.scheduledDate,
      selectedPlatforms: formValues.selectedPlatforms,
      filePath: formValues.filePath || null,
    };

    const isEdit = !!formValues._id;
    const url = isEdit
      ? `${config.API_BASE}/api/posts/${formValues._id}`
      : `${config.API_BASE}/api/posts`;

    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resultText = await response.text();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch (parseError) {
      console.error("❌ Non-JSON response:", resultText);
      throw new Error("Server did not return valid JSON.");
    }

    if (response.ok) {
      Swal.fire(
        "Success",
        isEdit ? "Post updated successfully" : "Post created successfully",
        "success"
      );
      setEditingPost(null); // Reset editing state
      setRefreshTrigger(!refreshTrigger); // Reload posts
      handlePostCreated(); // Close modal
    } else {
      Swal.fire("Error", result.message || "Failed to save post", "error");
    }
  } catch (err) {
    console.error("Error saving post:", err);
    Swal.fire("Error", "Something went wrong", "error");
  }
};

  
  // Edit Post
  const handleEditPost = async (postId) => {
    setPostMenuDropdown(null); // 👈 Close dropdown
    const fullPost = await fetchPostById(postId);
    if (!fullPost) {
      alert("Failed to load post");
      return;
    }

    if (fullPost.status === "posted") {
      alert("Posted content cannot be edited.");
      return;
    }

    setEditingPost(fullPost);
    setIsModalOpen(true);
  };

  // Delete Post with enhanced SweetAlert2 confirmation
  const handleDeletePost = async (postId) => {
    setPostMenuDropdown(null); // 🔄 Close dropdown immediately

    const result = await Swal.fire({
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
      const res = await fetch(`${config.API_BASE}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete post");

      setPosts((prev) => prev.filter((p) => p._id !== postId));

      await Swal.fire({
        title: 'Deleted!',
        text: 'Your post has been successfully deleted.',
        icon: 'success',
        confirmButtonColor: '#0D286E',
        background: 'white',
        color: '#0a0f5c',
      });
    } catch (err) {
      console.error("Delete error:", err);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to delete the post. Please try again.',
        icon: 'error',
        confirmButtonColor: '#0D286E',
        background: 'white',
        color: '#0a0f5c',
      });
    }
  };

  // For edit post get data by ID
  const fetchPostById = async (id) => {
    try {
      const response = await fetch(`${config.API_BASE}/api/posts/${id}`, {
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
  
  //toggle dropdown menu for a post
  const menuDropdown = (event, postID) => {
    event.stopPropagation();
    if (postMenuDropdown === postID) {
      setPostMenuDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({ top: rect.top + window.scrollY, left: rect.left - 150 }); // adjust -150 based on dropdown width
      setPostMenuDropdown(postID);
    }
  };

  // 📌 Filtered posts based on search query
  const filteredPosts = posts.filter((post) => {
    const valueToSearch = category === "All Categories"
      ? Object.values(post).join(" ").toLowerCase()
      : Array.isArray(post[category])
        ? post[category].join(", ").toLowerCase()
        : post[category]?.toString().toLowerCase() || "";
  
    return valueToSearch.includes(searchQuery.toLowerCase());
  });

  // 📌 Sort posts based on selected criteria
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (!sortConfig.key) return 0;
  
    const valA = a[sortConfig.key]?.toString().toLowerCase() || "";
    const valB = b[sortConfig.key]?.toString().toLowerCase() || "";
  
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  
  //close dropdown menu in outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideDropdown = event.target.closest(".post-actions-dropdown");
      const isInsidePlatform = event.target.closest(".platform-dropdown-wrapper");
      const isInsidePostsActions = event.target.closest(".posts-actions");

      if (!isInsideDropdown && !isInsidePlatform && !isInsidePostsActions) {
        setPostMenuDropdown(null);
        setIsPlatformSelectOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);


  useEffect(() => {
  document.body.setAttribute("data-page", "posts");
  return () => document.body.removeAttribute("data-page");
}, []);


  //pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

//refresh state
    const [isRefreshing, setIsRefreshing] = useState(false);


  //handle single checkbox change
  const handleCheckboxChange = (postID) => {
    setSelectedPosts((prevSelected) =>
      prevSelected.includes(postID)
        ? prevSelected.filter((id) => id !== postID)
        : [...prevSelected, postID]
    );
  };

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

  const handleDeselectAll = () => {
    setSelectedPosts([]);
    setIsAllSelected(false);
  };

  return (
    <div className="posts-page-wrapper">
      {/* Main content container */}
      <div className={`posts-container ${isModalOpen ? "blurred" : ""}`}>
        {/*Header and actions*/}
        <div className="posts-header">
          <div className="welcome-message">
            <p>Welcome,</p>
            <h2 className="user-name">{username || "Loading..."}</h2>
          </div>
        </div>

        {/*search and catogories filter*/}
        <div className="search-container">
          <div className="search-container-left">
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
                  {/* For each post, render the icon that corresponds to the social media that's associated with the post. 
                      Unavailable icons would render the text instead, and posts without platforms would have a dash instead */}
                  {post.selectedPlatforms.length > 0
                    ? post.selectedPlatforms.map((platform, index) => (
                        <span key={index}>
                          {platformIcons[platform.toLowerCase()] || platform}
                        </span>
                      ))
                    : "-"}
                </td>
                <td>
                  {/* Highlights colours based on text */}
                  <span className={`status-highlight ${post.status?.toLowerCase()}`} style={{ fontSize: "14px" }}>
                    {post.status.toUpperCase() || "-"}
                  </span>
                </td>
                <td>
                  {/* Ellipsis icon and dropdown */}
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

        {/* Bulk actions for selected posts */}
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

      {/* Pagination container - now outside the main content */}
      <div className={`pagination-container ${isModalOpen || postMenuDropdown ? 'disabled' : ''}`}>
        <p className={`${isModalOpen || postMenuDropdown ? 'pagination-disabled-text' : ''}`}>
          Showing {indexOfFirstPost + 1} to{" "}
          {Math.min(indexOfLastPost, filteredPosts.length)} of{" "}
          {filteredPosts.length} entries
        </p>

        <div className={`pagination ${isModalOpen || postMenuDropdown ? 'disabled' : ''}`}>
          <FaAnglesLeft
            className="pagination-navigation"
            onClick={() => !(isModalOpen || postMenuDropdown) && setCurrentPage(1)}
            disabled={currentPage === 1 || isModalOpen || postMenuDropdown}
          />
          <FaAngleLeft
            className="pagination-navigation"
            onClick={() => {
              if (currentPage > 1 && !isModalOpen && !postMenuDropdown) {
                setCurrentPage(currentPage - 1);
              }
            }}
            disabled={currentPage === 1 || isModalOpen || postMenuDropdown}
          />

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
          
          <FaAngleRight
            className="pagination-navigation"
            onClick={() => {
              if (currentPage < totalPages && !isModalOpen && !postMenuDropdown) {
                setCurrentPage(currentPage + 1);
              }
            }}
            disabled={currentPage === totalPages || isModalOpen || postMenuDropdown}
          />
          <FaAnglesRight
            className="pagination-navigation"
            onClick={() => !(isModalOpen || postMenuDropdown) && setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || isModalOpen || postMenuDropdown}
          />
        </div>
      </div>

      {/* Platform selection modal */}
      {isPlatformSelectOpen && createPortal(
        <div className="platform-dropdown-wrapper">
          <div className="platform-dropdown-horizontal animate-slide-down">
            {["Facebook", "Instagram", "Twitter"].map((platform) => (
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
          onSave={handleCreatePost} 
          platform={editingPost?.selectedPlatforms?.[0] || selectedPlatforms}
        />
      )}
    </div>
  );
};

export default Posts;