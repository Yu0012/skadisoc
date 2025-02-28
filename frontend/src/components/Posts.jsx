import React, { useState, useEffect } from "react";
import "../styles.css"; // Import global styles
import { FaSearch, FaDownload, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa"; // Icons
import postsData from "../data/posts.json"; // Example data
import { createPortal } from "react-dom";

const Posts = () => {
  const [posts, setPosts] = useState([]); // Store posts data
  const [category, setCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [accountMenuDropdown, setAccountMenuDropdown] = useState(null);  // Triggers dropdown menu
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 }); // Handles positioning for dropdown menu

  useEffect(() => {
    setPosts(postsData); // Fetch data from JSON (simulate API call)
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

  // Filtered posts based on search query
  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

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
            <input type="text" placeholder="Tap to Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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

        <button className="export-btn">
          Export <FaDownload />
        </button>
      </div>

      {/* Posts Table */}
      <table className="posts-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>ID</th>
            <th>Status</th>
            <th>Content</th>
            <th>Media</th>
            <th>Accounts</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => (
            <tr key={post.id} className="account-row">
              <td><input type="checkbox" /></td>
              <td>{post.id}</td>
              <td>{post.status}</td>
              <td>{post.content}</td>
              <td>{post.media}</td>
              <td>{post.accounts}</td>
              <td>{post.author}</td>
              <td><FaEllipsisV className="account-Ellipsis" onClick={(e) => menuDropdown(e, post.id)} /></td>
            </tr>
          ))}
        </tbody>
      </table>

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
        {Array.from({ length: Math.ceil(filteredPosts.length / postsPerPage) }, (_, i) => (
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
          disabled={currentPage === Math.ceil(filteredPosts.length / postsPerPage)}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default Posts;
