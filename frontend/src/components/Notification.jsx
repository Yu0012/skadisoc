import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles.css"; // ensure styling is available

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchNotifications = async () => {
        try {
        const res = await fetch('http://localhost:5000/api/notifications/latest', {});
        const data = await res.json();
        setNotifications(data); // Make sure setNotifications is defined properly
        } catch (err) {
        console.error("❌ Failed to fetch notifications:", err);
        }
    };

    fetchNotifications();
    }, []);


  return (
    <div className="page-wrapper">
      <div className="content-container">
        <h2>🔔 Notifications</h2>
        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul className="notification-list">
            {notifications.map((notif, index) => (
              <li key={notif._id || index}>
                <strong>{notif.message}</strong>
                <br />
                <small>{new Date(notif.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notification;
