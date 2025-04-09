import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
import "./styles.css";

const App = () => (
  <Router>
    <Navbar />
    <Routes>
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
    </Routes>
  </Router>
);

export default App;
