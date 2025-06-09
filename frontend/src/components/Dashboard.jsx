import React, { useState, useEffect } from "react";
import PostTable from "./PostTable";
import "../styles.css";
import SummaryCards from "./SummaryCards";
import config from '../config';

const Dashboard = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [platformCounts, setPlatformCounts] = useState({});

  
    // Fetch all posts and filter by platform
  useEffect(() => {
  const fetchPosts = async () => {
    if (!selectedPlatform) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.API_BASE}/api/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();

      const platformFiltered = data.posts.filter(post =>
        post.selectedPlatforms.includes(selectedPlatform.toLowerCase())
      );

      const clientsWithPosts = [
        ...new Set(platformFiltered.map(post => post.client)),
      ];

      setAllPosts(platformFiltered);
      setFilteredClients(clientsWithPosts);
      setSelectedClient("");
      setFilteredPosts([]);
    } catch (err) {
      console.error("Failed to fetch posts:", err.message);
    }
  };

  fetchPosts();
}, [selectedPlatform]);

useEffect(() => {
  const fetchAllPostCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${config.API_BASE}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      const posts = data.posts;

      const counts = {
        facebook: posts.filter(p => p.selectedPlatforms.includes("facebook")).length,
        instagram: posts.filter(p => p.selectedPlatforms.includes("instagram")).length,
        twitter: posts.filter(p => p.selectedPlatforms.includes("twitter")).length,
        linkedin: posts.filter(p => p.selectedPlatforms.includes("linkedin")).length,
      };

      setPlatformCounts(counts);
    } catch (err) {
      console.error("❌ Error fetching all post counts:", err.message);
    }
  };

  fetchAllPostCounts();
}, []);


  // Filter by client and enrich with Facebook stats
  useEffect(() => {
  const enrichPostsWithStats = async () => {
    if (!selectedClient || !selectedPlatform) return;

    const matchingPosts = allPosts.filter(
      post =>
        post.client === selectedClient &&
        post.selectedPlatforms.includes(selectedPlatform.toLowerCase())
    );


    let accessToken = null;

    // Get token for Facebook or Instagram
    try {
      if (selectedPlatform === "Facebook") {
        const res = await fetch(`${config.API_BASE}/api/facebook-clients`);
        const fbClients = await res.json();
        const matched = fbClients.find(c => c.companyName === selectedClient);
        if (matched) {
          const fbRes = await fetch(`${config.API_BASE}/api/facebook-clients/by-client/${matched._id}`);
          const fbData = await fbRes.json();
          accessToken = fbData?.pageAccessToken;
        }
      } else if (selectedPlatform === "Instagram") {
        const res = await fetch(`${config.API_BASE}/api/instagram-clients`);
        const igClients = await res.json();
        const matched = igClients.find(c => c.companyName === selectedClient);
        if (matched) {
          const igRes = await fetch(`${config.API_BASE}/api/instagram-clients/by-client/${matched._id}`);
          const igData = await igRes.json();
          accessToken = igData?.accessToken;
        }
      }
    } catch (err) {
      console.warn("⚠️ Failed to fetch access token:", err.message);
    }

    const enriched = await Promise.all(
      matchingPosts.map(async (post) => {
        // Facebook
        if (
          selectedPlatform === "Facebook" &&
          post.platformPostIds?.facebook &&
          accessToken
        ) {
          try {
            const res = await fetch(
              `https://graph.facebook.com/v22.0/${post.platformPostIds.facebook}?fields=likes.summary(true),shares,comments.summary(true)&access_token=${accessToken}`
            );
            const insights = await res.json();
            return {
              ...post,
              insights: {
                likes: insights.likes?.summary?.total_count || 0,
                shares: insights.shares?.count || 0,
                comments: insights.comments?.summary?.total_count || 0,
              }
            };
          } catch (err) {
            console.warn(`❌ Facebook stats error for ${post._id}:`, err.message);
          }
        }

        // Instagram
        if (
          selectedPlatform === "Instagram" &&
          post.platformPostIds?.instagram &&
          accessToken
        ) {
          try {
            const res = await fetch(
              `https://graph.facebook.com/v22.0/${post.platformPostIds.instagram}?fields=like_count,comments_count&access_token=${accessToken}`
            );
            const insights = await res.json();
            return {
              ...post,
              insights: {
                likes: insights.like_count || 0,
                shares: "-", // Not available on Instagram API
                comments: insights.comments_count || 0,
              }
            };
          } catch (err) {
            console.warn(`❌ Instagram stats error for ${post._id}:`, err.message);
          }
        }

        return { ...post, insights: { likes: "-", shares: "-", comments: "-" } };
      })
    );

    setFilteredPosts(enriched);
  };

  enrichPostsWithStats();
}, [selectedClient, selectedPlatform, allPosts]);



  return (
    <div className="dashboard-container" style={{ padding: "2rem" }}>
      <h2>📊 Dashboard</h2>
      <SummaryCards stats={platformCounts} />

      <select
        onChange={(e) => setSelectedPlatform(e.target.value)}
        value={selectedPlatform}
        style={{ marginBottom: "1rem" }}
      >
        <option value="">Select Platform</option>
        <option value="Facebook">Facebook</option>
        <option value="Instagram">Instagram</option>
        <option value="Twitter">Twitter</option>
      </select>

      {selectedPlatform && (
        <select
          onChange={(e) => setSelectedClient(e.target.value)}
          value={selectedClient}
          style={{ marginBottom: "1rem" }}
        >
          <option value="">Select Client</option>
          {filteredClients.map((client, idx) => (
            <option key={idx} value={client}>{client}</option>
          ))}
        </select>
      )}

      {filteredPosts.length > 0 && (
        <PostTable
          posts={filteredPosts}
          platform={selectedPlatform}
          clientId={selectedClient}
        />
      )}
    </div>
  );
};

export default Dashboard;
