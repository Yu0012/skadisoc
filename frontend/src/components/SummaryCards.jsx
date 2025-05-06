import React from "react";

const SummaryCards = ({ stats }) => {
  const cardStyle = {
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    width: "150px",
    textAlign: "center",
    background: "#f9f9f9"
  };

  return (
    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", marginBottom: "1rem" }}>
      <div style={cardStyle}>
        <h4>👍 Likes</h4>
        <p>{stats.likes}</p>
      </div>
      <div style={cardStyle}>
        <h4>💬 Comments</h4>
        <p>{stats.comments}</p>
      </div>
      <div style={cardStyle}>
        <h4>🔁 Shares</h4>
        <p>{stats.shares}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
