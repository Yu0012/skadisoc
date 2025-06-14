import React from "react";

const SummaryCards = ({ posts }) => {
  if (!Array.isArray(posts)) return null;

  const safeNumber = (value) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + safeNumber(post.insights?.likes), 0);
  const totalComments = posts.reduce((sum, post) => sum + safeNumber(post.insights?.comments), 0);
  const totalShares = posts.reduce((sum, post) => sum + safeNumber(post.insights?.shares), 0);
  const avgLikes = totalPosts > 0 ? (totalLikes / totalPosts).toFixed(1) : "0";

  const cardStyle = {
    background: "var(--card-bg-color)",
    color: "var(--card-text-color)",
    borderRadius: "8px",
    padding: "1rem 2rem",
    textAlign: "center",
    flex: 1,
    minWidth: 120,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
        marginBottom: "2rem",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <div style={cardStyle}>
        <h4>Total Posts</h4>
        <p>{totalPosts}</p>
      </div>
      <div style={cardStyle}>
        <h4>👍 Total Likes</h4>
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
