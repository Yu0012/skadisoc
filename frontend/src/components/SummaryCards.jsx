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
        <h4>Facebook</h4>
        <p>{stats.facebook || 0}</p>
      </div>
      <div style={cardStyle}>
        <h4>Instagram</h4>
        <p>{stats.instagram || 0}</p>
      </div>
      <div style={cardStyle}>
        <h4>Twitter</h4>
        <p>{stats.twitter || 0}</p>
      </div>
      <div style={cardStyle}>
        <h4>LinkedIn</h4>
        <p>{stats.linkedin || 0}</p>
      </div>
    </div>
  );
};

export default SummaryCards;