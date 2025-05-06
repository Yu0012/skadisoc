import React from "react";
import "./Spinner.css"; // Import the CSS file for styling

const Spinner = ({ message = "Loading..." }) => (
  <div className="spinner-container">
    <div className="spinner"></div>
    <p>{message}</p>
  </div>
);

export default Spinner;
