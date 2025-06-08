// components/Notification.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';


const Notification = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);

    useEffect(() => {
    axios.get('/api/posts/notifications', {
        headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
    })
    .then(res => {
        console.log("Fetched notifications:", res.data); 
        setNotifications(res.data);
    })
    .catch(err => console.error('Failed to load notifications:', err));
    }, []);


    

  return (
    <div className="notification-popup">
      <button onClick={onClose}>❌</button>
      <h4>🛎️ Recent Post Notifications</h4>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul>
            {Array.isArray(notifications) && notifications.map((note, index) => (
                <li key={index}>
                <strong>🔔</strong> {note.message}
                <br />
                <small>{new Date(note.createdAt).toLocaleString()}</small>
                </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default Notification;
