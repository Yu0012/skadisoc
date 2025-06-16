import React from "react";
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // ✅ Your context provider

// 🔐 Auth pages
import AuthForm from "./components/AuthForm";
import ForgotPassword from "./components/ForgotPassword";

// 🧭 UI Layout
import Navbar from "./components/Navbar";

// 📊 Main pages
import Dashboard from "./components/Dashboard";
import Posts from "./components/Posts"; 
import Account from "./components/Account";
import Client from "./components/Client";
import EventCalendar from "./components/EventCalendar";

// 👤 User profile/settings
import UserProfile from "./components/UserProfile";
import UserSettings from "./components/UserSettings"; 
import HelpSupport from "./components/HelpSupport";

// 🔍 Post previews
import FacebookPreview from "./components/FacebookPreview";
import InstagramPreview from "./components/InstagramPreview";
import TwitterPreview from "./components/TwitterPreview";

// 🌐 Social login (Meta, X, LinkedIn)
import SocialMediaDashboard from './components/SocialMediaDashboard';

// 🔗 Client assignment page
import AssignClients from './components/AssignClients';

import "./styles.css";

// 🧠 Create a sub-component inside Router
const AppContent = () => {
  const location = useLocation();

  // 🕵️ Define which routes should hide the navbar
  const hideNavbarOn = ["/client-login", "/", "/authform", "/forgotpassword"];

  return (
    <>
      {/* ✅ Show navbar on all routes except specified ones */}
      {!hideNavbarOn.includes(location.pathname) && <Navbar />}

      {/* 🗺 Route definitions */}
      <Routes>
        {/* 🔐 Auth */}
        <Route path="/" element={<AuthForm />} />
        <Route path="/authform" element={<AuthForm />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/login" element={<AuthForm />} />  // ✅ Add this line

        {/* 📊 Dashboard & Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/account" element={<Account />} />
        <Route path="/client" element={<Client />} />
        <Route path="/calendar" element={<EventCalendar />} />

        {/* 👤 User Info */}
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/support" element={<HelpSupport />} />

        {/* 🔍 Post Preview Pages (Dynamic Route) */}
        <Route path="/facebook-preview/:postId" element={<FacebookPreview />} />
        <Route path="/instagram-preview/:postId" element={<InstagramPreview />} />
        <Route path="/twitter-preview/:postId" element={<TwitterPreview />} />

        {/* 🌐 Client Login (Social Media Dashboard) */}
        <Route path="/client-login" element={<SocialMediaDashboard />} />

        {/* 🔗 Assign Clients to Users */}
        <Route path="/assign-clients/:userId" element={<AssignClients />} />
      </Routes>
    </>
  );
};

// 👇 Final exported App wrapped in Router and Auth Context
const App = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;
