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
        alignItems: "center",      
        justifyContent: "center",
        gap: "2rem",
        padding: "0 1rem",
        minHeight: "520px",         
      }}
    >
      {/* Left Arrow Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
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
      </motion.button>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          maxWidth: "1000px",
          position: "relative",
          minHeight: "480px",       
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
              style={{ width: "100%" }}
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
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "space-between",
                flexWrap: "wrap",
                width: "100%",             
                alignItems: "flex-start",
              }}
            >
              <TopPostsWidget posts={posts} metric="likes" />
              <TopPostsWidget posts={posts} metric="comments" />
              <TopPostsWidget posts={posts} metric="shares" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Arrow Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
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
      </motion.button>
    </div>
  );
};

export default DashboardChartSection;
