import React, { useState, useEffect } from "react";
import PostTable from "./PostTable";
import "../styles.css";
import SummaryCards from "./SummaryCards";
import DashboardCharts from "./DashboardChart";
import TopPostsWidget from "./TopPostsWidget";
import DashboardChartSection from "./DashboardChartSection";

const Dashboard = () => {
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

        // Fetch both posts and clients data in parallel for better performance
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
        
        // Filter posts by selected platform (case-insensitive)
        const platformFiltered = postData.posts.filter(post =>
          post.selectedPlatforms.includes(selectedPlatform.toLowerCase())
        );

        // Get unique client IDs from filtered posts using Set
        const clientsWithPosts = [...new Set(platformFiltered.map(post => post.client))];

        // Match client objects with posts and filter out any undefined values
        const matchedClientObjs = clientsWithPosts
          .map(id => allClients.find(c => c._id === id))
          .filter(Boolean);

        // Update state with filtered data
        setAllPosts(platformFiltered);
        setFilteredClients(matchedClientObjs);
        setSelectedClient(""); // Reset client selection when platform changes
        setFilteredPosts([]);  // Clear filtered posts
      } catch (err) {
        console.error("Failed to fetch posts:", err.message);
      }
    };

    fetchPosts();
  }, [selectedPlatform]);

  /**
   * Fetch total post counts for each platform
   * Runs once when component mounts to show platform statistics
   */
  useEffect(() => {
    const fetchAllPostCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/posts", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        const posts = data.posts;

        // Count posts per platform for the summary cards
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
        const res = await fetch(`http://localhost:5000/api/clients/${platform}/all`, {
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
      {/* Dashboard Header */}
      <h2 className="dashboard-header">
        📊 Dashboard
      </h2>

      {/* Platform and Client Selectors */}
      <div className="dashboard-selectors">
        {/* Platform dropdown selector */}
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

        {/* Client dropdown selector (only shown when platform is selected) */}
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
          {/* Summary cards with engagement metrics */}
          <SummaryCards posts={filteredPosts} />
          
          {/* New Dashboard Chart Section - Replaces the old charts and carousel */}
          <DashboardChartSection posts={filteredPosts} />
          
          
         
        </>
      )}
    </div>
  );
};

export default Dashboard;