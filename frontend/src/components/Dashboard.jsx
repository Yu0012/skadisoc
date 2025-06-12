import React, { useState, useEffect } from "react";
import PostTable from "./PostTable";
import "../styles.css";
import SummaryCards from "./SummaryCards";
import DashboardCharts from "./DashboardChart";
import TopPostsWidget from "./TopPostsWidget";
import config from "../config";

const Dashboard = () => {
  // Get username from localStorage
  const [username, setUsername] = useState("");

  // State management for selected platform and client
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  
  // State for storing posts data
  const [allPosts, setAllPosts] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  
  // State for platform statistics
  const [platformCounts, setPlatformCounts] = useState({});

  /**
   * Fetch all posts and filter by selected platform
   * This effect runs when the selectedPlatform changes
   */
  useEffect(() => {
    const fetchPosts = async () => {
      if (!selectedPlatform) return;

      try {
        const token = localStorage.getItem("token");

        // Fetch both posts and clients data in parallel
        const [postsRes, clientsRes] = await Promise.all([
          fetch(`${config.API_BASE}/api/posts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${config.API_BASE}/api/clients/${selectedPlatform.toLowerCase()}/all`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (!postsRes.ok || !clientsRes.ok) {
          throw new Error("❌ Failed to fetch posts or clients");
        }

        const postData = await postsRes.json();
        const clientData = await clientsRes.json();

        const allClients = clientData.clients;
        
        // Filter posts by selected platform
        const platformFiltered = postData.posts.filter(post =>
          post.selectedPlatforms.includes(selectedPlatform.toLowerCase())
        );

        // Get unique client IDs from filtered posts
        const clientsWithPosts = [...new Set(platformFiltered.map(post => post.client))];

        // Match client objects with posts
        const matchedClientObjs = clientsWithPosts
          .map(id => allClients.find(c => c._id === id))
          .filter(Boolean);

        // Update state
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

  /**
   * Fetch user info to get username
   */

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${config.API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user info");

        const data = await res.json();
        setUsername(data.username); // Update state with username
      } catch (err) {
        console.error("❌ Failed to load user info:", err);
      }
    };

    fetchUserInfo();
  }, []);


  /**
   * Fetch total post counts for each platform
   * Runs once when component mounts
   */
  useEffect(() => {
    const fetchAllPostCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${config.API_BASE}/api/posts`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        const posts = data.posts;

        // Count posts per platform
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

  /**
   * Filter posts by selected client and enrich with platform insights
   * Runs when selectedClient or selectedPlatform changes
   */
  useEffect(() => {
    const enrichPostsWithStats = async () => {
      if (!selectedClient || !selectedPlatform) return;

      // Filter posts for selected client and platform
      const matchingPosts = allPosts.filter(
        post =>
          post.client === selectedClient &&
          post.selectedPlatforms.includes(selectedPlatform.toLowerCase())
      );

      let accessToken = null;

      // Get access token for the selected platform
      try {
        const token = localStorage.getItem("token");
        const platform = selectedPlatform.toLowerCase();
        const res = await fetch(`${config.API_BASE}/api/clients/${platform}/all`, {
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

      // Enrich posts with platform-specific insights
      const enriched = await Promise.all(
        matchingPosts.map(async (post) => {
          // Facebook insights
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

          // Instagram insights
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

          // Default return if no platform-specific insights
          return { ...post, insights: { likes: "-", shares: "-", comments: "-" } };
        })
      );

      setFilteredPosts(enriched);
    };

    enrichPostsWithStats();
  }, [selectedClient, selectedPlatform, allPosts]);

  /**
   * Fetch platform insights when both platform and client are selected
   */
  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem("token");
      const platform = selectedPlatform.toLowerCase();

      // Fetch all clients for the selected platform
      const res = await fetch(`${config.API_BASE}/api/clients/${platform}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { clients } = await res.json();

      // Match selected client by _id
      const matched = clients.find(c => c._id === selectedClient);

      // Get appropriate access token based on platform
      const accessToken = matched?.pageAccessToken || matched?.accessToken || null;

      if (!accessToken) {
        console.warn("⚠️ No access token found for selected client.");
        return;
      }

      console.log(`✅ Access token ready for ${selectedPlatform}:`, accessToken);
      
    } catch (err) {
      console.error("❌ Error fetching platform client or token:", err);
    }
  };

  // Trigger insights fetch when platform and client are selected
  useEffect(() => {
    if (selectedPlatform && selectedClient) {
      fetchInsights();
    }
  }, [selectedPlatform, selectedClient]);

  return (
    <div className="dashboard-container" style={{ padding: "2rem" }}>
          {/* Dashboard Header */}
          <div className="posts-header">
            <div className="welcome-message">
              <p>Welcome back,</p>
              <h2 className="user-name">{username || "Loading..."}</h2>
            </div>
          </div>



      {/* Platform and Client Selectors */}
      <div className="dashboard-selectors">
        <select
          onChange={(e) => setSelectedPlatform(e.target.value)}
          value={selectedPlatform}
          className="dashboard-dropdown"
        >
          <option value="">Select Platform</option>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
          <option value="Twitter">Twitter</option>
          <option value="LinkedIn">LinkedIn</option>
        </select>

        {selectedPlatform && (
          <select
            onChange={(e) => setSelectedClient(e.target.value)}
            value={selectedClient}
            className="dashboard-dropdown"
          >
            <option value="">Select Client</option>
            {filteredClients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.pageName || client.username || client.name || client._id}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Summary Cards showing platform statistics */}
      <SummaryCards stats={platformCounts} />

      {/* Display filtered posts data when available */}
      {filteredPosts.length > 0 && (
        <>
          <SummaryCards posts={filteredPosts} />
          <DashboardCharts posts={filteredPosts} />
          
          {/* Top Posts Widgets Section */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginTop: "2rem" }}>
            {/* Likes Widget */}
            <div className="widget-container">
              <h4 className="dashboard-section-title">
                <span className="icon">❤️</span> Top 5 Posts by Likes
              </h4>
              <TopPostsWidget posts={filteredPosts} metric="likes" />
            </div>

            {/* Comments Widget */}
            <div className="widget-container">
              <h4 className="dashboard-section-title">
                <span className="icon">💬</span> Top 5 Posts by Comments
              </h4>
              <TopPostsWidget posts={filteredPosts} metric="comments" />
            </div>

            {/* Shares Widget */}
            <div className="widget-container">
              <h4 className="dashboard-section-title">
                <span className="icon">🔄</span> Top 5 Posts by Shares
              </h4>
              <TopPostsWidget posts={filteredPosts} metric="shares" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;