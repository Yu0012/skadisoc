// components/DashboardCharts.jsx
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

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DashboardCharts = ({ posts }) => {
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#333");
  const [gridColor, setGridColor] = useState("rgba(0, 0, 0, 0.05)");

  useEffect(() => {
    // Recalculate on mount and when theme changes
    const applyThemeColors = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      setBgColor(rootStyle.getPropertyValue('--chart-bg-color')?.trim() || "#1e1e2f");
      setTextColor(rootStyle.getPropertyValue('--chart-text-color')?.trim() || "#f0f0f0");
      setGridColor(rootStyle.getPropertyValue('--chart-grid-color')?.trim() || "rgba(255,255,255,0.1)");
    };

    applyThemeColors();

    // Optional: observe theme change
    const observer = new MutationObserver(applyThemeColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-selected-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Prepare chart data
  const labels = posts.map((p) => p.title || "Untitled");
  const likes = posts.map((p) => p.insights?.likes || 0);
  const comments = posts.map((p) => p.insights?.comments || 0);
  const shares = posts.map((p) => p.insights?.shares || 0);

  return (
    <div
      className="dashboard-bar-chart"
      style={{
        background: bgColor,
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        maxWidth: "1000px",
        margin: "2rem auto",
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
        height={400}
      />
    </div>
  );
};

export default DashboardCharts;
