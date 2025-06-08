import React, { useState, useEffect } from "react";
import PostTable from "./PostTable";
import "../styles.css";
import SummaryCards from "./SummaryCards";
import DashboardCharts from "./DashboardChart";
import TopPostsWidget from "./TopPostsWidget";

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

      const [postsRes, clientsRes] = await Promise.all([
        fetch("http://localhost:5000/api/posts", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/clients/${selectedPlatform.toLowerCase()}/all`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (!postsRes.ok || !clientsRes.ok) {
        throw new Error("❌ Failed to fetch posts or clients");
      }

      const postData = await postsRes.json();
      const clientData = await clientsRes.json();

      const allClients = clientData.clients;
      const platformFiltered = postData.posts.filter(post =>
        post.selectedPlatforms.includes(selectedPlatform.toLowerCase())
      );

      const clientsWithPosts = [...new Set(platformFiltered.map(post => post.client))];

      const matchedClientObjs = clientsWithPosts
        .map(id => allClients.find(c => c._id === id))
        .filter(Boolean);

      setAllPosts(platformFiltered);
      setFilteredClients(matchedClientObjs);
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
      const res = await fetch("http://localhost:5000/api/posts", {
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
      const token = localStorage.getItem("token");
      const platform = selectedPlatform.toLowerCase();
      const res = await fetch(`http://localhost:5000/api/clients/${platform}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { clients } = await res.json();
      const matched = clients.find(c => c._id === selectedClient);

      accessToken = matched?.pageAccessToken || matched?.accessToken || null;

      if (!accessToken) {
        console.warn("⚠️ No access token found for selected client.");
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

const fetchInsights = async () => {
  try {
    const token = localStorage.getItem("token");
    const platform = selectedPlatform.toLowerCase();

    // Fetch all clients for the selected platform
    const res = await fetch(`http://localhost:5000/api/clients/${platform}/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { clients } = await res.json();

    // Match selected client by _id
    const matched = clients.find(c => c._id === selectedClient);

    // Detect token field based on platform
    const accessToken = matched?.pageAccessToken || matched?.accessToken || null;

    if (!accessToken) {
      console.warn("⚠️ No access token found for selected client.");
      return;
    }

    // Call your insights logic here with the accessToken
    console.log(`✅ Access token ready for ${selectedPlatform}:`, accessToken);
    
    // Placeholder: You can now use accessToken to fetch platform insights (e.g., Graph API)
    // Example: await getFacebookInsights(accessToken);

  } catch (err) {
    console.error("❌ Error fetching platform client or token:", err);
  }
};

useEffect(() => {
  if (selectedPlatform && selectedClient) {
    fetchInsights();
  }
}, [selectedPlatform, selectedClient]);



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
            <option key={client._id} value={client._id}>
              {client.pageName || client.username || client.name || client._id}
            </option>
          ))}
        </select>
      )}
      {filteredPosts.length > 0 && (
        <>
          <SummaryCards posts={filteredPosts} />
          <DashboardCharts posts={filteredPosts} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginTop: "2rem" }}>
            <TopPostsWidget posts={filteredPosts} metric="likes" />
            <TopPostsWidget posts={filteredPosts} metric="comments" />
            <TopPostsWidget posts={filteredPosts} metric="shares" />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
