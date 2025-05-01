import React from "react";
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // ✅ Your context provider
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
import SocialMediaDashboard from './components/SocialMediaDashboard';
// import "./styles.css";

// 🧠 Create a sub-component inside Router
const AppContent = () => {
  const location = useLocation();
  const hideNavbarOn = ["/client-login", "/", "/authform", "/forgotpassword"];

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
      </Routes>
    </>
  );
};

// 👇 Final exported App wrapped in Router
const App = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
  //   <Router>
    //   <AppContent />
   // </Router>

);

export default App;