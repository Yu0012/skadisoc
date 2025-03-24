import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles.css";
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa";
import CreatePostModal from "./CreatePostModal";
import { createPortal } from "react-dom";

const Posts = () => {
  const [posts, setPosts] = useState([]); // Store posts from database
  const [category, setCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [postMenuDropdown, setPostMenuDropdown] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // 📌 Fetch Posts from MongoDB
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // 📌 Handle Post Deletion
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`);
      setPosts(posts.filter((post) => post._id !== postId)); // Remove from UI
    } 
    
    catch (error) {
      console.error("Error deleting post:", error);
    }

    setPostMenuDropdown(null); // Close popup after delete
    alert("Post deleted successfully!");
  };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setPostMenuDropdown(null); // Close dropdown
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
  // 📌 Handle Post Creation - Update UI After New Post
  const handlePostCreated = () => {
    fetchPosts(); // Reload posts after a new post is added
    setIsModalOpen(false);
  };

  // 📌 Toggle dropdown menu
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

  // 📌 Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // 📌 Filtered posts based on search query
  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 📌 Pagination Logic
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
          <FaSyncAlt className="refresh-btn" onClick={fetchPosts} title="Refresh Data" />
          <button className="create-post-btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Create Post
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-container">
        <select className="dropdown" value={category} onChange={(e) => setCategory(e.target.value)}>
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
            <th>Content</th>
            <th>Hashtags</th>
            <th>Client</th>
            <th>Platforms</th>
            <th>Media</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => (
            <tr key={post._id} className="post-row">
              <td>{post._id}</td>
              <td>{post.content}</td>
              <td>{post.hashtags}</td>  
              <td>{post.client}</td>
              <td>{post.selectedPlatforms.join(", ")}</td>
              <td>
              {post.filePath ? (
                  <img
                    src={`http://localhost:5000${post.filePath}`}
                    alt="Post media"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                ) : (
                  <span style={{ color: "#999" }}>-</span>
                )}
              </td>
              <td>
                <FaEllipsisV className="action-icon" onClick={(e) => menuDropdown(e, post._id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Section */}
      <div className="pagination-container">
        <p>Showing {indexOfFirstPost + 1} to {Math.min(indexOfLastPost, filteredPosts.length)} of {filteredPosts.length} entries</p>
        <div className="pagination">
          {[...Array(totalPages).keys()].map((number) => (
            <button key={number + 1} onClick={() => setCurrentPage(number + 1)} className={currentPage === number + 1 ? "active" : ""}>
              {number + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Post Actions Dropdown */}
      {postMenuDropdown !== null &&
        createPortal(
          <div className="post-actions-dropdown" style={{ top: menuPosition.top, left: menuPosition.left }} ref={dropdownRef}>
            <button>Edit</button>
            <button className="delete-btn" onClick={() => handleDeletePost(postMenuDropdown)}>Delete</button>
          </div>,
          document.body
        )}

      {/* Create Post Modal */}
      {isModalOpen && <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPostCreated={handlePostCreated} />}
    </div>
  );
};

export default Posts;
