// components/SummaryCards.jsx
import React from "react";

const SummaryCards = ({ posts }) => {
  if (!Array.isArray(posts)) return null;
  
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, p) => sum + (p.insights?.likes || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.insights?.comments || 0), 0);
  const totalShares = posts.reduce((sum, p) => sum + (p.insights?.shares || 0), 0);
  const avgLikes = totalPosts > 0 ? (totalLikes / totalPosts).toFixed(1) : 0;

  const cardStyle = {
    background: "#f4f6f8",
    borderRadius: "8px",
    padding: "1rem 2rem",
    textAlign: "center",
    flex: 1,
    minWidth: 120,
  };

  return (
    <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
      <div style={cardStyle}>
        <h4>Total Posts</h4>
        <p>{totalPosts}</p>
      </div>
      <div style={cardStyle}>
        <h4>❤️ Total Likes</h4>
        <p>{totalLikes}</p>
      </div>
      <div style={cardStyle}>
        <h4>💬 Comments</h4>
        <p>{totalComments}</p>
      </div>
      <div style={cardStyle}>
        <h4>🔁 Shares</h4>
        <p>{totalShares}</p>
      </div>
      <div style={cardStyle}>
        <h4>📊 Avg Likes</h4>
        <p>{avgLikes}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
