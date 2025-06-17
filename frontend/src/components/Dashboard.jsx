import React, { useState, useEffect } from "react";
import PostTable from "./PostTable";
import "../styles.css";
import SummaryCards from "./SummaryCards";
import DashboardCharts from "./DashboardChart";
import TopPostsWidget from "./TopPostsWidget";
import DashboardChartSection from "./DashboardChartSection";
import config from '../config'; 

const Dashboard = () => {
  // State management for selected platform and client
  const [selectedPlatform, setSelectedPlatform] = useState(() => {
    return localStorage.getItem("selectedPlatform") || "";
  });

  const [selectedClient, setSelectedClient] = useState(() => {
    return localStorage.getItem("selectedClient") || "";
  });

  // State for storing posts data
  const [allPosts, setAllPosts] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  
  // State for platform statistics
  const [platformCounts, setPlatformCounts] = useState({});
  const [username, setUsername] = useState("");

  /**
   * Fetch all posts and filter by selected platform
   * This effect runs when the selectedPlatform changes
   */
  useEffect(() => {
    const fetchPosts = async () => {
      if (!selectedPlatform) return;

      try {
        const token = localStorage.getItem("token");

        // Fetch both posts and clients data in parallel for better performance
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
        if (!clientData || !Array.isArray(clientData.clients)) {
          setFilteredClients([]);
          return;
        }

        const allClients = clientData.clients;
        
        const matchedClientObjs = allClients; // Show all available clients

        // 🔁 STEP 3: Random default selection on first load
        if (!localStorage.getItem("selectedPlatform")) {
          const platforms = ["Facebook", "Instagram", "Twitter"];
          const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
          setSelectedPlatform(randomPlatform);
          localStorage.setItem("selectedPlatform", randomPlatform);
        }

        if (!localStorage.getItem("selectedClient") && matchedClientObjs.length > 0) {
          const randomClient = matchedClientObjs[Math.floor(Math.random() * matchedClientObjs.length)]._id;
          setSelectedClient(randomClient);
          localStorage.setItem("selectedClient", randomClient);
        }

        // Update state with filtered data
        setAllPosts(postData.posts || []);
        setFilteredClients(matchedClientObjs);
        
        setFilteredPosts([]);  // Clear filtered posts
      } catch (err) {
        console.error("Failed to fetch posts:", err.message);
      }
    };

    fetchPosts();
  }, [selectedPlatform]);

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
   * Runs once when component mounts to show platform statistics
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

        // Count posts per platform for the summary cards
        const counts = {
          facebook: posts.filter(p => p.selectedPlatforms.includes("facebook")).length,
          instagram: posts.filter(p => p.selectedPlatforms.includes("instagram")).length,
          twitter: posts.filter(p => p.selectedPlatforms.includes("twitter")).length,
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
   * This is where we fetch engagement metrics from platform APIs
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

      // Get access token for the selected platform from our backend
      try {
        const token = localStorage.getItem("token");
        const platform = selectedPlatform.toLowerCase();
        const res = await fetch(`${config.API_BASE}/api/clients/${platform}/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { clients } = await res.json();
        const matched = clients.find(c => c._id === selectedClient);

        // Different platforms might store the token in different fields
        accessToken = matched?.pageAccessToken || matched?.accessToken || null;

        if (!accessToken) {
          console.warn("⚠️ No access token found for selected client.");
        }
      } catch (err) {
        console.warn("⚠️ Failed to fetch access token:", err.message);
      }

      // Enrich posts with platform-specific insights by calling platform APIs
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

          // Default return if no platform-specific insights are available
          return { ...post, insights: { likes: "-", shares: "-", comments: "-" } };
        })
      );

      setFilteredPosts(enriched);
    };

    enrichPostsWithStats();
  }, [selectedClient, selectedPlatform, allPosts]);

  return (
    
    <div className="dashboard-container">
      <div className="welcome-left">
          <p>Welcome back,</p>
          <h2 className="user-name">{username || "Loading..."}</h2>
        </div>
      {/* Updated Dashboard Header with Split Layout */}
      <div className="posts-header-split">

        <div className="dropdowns-center">
          <div className="dashboard-selectors">
            {/* Platform dropdown selector */}
            <select
              onChange={(e) => {
                const platform = e.target.value;
                setSelectedPlatform(platform);
                localStorage.setItem("selectedPlatform", platform);
              }}
              value={selectedPlatform}
              className="dashboard-dropdown"
            >
              <option value="">Select Platform</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Twitter">Twitter</option>
            </select>

            {/* Client dropdown selector (only shown when platform is selected) */}
            {selectedPlatform && (
              <select
                onChange={(e) => {
                  const client = e.target.value;
                  setSelectedClient(client);
                  localStorage.setItem("selectedClient", client);
                }}
                value={selectedClient}
                className="dashboard-dropdown"
              >
                <option value="">Select Client</option>
                {(filteredClients || []).map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.pageName || client.username || client.name || client._id}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards showing platform statistics */}
      <SummaryCards stats={platformCounts} />

      {/* Display filtered posts data when available */}
      {filteredPosts.length > 0 && (
        <>
          {/* Summary cards with engagement metrics */}
          <div className="centered-cards">
          <SummaryCards posts={filteredPosts} />
          </div>
          
          {/* New Dashboard Chart Section - Replaces the old charts and carousel */}
          <DashboardChartSection posts={filteredPosts} />
        </>
      )}

    </div>
  );
};

export default Dashboard;