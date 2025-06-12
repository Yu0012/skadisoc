import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Lottie from "lottie-react";
import "../styles.css";

// Assets
import logo from "../assets/skadiLogo.png";
import logo_light from "../assets/skadiLogo_light.png";
import bellAnimation from "../assets/bellring.json";
import bellAnimation_light from "../assets/bellring_light.json";
import bellStatic from "../assets/bellring-no.png";
import bellStatic_light from "../assets/bellring-no_light.png";
import userIcon from "../assets/icon-women.png";
import sunIcon from "../assets/icon-sun-light.png";
import moonIcon from "../assets/icon-moon.png";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, user, logout } = useContext(AuthContext);

  const themes = ["light", "dark"]; // Supported themes
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const [hasNotifications, setHasNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Apply theme to HTML attribute and store it in localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-selected-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  // Sync darkMode boolean with the selected theme
  useEffect(() => {
    setDarkMode(currentTheme === "dark");
  }, [currentTheme]);

  // Fake polling: updates notifications every 5s
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

  // Improved theme toggle with smooth transition
  const toggleTheme = () => {
    // Add transition class to body
    document.body.classList.add("theme-transition");
    
    // Calculate next theme
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    
    // Update state
    setDarkMode(nextTheme === "dark");
    setCurrentTheme(nextTheme);
    
    // Apply to HTML element
    document.documentElement.setAttribute("data-selected-theme", nextTheme);
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 400); // matches CSS transition duration
  };

  // Navigation logic for user dropdown
  const handleUserNav = (path) => {
    if (path === "/logout") {
      logout();
      navigate("/");
    } else {
      navigate(path);
    }
    setUserDropdownOpen(false);
  };

  // Check if user has access to a certain menu
  const hasMenuAccess = (menuName) => {
    return permissions?.menus?.includes(menuName);
  };

  if (!user || !permissions || !permissions.menus.length) return null;

  return (
    <nav className="navbar">
      {/* Logo */}
      <img
        src={darkMode ? logo : logo_light}
        alt="SOCMEDMT Logo"
        className="logo"
      />

      {/* Navigation Links */}
      <div className="nav-links">
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

      {/* Right Side Icons */}
      <div className="nav-icons">
        {/* Theme Toggle */}
        <div className="theme-toggle" onClick={toggleTheme}>
          <img
            src={darkMode ? sunIcon : moonIcon}
            alt={darkMode ? "Light Mode" : "Dark Mode"}
            className="theme-icon"
          />
        </div>

        {/* Notification Bell */}
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

        {/* User Menu */}
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