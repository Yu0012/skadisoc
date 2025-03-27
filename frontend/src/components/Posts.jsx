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
  const [postsPerPage] = useState(10); //number of post per page
  const [postMenuDropdown, setPostMenuDropdown] = useState(null);//current opened dropdown
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 }) //positon for dorpdown menu
  const [selectedPosts, setSelectedPosts] = useState([]);// selected post IDs
  const [isAllSelected, setIsAllSelected] = useState(false);// whether all visible posts are selected
  const [isModalOpen, setIsModalOpen] = useState(false); //modal open state
  const [editingPost, setEditingPost] = useState(null);// post being edited

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

  // 📌 Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // 📌 Handle Post Creation - Update UI After New Post
  const handlePostCreated = () => {
    fetchPosts(); // Reload posts after a new post is added
    setIsModalOpen(false);
  };
  
  //handles for ui inputs
  const handleRefresh = () => window.location.reload();

  //open modal to create new post
  const openCreatePostModal = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };
  
  //close the create/edit modal
  const closeCreatePostModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  //open modal to edit an existing posts
  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  //save post handler (create and update)
  const handleSavePost = (postData) => {
    if (!postData || !postData.content?.trim()) {
      alert("Post content cannot be empty.");
      return;
    }

    const now = new Date();
    const isScheduled =
      postData.scheduledDate && new Date(postData.scheduledDate) > now;
    const status = isScheduled ? "Scheduled" : "Published";

    if (postData._id) {
      //update existing post
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postData._id ? { ...postData, status } : post
        )
      );
    } else {
      //add new post
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

  // 📌 Filtered posts based on search query
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "All Categories" || post.status === category;
    return matchesSearch && matchesCategory;
  });
//pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
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

  return (
    <div className="posts-container">
      {/*Header and actions*/}
      <div className="posts-header">
        <h2>Posts</h2>
        <div className="posts-actions">
          <FaSyncAlt className="refresh-btn" onClick={handleRefresh} />
          <button className="create-post-btn" onClick={() => setIsModalOpen(true)}>
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
              <td>{post.posted || "-"}</td>
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
                      <button className="delete-btn" onClick={() => handleDeletePost(postMenuDropdown)}>Delete</button>
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
      {isModalOpen && <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPostCreated={handlePostCreated}/>}
    </div>
  );
};

export default Posts;
