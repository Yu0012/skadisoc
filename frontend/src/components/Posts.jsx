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
  const [isModalOpen, setIsModalOpen] = useState(false); //modal open state
  const [editingPost, setEditingPost] = useState(null);

  //Replaces text to icons for social media
  const platformIcons = {
    facebook: <img src={facebookIcon} className="inline-icon" alt="Facebook" />,
     twitter: <img src={twitterIcon} className="inline-icon" alt="Twitter"/>,
     instagram: <img src={instagramIcon} className="inline-icon" alt="Instagram"/>,
     linkedin: <img src={linkedinIcon} className="inline-icon" alt="LinkedIn"/>
  };

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

  // Edit Post
  const handleEditPost = async (postId) => {
    setPostMenuDropdown(null); // 👈 Close dropdown when Edit is clicked
    const fullPost = await fetchPostById(postId);
    if (fullPost) {
      setEditingPost(fullPost);
      setIsModalOpen(true);
      setPostMenuDropdown(null); 
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


  //handle single checkbox change
  const handleCheckboxChange = (postID) => {
    setSelectedPosts((prevSelected) =>
      prevSelected.includes(postID)
        ? prevSelected.filter((id) => id !== postID)
        : [...prevSelected, postID]
    );
  };

  return (
    <div>
     <div className={`posts-container ${isModalOpen ? "blurred" : ""}`}>
      {/*Header and actions*/}
      <div className="posts-header">
      <div className="welcome-message">
           <p>Welcome,</p>
           <h2 className="user-name">Amber Broos</h2>
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
     
        <div className="posts-actions">
          <FaSyncAlt className="refresh-icon" onClick={handleRefresh} />
          <button className="create-post-btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Create Post
          </button>
        </div>
      </div>

      {/* Posts Table */}
      <table className="posts-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Content</th>
            <th>Hashtags</th>
            <th>Platforms</th>
            <th>Status</th>            
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => (
            <tr key={post._id}>
              <td>{post.client || "-"}</td>
              <td>{post.content}</td>
              <td>{post.hashtags || "-"}</td>
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
              <td>{post.posted || "-"}</td>
              <td>
                {/* Ellipsis icon and dropdown */}
                <FaEllipsisV className="popup-icon" onClick={(e) => menuDropdown(e, post._id)} />
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
        <FaAnglesLeft 
             className="pagination-navigation" 
             onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
        />
        <FaAngleLeft 
          className="pagination-navigation" 
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1} 
       />

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
          <FaAngleRight 
              className="pagination-navigation"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
          />
            <FaAnglesRight
              className="pagination-navigation"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
        </div>
      </div>
      </div>
      
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
          />
      )}

    </div>
  );
};

export default Posts;
