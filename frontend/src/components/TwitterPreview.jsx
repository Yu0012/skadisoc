import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles.css";

const TwitterPreview = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };
    fetchPost();
  }, [postId]);

  if (!post) return <div className="twitter-preview-page">Loading...</div>;

  return (
    <div className="twitter-preview-page">
      <div className="tweet-container">
        <div className="tweet-header">
          <img
            src="https://i.imgur.com/8Km9tLL.png"
            alt="profile"
            className="tweet-avatar"
          />
          <div>
            <div className="tweet-name">{post.client || "User Name"}</div>
            <div className="tweet-username">@{(post.client || "user").toLowerCase().replace(/\\s/g, '')}</div>
          </div>
        </div>

        <div className="tweet-content">
          <p>{post.content}</p>
          {post.hashtags && (
            <p className="tweet-hashtags">
              {post.hashtags.split(" ").map((tag, i) => (
                <span key={i} className="tweet-tag">#{tag.replace("#", "")} </span>
              ))}
            </p>
          )}
          {post.filePath && (
            <img
              src={`http://localhost:5000${post.filePath}`}
              className="tweet-image"
              alt="attached"
            />
          )}
        </div>

        <div className="tweet-timestamp">
          {new Date(post.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{" "}
          {new Date(post.scheduledDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })}
        </div>

        <div className="tweet-actions">
          <span>💬 0</span>
          <span>🔁 0</span>
          <span>❤️ 0</span>
          <span>📤</span>
        </div>
      </div>
    </div>
  );
};

export default TwitterPreview;
