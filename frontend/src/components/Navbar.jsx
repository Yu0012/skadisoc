import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import "../styles.css";
import logo from "../assets/SOCMEDMT_logo.png";
import bellAnimation from "../assets/bellring.json";
import bellStatic from "../assets/bellring-no.png";
import userIcon from "../assets/icon-women.png";
import sunIcon from "../assets/icon-sun.png";
import moonIcon from "../assets/icon-moon.png";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [hasNotifications, setHasNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newNotifications =
        Math.random() < 0.5
          ? [
              { id: 1, message: "New comment on your post" },
              { id: 2, message: "Your scheduled post has been published" },
            ]
          : [];
      setNotifications(newNotifications);
      setHasNotifications(newNotifications.length > 0);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
    document.body.classList.toggle("dark-mode");
  };

  const handleUserNav = (path) => {
    navigate(path);
    setUserDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <img src={logo} alt="SOCMEDMT Logo" className="logo" />

      {/* Navigation Links */}
      <div className="nav-links">
        <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
          Dashboard
        </Link>
        <Link to="/posts" className={location.pathname === "/posts" ? "active" : ""}>
          Posts
        </Link>
        <Link to="/calendar" className={location.pathname === "/calendar" ? "active" : ""}>
          Logs
        </Link>
        <Link to="/account" className={location.pathname === "/account" ? "active" : ""}>
          Account
        </Link>
        <Link to="/client" className={location.pathname === "/client" ? "active" : ""}>
          Client
        </Link>
      </div>

      {/* Right Side Icons */}
      <div className="nav-icons">
        {/* 🌗 Theme Toggle */}
        <div className="theme-toggle" onClick={toggleTheme}>
          <img
            src={darkMode ? sunIcon : moonIcon}
            alt={darkMode ? "Light Mode" : "Dark Mode"}
            className="theme-icon"
          />
        </div>

        {/* 🔔 Notification Bell */}
        <div className="notification-menu">
          <div onClick={() => setNotifDropdownOpen(!notifDropdownOpen)} className="bell-container">
            {hasNotifications ? (
              <Lottie animationData={bellAnimation} className="bell-icon" />
            ) : (
              <img src={bellStatic} alt="No Notifications" className="bell-icon" />
            )}
          </div>

          {notifDropdownOpen && (
            <div className="dropdown-menu notifications-dropdown">
              <h4>Notifications</h4>
              {hasNotifications ? (
                notifications.map((notif) => <p key={notif.id}>{notif.message}</p>)
              ) : (
                <p>No new notifications</p>
              )}
              <hr />
              <Link to="/notifications" className="view-all" onClick={() => setNotifDropdownOpen(false)}>
                View All
              </Link>
            </div>
          )}
        </div>

        {/* 👤 User Menu */}
        <div className="user-menu">
          <img
            src={userIcon}
            alt="User Icon"
            className="user-icon"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          />
          {userDropdownOpen && (
            <div className="user-dropdown">
              <div onClick={() => handleUserNav("/profile")}>User Profile</div>
              <hr />
              <div onClick={() => handleUserNav("/settings")}>User Settings</div>
              <div onClick={() => handleUserNav("/support")}>Help & Support</div>
              <hr />
              <div onClick={() => handleUserNav("/logout")} className="logout">
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
