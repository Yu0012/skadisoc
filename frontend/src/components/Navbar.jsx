import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Lottie from "lottie-react"; // Import Lottie for animation
import "../styles.css"; // Import global styles
import logo from "../assets/SOCMEDMT_logo.png"; // Import company logo
import bellAnimation from "../assets/bellring.json"; // Animated ringing bell
import bellStatic from "../assets/bellring-no.png"; // Static bell (no notifications)
import userIcon from "../assets/icon-women.png"; // User profile icon

const Navbar = () => {
  const location = useLocation(); // Get the current active route

  // State to handle notifications and dropdowns
  const [hasNotifications, setHasNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]); // Notification list
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Simulated notifications fetching every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Example: Add notifications randomly
      const newNotifications = Math.random() < 0.5 ? [
        { id: 1, message: "New comment on your post" },
        { id: 2, message: "Your scheduled post has been published" }
      ] : [];

      setNotifications(newNotifications);
      setHasNotifications(newNotifications.length > 0);
    }, 5000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".notification-menu")) {
        setNotifDropdownOpen(false);
      }
      if (!event.target.closest(".user-menu")) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      {/* Left Side: Logo */}
      <img src={logo} alt="SOCMEDMT Logo" className="logo" />

      {/* Center: Navigation Links */}
      <div className="nav-links">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Dashboard
        </Link>
        <Link to="/posts" className={location.pathname === "/posts" ? "active" : ""}>
          Posts
        </Link>
        <Link to="/calendar" className={location.pathname === "/calendar" ? "active" : ""}>
          Calendar
        </Link>
        <Link to="/account" className={location.pathname === "/account" ? "active" : ""}>
          Account
        </Link>
        <Link to="/client" className={location.pathname === "/client" ? "active" : ""}>
          Client
        </Link>
      </div>

      {/* Right Side: Notification Bell & User Icon */}
      <div className="nav-icons">
        {/* Notification Bell */}
        <div className="notification-menu">
          <div onClick={() => setNotifDropdownOpen(!notifDropdownOpen)} className="bell-container">
            {hasNotifications ? (
              <Lottie animationData={bellAnimation} className="bell-icon" />
            ) : (
              <img src={bellStatic} alt="No Notifications" className="bell-icon" />
            )}
          </div>

          {/* Notification Dropdown */}
          {notifDropdownOpen && (
            <div className="dropdown-menu notifications-dropdown">
              <h4>Notifications</h4>
              {hasNotifications ? (
                notifications.map((notif) => (
                  <p key={notif.id}>{notif.message}</p>
                ))
              ) : (
                <p>No new notifications</p>
              )}
              <hr />
              <Link to="/notifications" className="view-all">View All</Link>
            </div>
          )}
        </div>

        {/* User Icon with Dropdown Menu */}
        <div className="user-menu">
          <img 
            src={userIcon} 
            alt="User Icon" 
            className="user-icon" 
            onClick={() => setUserDropdownOpen(!userDropdownOpen)} 
          />
          {/* User Profile Dropdown */}
        {userDropdownOpen && (
        <div className="user-dropdown">
            <a href="/profile">User Profile</a>
            <a href="/personalization">Personalization</a>
            <hr />
            <a href="/settings">User Settings</a>
            <a href="/support">Help & Support</a>
            <hr />
        <a href="/logout" className="logout">Sign Out</a>
        </div>
)}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
