import React, { useState, useEffect } from "react";
import "../styles.css";
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa";
import { createPortal } from "react-dom";
import CreatePostModal from "./CreatePostModal";

const Posts = () => {
  // State declarations
  const [posts, setPosts] = useState([]); // All posts
  const [category, setCategory] = useState("All Categories"); // Category filter
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [currentPage, setCurrentPage] = useState(1); // Current pagination page
  const [postsPerPage] = useState(10); // Number of posts per page

  const [postMenuDropdown, setPostMenuDropdown] = useState(null); // Currently opened dropdown menu
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 }); // Position for dropdown menu

  const [selectedPosts, setSelectedPosts] = useState([]); // Selected post IDs
  const [isAllSelected, setIsAllSelected] = useState(false); // Whether all visible posts are selected

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const [editingPost, setEditingPost] = useState(null); // Post being edited

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  // Handlers for UI inputs
  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleRefresh = () => window.location.reload();

  // Open modal to create a new post
  const openCreatePostModal = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  // Close the create/edit modal
  const closeCreatePostModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  // Open modal to edit an existing post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  // Save post handler (create or update)
  const handleSavePost = (postData) => {
    if (!postData || !postData.content?.trim()) {
      alert("Post content cannot be empty.");
      return;
    }

    const now = new Date();
    const isScheduled = postData.scheduledDate && new Date(postData.scheduledDate) > now;
    const status = isScheduled ? "Scheduled" : "Published";

    if (postData._id) {
      // Update existing post
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postData._id ? { ...postData, status } : post
        )
      );
    } else {
      // Add new post
      const newPost = {
        ...postData,
        _id: crypto.randomUUID(),
        author: "Francis Hill",
        status,
      };
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }

    closeCreatePostModal();
  };

  // Toggle dropdown menu for a post
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

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".post-actions-dropdown")) {
        setPostMenuDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Filter posts by category and search query
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "All Categories" || post.status === category;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Update "select all" checkbox based on current posts
  useEffect(() => {
    const allChecked =
      currentPosts.length > 0 &&
      currentPosts.every((post) => selectedPosts.includes(post._id));
    setIsAllSelected(allChecked);
  }, [selectedPosts, currentPosts]);

  // Handle single checkbox change
  const handleCheckboxChange = (postID) => {
    setSelectedPosts((prevSelected) =>
      prevSelected.includes(postID)
        ? prevSelected.filter((id) => id !== postID)
        : [...prevSelected, postID]
    );
  };

  // Toggle select all/deselect all
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

  return (
    <div className="posts-container">
      {/* Header and actions */}
      <div className="posts-header">
        <h2>Posts</h2>
        <div className="posts-actions">
          <FaSyncAlt className="refresh-btn" onClick={handleRefresh} />
          <button className="create-post-btn" onClick={openCreatePostModal}>
            <FaPlus /> Create Post
          </button>
        </div>
      </div>

      {/* Search and category filter */}
      <div className="search-container">
        <select
          className="dropdown"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All Categories</option>
          <option>Published</option>
          <option>Scheduled</option>
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

      {/* Posts Table */}
      <table className="posts-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
              />
            </th>
            <th>ID</th>
            <th>Status</th>
            <th>Content</th>
            <th>Hashtags</th>
            <th>Platforms</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => (
            <tr key={post._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post._id)}
                  onChange={() => handleCheckboxChange(post._id)}
                />
              </td>
              <td>{post._id}</td>
              <td>{post.status || "-"}</td>
              <td>{post.content}</td>
              <td>{post.hashtags || "-"}</td>
              <td>{post.platforms?.join(", ") || "-"}</td>
              <td>{post.author || "-"}</td>
              <td>
                {/* Ellipsis icon and dropdown */}
                <FaEllipsisV onClick={(e) => menuDropdown(e, post._id)} />
                {postMenuDropdown === post._id &&
                  createPortal(
                    <div
                      className="post-actions-dropdown"
                      style={{ top: menuPosition.top, left: menuPosition.left }}
                    >
                      <button onClick={() => handleEditPost(post)}>Edit</button>
                      <button>Duplicate</button>
                      <button className="delete-btn">Delete</button>
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

      {/* Create/Edit Post Modal */}
      {isModalOpen && (
        <CreatePostModal
          isOpen={isModalOpen}
          onClose={closeCreatePostModal}
          initialData={editingPost}
          onSave={handleSavePost}
        />
      )}
    </div>
  );
};

export default Posts;
