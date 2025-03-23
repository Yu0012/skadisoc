import React, { useState, useEffect } from "react";
import "../styles.css";
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa";
import { createPortal } from "react-dom";
import axios from "axios";
import CreatePostModal from "./CreatePostModal";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [postMenuDropdown, setPostMenuDropdown] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState({});

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".post-actions-dropdown")) {
        setPostMenuDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleRefresh = () => fetchPosts();

  const openCreatePostModal = () => {
    setEditingPost({});
    setIsModalOpen(true);
  };

  const closeCreatePostModal = () => {
    setIsModalOpen(false);
    setEditingPost({});
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleSavePost = async (postData) => {
    if (!postData || !postData.content?.trim()) {
      alert("Post content cannot be empty.");
      return;
    }

    try {
      let savedPost;
      if (postData._id) {
        const response = await axios.put(`http://localhost:5000/api/posts/${postData._id}`, postData);
        savedPost = response.data.post;
        setPosts(posts.map(p => (p._id === savedPost._id ? savedPost : p)));
      } else {
        const response = await axios.post("http://localhost:5000/api/posts", postData);
        savedPost = response.data.post;
        setPosts([savedPost, ...posts]);
      }
      closeCreatePostModal();
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const status = post.scheduledDate && new Date(post.scheduledDate) > new Date() ? "Scheduled" : "Published";
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "All Categories" || category === status;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h2>Posts</h2>
        <div className="posts-actions">
          <FaSyncAlt className="refresh-btn" onClick={handleRefresh} />
          <button className="create-post-btn" onClick={openCreatePostModal}>
            <FaPlus /> Create Post
          </button>
        </div>
      </div>

      <div className="search-container">
        <select className="dropdown" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All Categories</option>
          <option>Published</option>
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

      <table className="posts-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Content</th>
            <th>Hashtags</th>
            <th>Platforms</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => {
            const status = post.scheduledDate && new Date(post.scheduledDate) > new Date() ? "Scheduled" : "Published";
            return (
              <tr key={post._id}>
                <td>{status}</td>
                <td>{post.content}</td>
                <td>{post.hashtags || "-"}</td>
                <td>{post.selectedPlatforms?.join(", ") || "-"}</td>
                <td>
                  <FaEllipsisV onClick={(e) => menuDropdown(e, post._id)} />
                  {postMenuDropdown === post._id &&
                    createPortal(
                      <div
                        className="post-actions-dropdown"
                        style={{ top: menuPosition.top, left: menuPosition.left }}
                      >
                        <button onClick={() => handleEditPost(post)}>Edit</button>
                        <button className="delete-btn">Delete</button>
                      </div>,
                      document.body
                    )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination-container">
        <p>
          Showing {indexOfFirstPost + 1} to {Math.min(indexOfLastPost, filteredPosts.length)} of {filteredPosts.length} entries
        </p>
        <div className="pagination">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
          {[...Array(totalPages).keys()].slice(Math.max(0, currentPage - 3), currentPage + 2).map((number) => (
            <button
              key={number + 1}
              onClick={() => setCurrentPage(number + 1)}
              className={currentPage === number + 1 ? "active" : ""}
            >
              {number + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
        </div>
      </div>

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
