import React, { useState } from "react";
import DashboardCharts from "./DashboardChart";
import TopPostsWidget from "./TopPostsWidget";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const DashboardChartSection = ({ posts }) => {
  const [view, setView] = useState("chart"); // 'chart' or 'top'

  const handleToggle = () => {
    setView(prev => (prev === "chart" ? "top" : "chart"));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        padding: "0 1rem",
        minHeight: "420px",
      }}
    >
      {/* Left Arrow */}
      <button
        style={{
          fontSize: "2rem",
          background: "none",
          border: "none",
          color: "var(--chart-text-color)",
          cursor: "pointer",
          alignSelf: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.5rem",
          marginRight: "1rem",
        }}
        onClick={handleToggle}
      >
        <FaChevronLeft />
      </button>

      {/* Main Content with Animation */}
      <div style={{ flex: 1, maxWidth: "1000px", position: "relative" }}>
        <AnimatePresence mode="wait">
          {view === "chart" ? (
            <motion.div
              key="chart"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.35 }}
            >
              <DashboardCharts posts={posts} />
            </motion.div>
          ) : (
            <motion.div
              key="top"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="top-posts-row"
            >
              <TopPostsWidget posts={posts} metric="likes" />
              <TopPostsWidget posts={posts} metric="comments" />
              <TopPostsWidget posts={posts} metric="shares" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Arrow */}
      <button
        style={{
          fontSize: "2rem",
          background: "none",
          border: "none",
          color: "var(--chart-text-color)",
          cursor: "pointer",
          alignSelf: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.5rem",
          marginLeft: "1rem",
        }}
        onClick={handleToggle}
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default DashboardChartSection;
