// components/DashboardCharts.jsx
import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const DashboardCharts = ({ posts }) => {
  const labels = posts.map(p => p.title || "Untitled");
  const likes = posts.map(p => p.insights?.likes || 0);
  const comments = posts.map(p => p.insights?.comments || 0);
  const shares = posts.map(p => p.insights?.shares || 0);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
      <div style={{width: "100%", maxWidth: "1000px", margin: "2rem auto", padding: "1rem", background: "#fff", borderRadius: "8px",boxShadow: "0 2px 8px rgba(0,0,0,0.06)"}}>
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
            plugins: { legend: { position: "top" } }
          }}
          height={400}
        />
      </div>

      <div style={{ width: "300px", margin: "2rem auto" }}>
        <Doughnut
          data={{
            labels: ["Likes", "Comments", "Shares"],
            datasets: [
              {
                data: [
                  likes.reduce((a, b) => a + b, 0),
                  comments.reduce((a, b) => a + b, 0),
                  shares.reduce((a, b) => a + b, 0),
                ],
                backgroundColor: ["#4267B2", "#00aced", "#8b9dc3"],
              },
            ],
          }}
        />
      </div>
    </div>
  );
};

export default DashboardCharts;

