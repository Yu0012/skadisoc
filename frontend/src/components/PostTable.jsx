import React from "react";

const PostTable = ({ posts }) => {
  return (
    <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "1rem" }}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Content</th>
          <th>Likes</th>
          <th>Comments</th>
          <th>Shares</th>
        </tr>
      </thead>
      <tbody>
        {posts.map(post => (
          <tr key={post._id}>
            <td>{post.title}</td>
            <td>{post.content}</td>
            <td>{post.likes || 0}</td>
            <td>{post.comments || 0}</td>
            <td>{post.shares || 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PostTable;
