import React, { useState, useEffect, useRef } from "react";
import "../styles.css";
import { FaSearch, FaSyncAlt } from "react-icons/fa";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("Content");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

  const [selectedPosts, setSelectedPosts] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Modal-related states (if needed)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/posts");
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        } else {
          console.error("Failed to fetch posts");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    switch (category) {
      case "ID":
        return post._id.toString().includes(searchQuery);
      case "Content":
        return post.content.toLowerCase().includes(searchQuery.toLowerCase());
      case "Hashtags":
        return post.hashtags?.toLowerCase().includes(searchQuery.toLowerCase());
      default:
        return true;
    }
  });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Checkbox Logic
  const handleCheckboxChange = (postID) => {
    setSelectedPosts((prevSelected) =>
      prevSelected.includes(postID)
        ? prevSelected.filter((id) => id !== postID)
        : [...prevSelected, postID]
    );
  };

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

  useEffect(() => {
    const allChecked =
      filteredPosts.length > 0 &&
      selectedPosts.length === filteredPosts.length;
    setIsAllSelected(allChecked);
  }, [selectedPosts, filteredPosts]);

  // Optional Modal Handlers
  const openCreatePostModal = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const closeCreatePostModal = () => {
    setIsModalOpen(false);
  };

  const handleSavePost = (newPostData) => {
    console.log("Saving post:", newPostData);
    // Your logic to create/update a post
    closeCreatePostModal();
  };

  return (
    <div className="posts-container">
      {/* Header */}
      <div className="posts-header">
        <h2>Manage Posts</h2>
      </div>

      {/* Search and Filter */}
      <div className="search-container">
        <select
          className="dropdown"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="ID">ID</option>
          <option value="Content">Content</option>
          <option value="Hashtags">Hashtags</option>
        </select>

        <div className="search-box">
          <input
            type="text"
            placeholder={`Search by ${category}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="search-icon" />
        </div>

        <FaSyncAlt
          className="refresh-icon"
          title="Refresh"
          onClick={() => window.location.reload()}
        />
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
            <th>Content</th>
            <th>Hashtags</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => (
            <tr key={post._id} className="post-row">
              <td>
                <input
                  type="checkbox"
                  className="checkbox-rowSelection"
                  checked={selectedPosts.includes(post._id)}
                  onChange={() => handleCheckboxChange(post._id)}
                />
              </td>
              <td>{post._id}</td>
              <td>{post.content}</td>
              <td>{post.hashtags}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Action Buttons */}
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

      {/* Placeholder Modal */}
      {isModalOpen && (
        <div className="modal">
          <h3>Create or Edit Post</h3>
          {/* Replace with your form */}
          <button onClick={closeCreatePostModal}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Posts;
