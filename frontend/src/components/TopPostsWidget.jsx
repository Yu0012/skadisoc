// components/TopPostsWidget.jsx
import React from "react";

const TopPostsWidget = ({ posts, metric = "likes" }) => {
  const sorted = [...posts]
    .filter(p => p.insights && typeof p.insights[metric] === "number")
    .sort((a, b) => b.insights[metric] - a.insights[metric])
    .slice(0, 5);

  const labelMap = {
    likes: "❤️ Likes",
    comments: "💬 Comments",
    shares: "🔁 Shares",
  };

  return (
    <div style={{ width: "100%", maxWidth: 500 }}>
      <h3>Top 5 Posts by {labelMap[metric]}</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {sorted.map((post, index) => (
          <li key={post._id} style={{ marginBottom: "10px", background: "#f5f5f5", padding: "10px", borderRadius: "6px" }}>
            <strong>{index + 1}. {post.title || "Untitled"}</strong><br />
            {labelMap[metric]}: {post.insights[metric]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopPostsWidget;
