import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DashboardCharts = ({ posts }) => {
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#333");
  const [gridColor, setGridColor] = useState("rgba(0, 0, 0, 0.05)");

  useEffect(() => {
    const applyThemeColors = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      setBgColor(rootStyle.getPropertyValue('--chart-bg-color')?.trim() || "#1e1e2f");
      setTextColor(rootStyle.getPropertyValue('--chart-text-color')?.trim() || "#f0f0f0");
      setGridColor(rootStyle.getPropertyValue('--chart-grid-color')?.trim() || "rgba(255,255,255,0.1)");
    };

    applyThemeColors();

    const observer = new MutationObserver(applyThemeColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-selected-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const limitedPosts = [...posts].slice(0, 10); 

  const labels = limitedPosts.map((p) => p.title || "Untitled");
  const likes = limitedPosts.map((p) => p.insights?.likes || 0);
  const comments = limitedPosts.map((p) => p.insights?.comments || 0);
  const shares = limitedPosts.map((p) => p.insights?.shares || 0);

  return (
    <motion.div
      className="dashboard-bar-chart"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: bgColor,
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        maxWidth: "1000px",
        margin: "2rem auto",
      }}
    >
      <div style={{ overflowX: "auto", paddingBottom: "1rem" }}>
        <div style={{ minWidth: `${posts.length * 120}px`, paddingRight: "1rem" }}>
          <Bar
            data={{
              labels,
              datasets: [
                { label: "Likes", data: likes, backgroundColor: "#4267B2" },
                { label: "Comments", data: comments, backgroundColor: "#00aced" },
                { label: "Shares", data: shares, backgroundColor: "#8b9dc3" },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: 800,
                easing: "easeOutCubic",
                delay: (ctx) => ctx.dataIndex * 100,
              },
              plugins: {
                legend: {
                  labels: { color: textColor },
                  position: "top",
                },
                tooltip: {
                  enabled: true,
                  backgroundColor: "#222",
                  titleColor: "#fff",
                  bodyColor: "#eee",
                },
              },
              scales: {
                x: {
                  ticks: { color: textColor },
                  grid: { color: gridColor },
                },
                y: {
                  ticks: { color: textColor },
                  grid: { color: gridColor },
                },
              },
            }}
            height={400}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardCharts;
