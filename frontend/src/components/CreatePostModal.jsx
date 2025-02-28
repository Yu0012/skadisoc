import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles.css"; 
import { FaTimes, FaCalendarAlt } from "react-icons/fa";

const CreatePostModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [client, setClient] = useState("JYP Entertainment");
  const [scheduledDate, setScheduledDate] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  if (!isOpen) return null;

  const platforms = [
    { id: "facebook", icon: "🌐" },
    { id: "instagram", icon: "📸" },
    { id: "linkedin", icon: "🔗" },
    { id: "twitter", icon: "🐦" },
  ];

  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>Create Post</h2>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>

        <div className="modal-body">
          {/* Content Input */}
          <label>Content</label>
          <textarea
            className="content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
          />

          {/* Hashtags & Client Selection */}
          <div className="flex-row">
            <div className="half-width">
              <label>Hashtags</label>
              <input
                type="text"
                className="input-field"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#socialmedia #marketing"
              />
            </div>
            <div className="half-width">
              <label>Client</label>
              <select
                className="dropdown-field"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              >
                <option>JYP Entertainment</option>
                <option>SM Entertainment</option>
                <option>YG Entertainment</option>
              </select>
            </div>
          </div>

          {/* Schedule Post Button */}
          <div className="schedule-container">
            <button className="schedule-btn">
              <FaCalendarAlt /> Schedule Post
            </button>
            <DatePicker
              selected={scheduledDate}
              onChange={(date) => setScheduledDate(date)}
              className="date-picker"
              placeholderText="Select a date"
            />
          </div>

          {/* Platform Selection */}
          <label>Platforms</label>
          <div className="platform-container">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                className={`platform-btn ${selectedPlatforms.includes(platform.id) ? "active" : ""}`}
                onClick={() => togglePlatform(platform.id)}
              >
                {platform.icon}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button className="post-submit-btn">Post</button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
