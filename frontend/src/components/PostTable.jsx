import React from "react";

const PostTable = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <p>No posts found for selected platform and client.</p>;
  }

  return (
    <table border="1" cellPadding="10" cellSpacing="0" style={{ marginTop: "2rem", width: "100%", textAlign: "left" }}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Client</th>
          <th>Scheduled Date</th>
          <th>Platforms</th>
          <th>Status</th>
          <th>Likes</th>
          <th>Shares</th>
          <th>Comments</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => {
          const insights = post.insights || {}; // fallback to empty object if missing
          return (
            <tr key={post._id}>
              <td>{post.title}</td>
              <td>{post.client}</td>
              <td>{new Date(post.scheduledDate).toLocaleString()}</td>
              <td>{post.selectedPlatforms.join(", ")}</td>
              <td>{post.status}</td>
              <td>{insights.likes ?? "-"}</td>
              <td>{insights.shares ?? "-"}</td>
              <td>{insights.comments ?? "-"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PostTable;
