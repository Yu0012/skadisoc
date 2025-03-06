import React, { useState, useEffect } from "react";
import "../styles.css";
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa";
import postsData from "../data/posts.json";
import CreatePostModal from "./CreatePostModal";
import { createPortal } from "react-dom";

const Posts = () => {
  const [posts, setPosts] = useState([]); // Store posts data
  const [category, setCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [postMenuDropdown, setPostMenuDropdown] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setPosts(postsData); // Simulating API data fetch
  }, []);

  // Toggle dropdown menu & set its position
  const menuDropdown = (event, postID) => {
    event.stopPropagation();
    if (postMenuDropdown === postID) {
      setPostMenuDropdown(null); // Close menu if already open
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left });
      setPostMenuDropdown(postID);
    }
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".post-actions-dropdown")) {
        setPostMenuDropdown(null);
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

  // Open Create Post Modal
  const openCreatePostModal = () => {
    setIsModalOpen(true);
  };

  // Close Create Post Modal
  const closeCreatePostModal = () => {
    setIsModalOpen(false);
  };

  // Filtered posts based on search query
  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="posts-container">
      {/* Top Section */}
      <div className="posts-header">
        <h2>Posts</h2>
        <div className="posts-actions">
          <FaSyncAlt className="refresh-btn" onClick={handleRefresh} title="Refresh Data" />
          <button className="create-post-btn" onClick={openCreatePostModal}>
            <FaPlus /> Create Post
          </button>
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
          <option>Published</option>
          <option>Draft</option>
          <option>Scheduled</option>
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
      </div>

      {/* Posts Table */}
      <table className="posts-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Content</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => (
            <tr key={post.id} className="post-row">
              <td>{post.id}</td>
              <td>{post.status}</td>
              <td>{post.content}</td>
              <td>{post.author}</td>
              <td>
                <FaEllipsisV className="action-icon" onClick={(e) => menuDropdown(e, post.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Section */}
      <div className="pagination-container">
        <p>Showing {indexOfFirstPost + 1} to {Math.min(indexOfLastPost, filteredPosts.length)} of {filteredPosts.length} entries</p>
        <div className="pagination">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            «
          </button>
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
            ‹
          </button>
          {[...Array(totalPages).keys()].slice(Math.max(0, currentPage - 3), currentPage + 2).map((number) => (
            <button key={number + 1} onClick={() => setCurrentPage(number + 1)} className={currentPage === number + 1 ? "active" : ""}>
              {number + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
            ›
          </button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
            »
          </button>
        </div>
      </div>

      {/* Post Actions Dropdown */}
      {postMenuDropdown !== null &&
        createPortal(
          <div className="post-actions-dropdown" style={{ top: menuPosition.top, left: menuPosition.left }}>
            <button>Edit</button>
            <button>Duplicate</button>
            <button className="delete-btn">Delete</button>
          </div>,
          document.body
        )}

      {/* Create Post Modal */}
      {isModalOpen && <CreatePostModal isOpen={isModalOpen} onClose={closeCreatePostModal} />}
    </div>
  );
};

export default Posts;
