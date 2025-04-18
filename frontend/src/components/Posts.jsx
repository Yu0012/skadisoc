import React, { useState, useEffect } from "react";
import "../styles.css";
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa";
import { createPortal } from "react-dom";
import CreatePostModal from "./CreatePostModal";

const Posts = () => {
  // State declarations
  const [posts, setPosts] = useState([]);//All posts
  const [category, setCategory] = useState("All Categories"); // Category filter
  const [searchQuery, setSearchQuery] = useState("");//search input
  const [currentPage, setCurrentPage] = useState(1);// current pagination page
  const [postsPerPage] = useState(7); //number of post per page
  const [postMenuDropdown, setPostMenuDropdown] = useState(null);//current opened dropdown
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 }) //positon for dorpdown menu
  const [selectedPosts, setSelectedPosts] = useState([]);// selected post IDs
  const [isAllSelected, setIsAllSelected] = useState(false);// whether all visible posts are selected
  const [isModalOpen, setIsModalOpen] = useState(false); //modal open state
  const [editingPost, setEditingPost] = useState(null);
  const [isPlatformSelectOpen, setIsPlatformSelectOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const platforms = [{id: "facebook", name: "Facebook"}, {id: "instagram", name: "Instagram"}, {id: "twitter", name: "Twitter"}, {id: "linkedin", name: "LinkedIn"}]


  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/posts");
        const data = await response.json();
        setPosts(data.reverse()); // Reverse the order to show the latest posts first
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
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
  const handleRefresh = () => window.location.reload();

  // Edit Post
  const handleEditPost = async (postId) => {
    const fullPost = await fetchPostById(postId);
    if (fullPost) {
      setEditingPost(fullPost);
      setIsModalOpen(true);
    } else {
      alert("Failed to load post");
    }
  };

  // Delete Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("You sure you want to delete this post?")) return;
  
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: "DELETE",
      });
  
      if (!res.ok) throw new Error("Failed to delete post");
  
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete the post. Please try again.");
    }
  };
  

  // For edit post get data by ID
  const fetchPostById = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`);
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
      setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left });
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
      if (!event.target.closest(".post-actions-dropdown")) {
        setPostMenuDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);


//pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  //update "select all" check box based on current posts
  useEffect(() => {
    const allChecked =
      currentPosts.length > 0 &&
      currentPosts.every((post) => selectedPosts.includes(post._id));
    setIsAllSelected(allChecked);
  }, [selectedPosts, currentPosts]);
  

  //handle single checkbox change
  const handleCheckboxChange = (postID) => {
    setSelectedPosts((prevSelected) =>
      prevSelected.includes(postID)
        ? prevSelected.filter((id) => id !== postID)
        : [...prevSelected, postID]
    );
  };

  //toggle select all/deselect all
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(currentPosts.map((post) => post._id));
    }
    setIsAllSelected(!isAllSelected);
  };

  const handleDeselectAll = () => {
    setSelectedPosts([]);
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
  

  return (
    <div className="posts-container">
      {/*Header and actions*/}
      <div className="posts-header">
        <h2>Posts</h2>
        <div className="posts-actions">
          <FaSyncAlt className="refresh-btn" onClick={handleRefresh} />
          <button className="create-post-btn" onClick={handleCreatePostClick}>
            <FaPlus /> Create Post
          </button>
        </div>
      </div>

      {/*search and catogories filter*/}
      <div className="search-container">
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

      {/* Posts Table */}
      <table className="posts-table">
        <thead>
          <tr>
            {/* <th>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
              />
            </th> */}
            <th onClick={() => handleSort("client")}>Client</th>
            <th>Content</th>
            <th onClick={() => handleSort("selectedPlatforms")}>Platforms</th>
            <th  onClick={() => handleSort("status")}>Status</th>            
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => (
            <tr key={post._id}>
              {/* <td>
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post._id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    handleCheckboxChange(post._id);
                    setSelectedPostIds((prev) =>
                      checked ? [...prev, post._id] : prev.filter((id) => id !== post._id)
                    );
                  }}
                />
              </td> */}
              <td>{post.client || "-"}</td>
              <td>{post.content}</td>
              <td>{post.selectedPlatforms.join(", ") || "-"}</td>
              <td>{post.status || "-"}</td>
              <td>
                {/* Ellipsis icon and dropdown */}
                <FaEllipsisV onClick={(e) => menuDropdown(e, post._id)} />
                {postMenuDropdown === post._id &&
                  createPortal(
                    <div
                      className="post-actions-dropdown"
                      style={{ top: menuPosition.top, left: menuPosition.left }}
                    >
                      <button onClick={() => handleEditPost(post._id)}>Edit</button>
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

      {/* Pagination */}
      <div className="pagination-container">
        <p>
          Showing {indexOfFirstPost + 1} to{" "}
          {Math.min(indexOfLastPost, filteredPosts.length)} of{" "}
          {filteredPosts.length} entries
        </p>
        <div className="pagination">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            «
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
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
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>

      {isPlatformSelectOpen && createPortal(
         <div className="platform-dropdown-wrapper">
          <div className="platform-dropdown-horizontal  animate-slide-down">
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
                  // Update existing
                  const updatedPosts = [...prevPosts];
                  updatedPosts[existingIndex] = savedPost;
                  return updatedPosts;
                } else {
                  // Add new
                  return [...prevPosts, savedPost];
                }
              });
            }}
            platform={selectedPlatforms}
          />
      )}

    </div>
  );
};

export default Posts;
