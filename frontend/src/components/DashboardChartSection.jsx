import React, { useState } from "react";
import DashboardCharts from "./DashboardChart";
import TopPostsWidget from "./TopPostsWidget";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const DashboardChartSection = ({ posts }) => {
  const [view, setView] = useState("chart");

  const handleToggle = () => {
    setView((prev) => (prev === "chart" ? "top" : "chart"));
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "500px",
        marginTop: "0.5rem",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center", // ✅ ensure vertical centering inside this wrapper
      }}
    >
      {/* Left Arrow */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        style={{
          position: "absolute",
          left: "-1rem",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "1.8rem",
          background: "none",
          border: "none",
          color: "var(--chart-text-color)",
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        <FaChevronLeft />
      </motion.button>

      {/* Center Content */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          padding: "0 2rem",
          display: "flex",
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
              style={{
                width: "100%",
                marginTop: "-80px",
                minHeight: "500px", // ✅ unify height with cards
              }}
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
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: "1rem",
                marginTop: "-60px",
                minHeight: "400px", // ✅ match with chart height
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
          position: "absolute",
          right: "-1rem",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "1.8rem",
          background: "none",
          border: "none",
          color: "var(--chart-text-color)",
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        <FaChevronRight />
      </motion.button>
    </div>
  );
};

export default DashboardChartSection;
