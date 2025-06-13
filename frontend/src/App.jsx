import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthForm from "./components/AuthForm";
import ForgotPassword from "./components/ForgotPassword";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Posts from "./components/Posts";
import Account from "./components/Account";
import Client from "./components/Client";
import EventCalendar from "./components/EventCalendar";
import UserProfile from "./components/UserProfile";
import UserSettings from "./components/UserSettings";
import HelpSupport from "./components/HelpSupport";
import FacebookPreview from "./components/FacebookPreview";
import InstagramPreview from "./components/InstagramPreview";
import TwitterPreview from "./components/TwitterPreview";
import SocialMediaDashboard from "./components/SocialMediaDashboard";
import AssignClients from "./components/AssignClients";
import "./styles.css";

// 🧠 Global theme sync helper
const applyTheme = () => {
  const savedMode = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark-theme", savedMode);
  if (savedMode) {
    document.body.setAttribute("data-selected-theme", "dark");
  } else {
    document.body.removeAttribute("data-selected-theme");
  }
};

// 🧠 Sub-component for routes and navbar
const AppContent = () => {
  const location = useLocation();
  const hideNavbarOn = ["/client-login", "/", "/authform", "/forgotpassword"];

  // ✅ Apply dark mode theme on every route change
  useEffect(() => {
    applyTheme();
  }, [location.pathname]);

  return (
    <>
      {!hideNavbarOn.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/authform" element={<AuthForm />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/account" element={<Account />} />
        <Route path="/client" element={<Client />} />
        <Route path="/calendar" element={<EventCalendar />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/support" element={<HelpSupport />} />
        <Route path="/facebook-preview/:postId" element={<FacebookPreview />} />
        <Route path="/instagram-preview/:postId" element={<InstagramPreview />} />
        <Route path="/twitter-preview/:postId" element={<TwitterPreview />} />
        <Route path="/client-login" element={<SocialMediaDashboard />} />
        <Route path="/assign-clients/:userId" element={<AssignClients />} />
      </Routes>
    </>
  );
};

// 🚀 Final exported App
const App = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;
