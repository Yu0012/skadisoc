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
  // Theme-aware color states
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#333");
  const [gridColor, setGridColor] = useState("rgba(0, 0, 0, 0.05)");

  // Update colors based on current theme
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

  // Extract labels and metric data from posts
  const labels = posts.map((p) => p.title || "Untitled");
  const likes = posts.map((p) => p.insights?.likes || 0);
  const comments = posts.map((p) => p.insights?.comments || 0);
  const shares = posts.map((p) => p.insights?.shares || 0);

  return (
    <motion.div
      className="dashboard-bar-chart"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: bgColor,
        borderRadius: "16px",                     // Rounded corners to match cards
        padding: "1.5rem",                        // More padding like widgets
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08)", // Deeper shadow to match cards
        maxWidth: "1000px",
        margin: "1.5rem auto",                    // Bottom margin to float above next section
        height: "400px",                          // Fixed height to match TopPostsWidget
      }}
    >
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Likes",
              data: likes,
              backgroundColor: "#4267B2",
            },
            {
              label: "Comments",
              data: comments,
              backgroundColor: "#00aced",
            },
            {
              label: "Shares",
              data: shares,
              backgroundColor: "#8b9dc3",
            },
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
              labels: {
                color: textColor,
              },
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
      />
    </motion.div>
  );
};

export default DashboardCharts;
