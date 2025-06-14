import React, { useState, useEffect, useCallback } from "react";
import "../styles.css";
import SummaryCards from "./SummaryCards";
import DashboardChartSection from "./DashboardChartSection";

const API_BASE_URL = "http://localhost:5000/api";
const PLATFORMS = [
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "Twitter", label: "Twitter" },
  { value: "LinkedIn", label: "LinkedIn" }
];

const Dashboard = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [platformCounts, setPlatformCounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}:`, err.message);
      setError(err.message);
      throw err;
    }
  }, []);

  const fetchPlatformPosts = useCallback(async () => {
    if (!selectedPlatform) return;
    setIsLoading(true);
    setError(null);

    try {
      const [postsData, clientsData] = await Promise.all([
        fetchData("/posts"),
        fetchData(`/clients/${selectedPlatform.toLowerCase()}/all`)
      ]);

      const platformFiltered = postsData.posts.filter(post =>
        post.selectedPlatforms.includes(selectedPlatform.toLowerCase())
      );

      const clientsWithPosts = [...new Set(platformFiltered.map(post => post.client))];
      const matchedClientObjs = clientsWithPosts
        .map(id => clientsData.clients.find(c => c._id === id))
        .filter(Boolean);

      setAllPosts(platformFiltered);
      setFilteredClients(matchedClientObjs);
      setSelectedClient("");
      setFilteredPosts([]);
    } catch (err) {
      setError("Failed to load platform data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlatform, fetchData]);

  const fetchPlatformCounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { posts } = await fetchData("/posts");
      const counts = PLATFORMS.reduce((acc, platform) => ({
        ...acc,
        [platform.value.toLowerCase()]: posts.filter(p => 
          p.selectedPlatforms.includes(platform.value.toLowerCase())
        ).length
      }), {});
      setPlatformCounts(counts);
    } catch (err) {
      setError("Failed to load platform statistics");
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const fetchPostInsights = useCallback(async () => {
    if (!selectedClient || !selectedPlatform) return;
    setIsLoading(true);
    setError(null);

    try {
      const platform = selectedPlatform.toLowerCase();
      const { clients } = await fetchData(`/clients/${platform}/all`);
      const matchedClient = clients.find(c => c._id === selectedClient);
      const accessToken = matchedClient?.pageAccessToken || matchedClient?.accessToken;

      if (!accessToken) {
        console.warn("No access token available");
        return;
      }

      const matchingPosts = allPosts.filter(
        post => post.client === selectedClient &&
          post.selectedPlatforms.includes(platform)
      );

      const enriched = await Promise.all(
        matchingPosts.map(post => enrichPostWithInsights(post, platform, accessToken))
      );
      setFilteredPosts(enriched);
    } catch (err) {
      setError("Failed to load post insights");
    } finally {
      setIsLoading(false);
    }
  }, [selectedClient, selectedPlatform, allPosts, fetchData]);

  const enrichPostWithInsights = async (post, platform, accessToken) => {
    const platformId = post.platformPostIds?.[platform.toLowerCase()];
    if (!platformId) return { ...post, insights: { likes: "-", shares: "-", comments: "-" } };

    try {
      switch (platform) {
        case "facebook":
          return await fetchFacebookInsights(post, platformId, accessToken);
        case "instagram":
          return await fetchInstagramInsights(post, platformId, accessToken);
        default:
          return { ...post, insights: { likes: "-", shares: "-", comments: "-" } };
      }
    } catch (err) {
      console.warn(`Failed to fetch ${platform} insights:`, err.message);
      return { ...post, insights: { likes: "-", shares: "-", comments: "-" } };
    }
  };

  const fetchFacebookInsights = async (post, postId, token) => {
    const res = await fetch(
      `https://graph.facebook.com/v22.0/${postId}?fields=likes.summary(true),shares,comments.summary(true)&access_token=${token}`
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
  };

  const fetchInstagramInsights = async (post, postId, token) => {
    const res = await fetch(
      `https://graph.facebook.com/v22.0/${postId}?fields=like_count,comments_count&access_token=${token}`
    );
    const insights = await res.json();
    return {
      ...post,
      insights: {
        likes: insights.like_count || 0,
        shares: "-",
        comments: insights.comments_count || 0,
      }
    };
  };

  useEffect(() => {
    fetchPlatformCounts();
  }, [fetchPlatformCounts]);

  useEffect(() => {
    fetchPlatformPosts();
  }, [selectedPlatform, fetchPlatformPosts]);

  useEffect(() => {
    fetchPostInsights();
  }, [selectedClient, fetchPostInsights]);

  return (
    <div className="dashboard-container">
      {/* Unified Header with Dropdowns */}
      <div className="dashboard-header-center">
        <h2 className="dashboard-header">Dashboard</h2>
        <div className="platform-select-group">
          <select
            onChange={(e) => setSelectedPlatform(e.target.value)}
            value={selectedPlatform}
            className="pill-dropdown"
            disabled={isLoading}
          >
            <option value="">Select Platform</option>
            {PLATFORMS.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => setSelectedClient(e.target.value)}
            value={selectedClient}
            className="pill-dropdown"
            disabled={!selectedPlatform || isLoading || !filteredClients.length}
          >
            <option value="">Select Client</option>
            {filteredClients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.pageName || client.username || client.name || client._id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Indicators */}
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-indicator">Loading...</div>}

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <SummaryCards stats={platformCounts} />
        {filteredPosts.length > 0 && (
          <>
            <SummaryCards posts={filteredPosts} />
            <DashboardChartSection posts={filteredPosts} />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;