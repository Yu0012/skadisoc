import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Lottie from "lottie-react";
import "../styles.css";
import logo from "../assets/skadiLogo.png";
import logo_light from "../assets/skadiLogo_light_cut.png";
import bellAnimation from "../assets/bellring.json";
import bellAnimation_light from "../assets/bellring_light.json";
import bellStatic from "../assets/bellring-no.png";
import bellStatic_light from "../assets/bellring-no_light.png";
import userIcon from "../assets/icon-women.png";
import sunIcon from "../assets/icon-sun-light.png";
import moonIcon from "../assets/icon-moon.png";
import axios from "axios";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, user, logout } = useContext(AuthContext);
  const themes = ['light', 'dark'] //For Light/Dark themes
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") || "light"
  );


  const [hasNotifications, setHasNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  //Updates elements with data-selected-theme attribute, also saves theme to localStorage for consistency across pages
  useEffect(() => {
    document.documentElement.setAttribute("data-selected-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  //Ensures dark mode is in sync with the current theme
  useEffect(() => {
    setDarkMode(currentTheme === 'dark');
  }, [currentTheme]);

  useEffect(() => {
    const fetchLatestNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications/latest");
        setNotifications(res.data);
        setHasNotifications(res.data.length > 0);
      } catch (err) {
        console.error("❌ Notification Fetch Error:", err);
        console.error("🔍 Error Data:", err.response?.data);
        console.error("❌ Failed to fetch notifications", err);
      }
    };

    fetchLatestNotifications();
    const interval = setInterval(fetchLatestNotifications, 60000); // every 60 seconds

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
    const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
    setCurrentTheme(nextTheme);
  };
  const handleUserNav = (path) => {
    if (path === "/logout") {
      logout();
      navigate("/");
    } else {
      navigate(path);
    }
    setUserDropdownOpen(false);
  };

  const hasMenuAccess = (menuName) => {
    return permissions?.menus?.includes(menuName);
  };

  if (!user || !permissions || !permissions.menus.length) return null;

  return (
    <nav className="navbar">
      {/* Logo */}
      <img src={darkMode ? logo : logo_light} alt="SOCMEDMT Logo" className="logo" />

      {/* Navigation Links */}
      <div className="nav-links">
        {hasMenuAccess("dashboard") && (
          <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
            Dashboard
          </Link>
        )}
        {hasMenuAccess("posts") && (
          <Link to="/posts" className={location.pathname === "/posts" ? "active" : ""}>
            Posts
          </Link>
        )}
        {hasMenuAccess("calendar") && (
          <Link to="/calendar" className={location.pathname === "/calendar" ? "active" : ""}>
            Calendar
          </Link>
        )}
        {hasMenuAccess("account") && (
          <Link to="/account" className={location.pathname === "/account" ? "active" : ""}>
            Account
          </Link>
        )}
        {hasMenuAccess("client") && (
          <Link to="/client" className={location.pathname === "/client" ? "active" : ""}>
            Client
          </Link>
        )}
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
              <Lottie animationData={darkMode ? bellAnimation_light : bellAnimation} className="bell-icon" />
            ) : (
              <img src={darkMode ? bellStatic_light : bellStatic } alt="No Notifications" className="bell-icon" />
            )}
          </div>

            {notifDropdownOpen && (
              <div className="dropdown-menu notifications-dropdown">
                <h4>Notifications</h4>

                <div className="notification-scroll">
                  {notifications.length === 0 ? (
                    <p className="no-notification">No new notifications</p>
                  ) : (
                    notifications.map((note, index) => (
                      <div key={index} className="notification-item">
                        <p>{note.message}</p>
                        <span className="timestamp">{note.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
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
