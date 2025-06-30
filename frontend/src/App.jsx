import React from "react";
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // ✅ Your context provider
import AuthForm from "./components/AuthForm";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Posts from "./components/Posts"; 
import Account from "./components/Account";
import Client from "./components/Client";
import EventCalendar from "./components/EventCalendar";
import UserProfile from "./components/UserProfile";
import UserSettings from "./components/UserSettings"; 
import HelpSupport from "./components/HelpSupport"; 
import SocialMediaDashboard from './components/SocialMediaDashboard';
import AssignClients from './components/AssignClients';
import PrivacyPolicy from './components/PrivacyPolicy';
import "./styles.css";



const AppContent = () => {
  const location = useLocation();
  const hideNavbarOn = ["/", "/login", "/authform", "/forgotpassword", "/client-login"];

  return (
    <>
      {!hideNavbarOn.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/authform" element={<AuthForm />} />

        <Route path="/login" element={<AuthForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/account" element={<Account />} />
        <Route path="/client" element={<Client />} />
        <Route path="/calendar" element={<EventCalendar />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/support" element={<HelpSupport />} />
        <Route path="/client-login" element={<SocialMediaDashboard />} />
        <Route path="/assign-clients/:userId" element={<AssignClients />} />
        <Route path="/Privacy-Policy" element={<PrivacyPolicy />} />
      </Routes>
    </>
  );
};


const App = () => (
  <div className="app-scroll-wrapper">
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  </div>
);

export default App;