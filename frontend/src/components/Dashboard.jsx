import React, { useState, useEffect } from "react";
import ClientDropdown from "./ClientDropdown";
import PostTable from "./PostTable";
import SummaryCards from "./SummaryCards";
import "../styles.css";

const Dashboard = () => {
  const [clientId, setClientId] = useState("");
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ likes: 0, comments: 0, shares: 0 });

  useEffect(() => {
    if (!clientId) return;
  
    const fetchPosts = async () => {
      try {
        // 1. Get the client so we can get the token
        const clientRes = await fetch(`http://localhost:5000/api/clients`);
        const clients = await clientRes.json();
        const client = clients.find(c => c._id === clientId);
        const facebook = client?.socialAccounts?.find(acc => acc.platform === "Facebook");
        const accessToken = facebook?.companyToken;
  
        // 2. Get the posts
        const res = await fetch(`http://localhost:5000/api/posts?clientId=${clientId}`);
        const data = await res.json();
  
        // 3. Fetch insights with token
        const postsWithStats = await Promise.all(
          data.map(async (post) => {
            try {
              const response = await fetch(
                `http://localhost:5000/api/posts/${platFormPostIds}/insights?accessToken=${accessToken}`
              );
              const insights = await response.json();
              return {
                ...post,
                likes: insights.likes || 0,
                comments: insights.comments || 0,
                shares: insights.shares || 0,
              };
            } catch {
              return { ...post, likes: 0, comments: 0, shares: 0 };
            }
          })
        );
  
        setPosts(postsWithStats);
  
        let likes = 0,
          comments = 0,
          shares = 0;
        postsWithStats.forEach((p) => {
          likes += p.likes;
          comments += p.comments;
          shares += p.shares;
        });
        setStats({ likes, comments, shares });
      } catch (err) {
        console.error("Failed to fetch posts or token:", err);
      }
    };
  
    fetchPosts();
  }, [clientId]);
  
  

  return (
    <div className="dashboard-container" style={{ padding: "2rem" }}>
      <h2>📊 Dashboard</h2>
      <ClientDropdown onSelect={setClientId} />

      {clientId && (
        <>
          <SummaryCards stats={stats} />
          <PostTable posts={posts} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
