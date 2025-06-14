import React from "react";
import { motion } from "framer-motion";
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
          <motion.li
            key={post._id}
            className="top-post-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
          >
            <strong>{index + 1}. {post.title || "Untitled"}</strong><br />
            {labelMap[metric]}: {post.insights[metric]}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default TopPostsWidget;
