import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Posts from "./components/Posts"; 
import Account from "./components/Account";
import Client from "./components/Client";
import EventCalendar from "./components/EventCalendar";
import "./styles.css";

const App = () => (
  
  <Router>
    <Navbar/>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="/account" element={<Account />} />
      <Route path="/client" element={<Client />} />
      <Route path="/calendar" element={<EventCalendar />} />
    </Routes>
  </Router>
);

export default App;
