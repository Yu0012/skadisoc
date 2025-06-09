import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles.css";
import config from '../config';

const InstagramPreview = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${config.API_BASE}/api/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Error loading post:", err);
      }
    };

    fetchPost();
  }, [postId]);

  if (!post) return <div className="insta-preview-page">Loading...</div>;

  return (
    <div className="insta-preview-page">
      <div className="insta-post-container">
        <div className="insta-header">
          <img
            src="https://i.imgur.com/8Km9tLL.png"
            className="insta-avatar"
            alt="profile"
          />
          <div className="insta-user-info">
            <strong>{post.client || "User"}</strong>
            <span>{new Date(post.scheduledDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="insta-image-wrapper">
          {post.filePath && (
            <img
              src={`${config.API_BASE}${post.filePath}`}
              alt="Instagram"
              className="insta-main-image"
            />
          )}
        </div>

        <div className="insta-actions">
          ❤️ 💬 ↗️
        </div>

        <div className="insta-caption">
          <strong>{post.client} </strong>
          {post.content}
          <br />
          <span className="insta-hashtag">{post.hashtags}</span>
        </div>

        <div className="insta-time">
          Posted on {new Date(post.scheduledDate).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default InstagramPreview;
