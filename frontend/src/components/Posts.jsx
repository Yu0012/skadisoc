import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles.css";
import { FaSearch, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa";
import postsData from "../data/posts.json";
import CreatePostModal from "./CreatePostModal";

const Posts = () => {
  const [posts, setPosts] = useState([]); // Store posts from database
  const [category, setCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [postMenuDropdown, setPostMenuDropdown] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedPosts, setSelectedPosts] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

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
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

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

  const handleRefresh = () => window.location.reload();

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

  const handleSavePost = (postData) => {
    if (!postData || !postData.content?.trim()) {
      alert("Post content cannot be empty.");
      return;
    }

    const now = new Date();
    const isScheduled =
      postData.scheduledDate && new Date(postData.scheduledDate) > now;

    const status = isScheduled ? "Scheduled" : "Published";

    if (postData.id) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postData.id ? { ...postData, status } : post
        )
      );
    } else {
      const newPost = {
        ...postData,
        id: posts.length ? Math.max(...posts.map((p) => p.id)) + 1 : 1,
        author: "Francis Hill",
        status,
      };
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }

    closeCreatePostModal();
  };

  // 🔍 Filter by search + category
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      category === "All Categories" || post.status === category;
    return matchesSearch && matchesCategory;
  });

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
            <th>Status</th>
            <th>Content</th>
            <th>Hashtags</th>
            <th>Client</th>
            <th>Platforms</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>{post.status}</td>
              <td>{post.content}</td>
              <td>{post.hashtags || "-"}</td>
              <td>{post.platforms?.join(", ") || "-"}</td>
              <td>{post.author}</td>
              <td>
                <FaEllipsisV onClick={(e) => menuDropdown(e, post.id)} />
                {postMenuDropdown === post.id &&
                  createPortal(
                    <div
                      className="post-actions-dropdown"
                      style={{
                        top: menuPosition.top,
                        left: menuPosition.left,
                      }}
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
      <div>
        {selectedPosts.length > 0 && (
          <div className="checkbox-selection">
            <button className="unselect-selected-btn" onClick={handleDeselectAll}>
              Deselect All
            </button>
            <button className="delete-selected-btn">
            Delete Selected Posts
            </button>
          </div>
        )}
      </div>



      {/* Pagination Section */}
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
            .slice(Math.max(0, currentPage - 3), currentPage + 2)
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

      {/* Modal */}
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
