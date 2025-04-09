import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles.css";

const FacebookPreview = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Error loading post:", err);
      }
    };

    fetchPost();
  }, [postId]);

  if (!post) return <div className="fb-preview-page">Loading...</div>;

  return (
    <div className="fb-preview-page">
      <div className="fb-post-container">
        <div className="fb-post-header">
          <img
            src="https://i.imgur.com/8Km9tLL.png" // default profile image
            alt="profile"
            className="fb-profile-pic"
          />
          <div className="fb-header-text">
            <strong>{post.client || "Page Name"}</strong>
            <span>
              {new Date(post.scheduledDate).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
              })} · <i className="fas fa-globe-asia"></i>
            </span>
          </div>
        </div>

        <div className="fb-post-body">
          <p className="fb-post-content">{post.content}</p>
          <p className="fb-post-hashtags">{post.hashtags}</p>
          {post.filePath && (
            <img
              src={`http://localhost:5000${post.filePath}`}
              alt="post"
              className="fb-post-image"
            />
          )}
        </div>

        <div className="fb-reactions">
          <span>👍❤️😆 Angel Ko and 2 others</span>
        </div>

        <div className="fb-actions">
          <button>👍 Like</button>
          <button>💬 Comment</button>
          <button>↗️ Share</button>
        </div>

        <div className="fb-comment-bar">
          <img
            src="https://i.imgur.com/8Km9tLL.png"
            alt="you"
            className="fb-profile-pic small"
          />
          <input placeholder={`Comment as ${post.client}`} />
          <div className="fb-comment-icons">
            <span>😊</span>
            <span>📷</span>
            <span>🎁</span>
            <span>GIF</span>
            <span>⋯</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookPreview;
