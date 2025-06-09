import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Lottie from "lottie-react";
import "../styles.css";

// 🔗 Asset Imports
import logo from "../assets/skadiLogo.png"; // Dark mode logo
import logo_light from "../assets/skadiLogo_light.png"; // Light mode logo
import bellAnimation from "../assets/bellring.json"; // Animated bell (dark)
import bellAnimation_light from "../assets/bellring_light.json"; // Animated bell (light)
import bellStatic from "../assets/bellring-no.png"; // Static bell (dark)
import bellStatic_light from "../assets/bellring-no_light.png"; // Static bell (light)
import userIcon from "../assets/icon-women.png"; // User profile image
import sunIcon from "../assets/icon-sun-light.png"; // Sun icon (light mode)
import moonIcon from "../assets/icon-moon.png"; // Moon icon (dark mode)

const Navbar = () => {
  // 🧭 Navigation hooks
  const location = useLocation();
  const navigate = useNavigate();
  
  // 🔐 Authentication context
  const { permissions, user, logout } = useContext(AuthContext);

  // 🌙 Theme State: light/dark
  const themes = ["light", "dark"];
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const [darkMode, setDarkMode] = useState(currentTheme === "dark");

  // 🔔 Notification state
  const [hasNotifications, setHasNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // 👤 User menu dropdown state
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // 🖌️ Apply selected theme to the root element and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-selected-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  // 🔄 Sync darkMode boolean with current theme
  useEffect(() => {
    setDarkMode(currentTheme === "dark");
  }, [currentTheme]);

  // 🧪 Simulate notifications every 5 seconds (demo purposes)
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

  // 📤 Close dropdowns when clicking outside
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

  // 🔁 Toggle between light and dark themes
  const toggleTheme = () => {
    const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
    setCurrentTheme(nextTheme);
  };

  // 🚪 Handle user menu navigation actions
  const handleUserNav = (path) => {
    if (path === "/logout") {
      logout();
      navigate("/");
    } else {
      navigate(path);
    }
    setUserDropdownOpen(false);
  };

  // ✅ Check if user has access to specific menu
  const hasMenuAccess = (menuName) => {
    return permissions?.menus?.includes(menuName);
  };

  // 🔒 Do not render navbar until user and permissions are loaded
  if (!user || !permissions || !permissions.menus.length) return null;

  return (
    <nav className="navbar">
      {/* 📌 Left: Brand Logo Section */}
      <div className="navbar-left">
        <img
          src={darkMode ? logo : logo_light}
          alt="Skadi Logo"
          className={`navbar-logo ${darkMode ? "dark-logo" : "light-logo"}`}
        />
      </div>

      {/* 🔗 Center: Navigation Links Section */}
      <div className="navbar-center">
        {hasMenuAccess("dashboard") && (
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active" : ""}
          >
            Dashboard
          </Link>
        )}
        {hasMenuAccess("posts") && (
          <Link
            to="/posts"
            className={location.pathname === "/posts" ? "active" : ""}
          >
            Posts
          </Link>
        )}
        {hasMenuAccess("calendar") && (
          <Link
            to="/calendar"
            className={location.pathname === "/calendar" ? "active" : ""}
          >
            Calendar
          </Link>
        )}
        {hasMenuAccess("account") && (
          <Link
            to="/account"
            className={location.pathname === "/account" ? "active" : ""}
          >
            Account
          </Link>
        )}
        {hasMenuAccess("client") && (
          <Link
            to="/client"
            className={location.pathname === "/client" ? "active" : ""}
          >
            Client
          </Link>
        )}
      </div>

      {/* 🎛️ Right: Interactive Icons Section */}
      <div className="navbar-right">
        {/* 🌓 Theme Toggle Switch */}
        <div className="theme-toggle" onClick={toggleTheme}>
          <img
            src={darkMode ? sunIcon : moonIcon}
            alt={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="theme-icon"
          />
        </div>

        {/* 🔔 Notification Bell with Dropdown */}
        <div className="notification-menu">
          <div
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="bell-container"
          >
            {hasNotifications ? (
              <Lottie
                animationData={darkMode ? bellAnimation_light : bellAnimation}
                className="bell-icon"
              />
            ) : (
              <img
                src={darkMode ? bellStatic_light : bellStatic}
                alt="No Notifications"
                className="bell-icon"
              />
            )}
          </div>

          {/* 🔽 Notification Dropdown Menu */}
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
              <Link
                to="/notifications"
                className="view-all"
                onClick={() => setNotifDropdownOpen(false)}
              >
                View All
              </Link>
            </div>
          )}
        </div>

        {/* 👤 User Profile with Dropdown */}
        <div className="user-menu">
          <img
            src={userIcon}
            alt="User Profile"
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
              <div
                onClick={() => handleUserNav("/logout")}
                className="logout"
              >
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