import React, { useState } from "react";
import DashboardCharts from "./DashboardChart";
import TopPostsWidget from "./TopPostsWidget";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const DashboardChartSection = ({ posts }) => {
  const [view, setView] = useState("chart");

  const handleToggle = () => {
    setView(prev => (prev === "chart" ? "top" : "chart"));
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center", // ✅ vertical center alignment
        minHeight: "520px",
        marginTop: "1rem",
        gap: "1rem", // optional spacing between arrow and content
      }}
    >
      {/* Left Arrow */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        style={{
          fontSize: "2rem",
          background: "none",
          border: "none",
          color: "var(--chart-text-color)",
          cursor: "pointer",
          padding: "0.5rem",
        }}
      >
        <FaChevronLeft />
      </motion.button>

      {/* Main Content */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatePresence mode="wait">
          {view === "chart" ? (
            <motion.div
              key="chart"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.35 }}
              style={{ width: "100%", marginTop: "-40px" }}
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
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "space-between",
                flexWrap: "wrap",
                width: "100%",
                marginTop: "-60px",
              }}
            >
              <TopPostsWidget posts={posts} metric="likes" />
              <TopPostsWidget posts={posts} metric="comments" />
              <TopPostsWidget posts={posts} metric="shares" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Arrow */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        style={{
          fontSize: "2rem",
          background: "none",
          border: "none",
          color: "var(--chart-text-color)",
          cursor: "pointer",
          padding: "0.5rem",
        }}
      >
        <FaChevronRight />
      </motion.button>
    </div>
  );
};

export default DashboardChartSection;
