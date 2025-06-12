import React from "react";
import "../styles.css"; 
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
    <div className="top-posts-widget">
      <h3 className="widget-title">Top 5 Posts by {labelMap[metric]}</h3>
      <ul className="top-posts-list">
        {sorted.map((post, index) => (
          <li key={post._id} className="top-post-item">
            <strong>{index + 1}. {post.title || "Untitled"}</strong><br />
            {labelMap[metric]}: {post.insights[metric]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopPostsWidget;
