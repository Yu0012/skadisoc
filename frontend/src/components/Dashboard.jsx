
import "../styles.css";

// components/CreatePostModal.jsx
import React, { useState } from 'react';
import '../CreatePostModal.css';

const platforms = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter'];

const Dashboard = () => {
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [client, setClient] = useState('JYP Entertainment');
  const [selectedPlatform, setSelectedPlatform] = useState('Facebook');
  const [platformToggles, setPlatformToggles] = useState({
    Facebook: true,
    Instagram: true,
    LinkedIn: false,
    Twitter: false,
  });

  const handleToggle = (platform) => {
    setPlatformToggles((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  return (
    <div className="modal">
      <div className="modal-box">
        <div className="content-section">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="extras">
            <input
              type="text"
              placeholder="#socialmedia#marketing"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
            />
            <select value={client} onChange={(e) => setClient(e.target.value)}>
              <option value="JYP Entertainment">JYP Entertainment</option>
              <option value="SM Entertainment">SM Entertainment</option>
              <option value="YG Entertainment">YG Entertainment</option>
            </select>
          </div>



          <button className="schedule-btn">📅 Schedule Post</button>
        </div>

        <div className="preview-section">
          <div className="tabs">
            {platforms.map((platform) => (
              <button
                key={platform}
                className={selectedPlatform === platform ? 'active' : ''}
                onClick={() => setSelectedPlatform(platform)}
              >
                {platform}
              </button>
            ))}
          </div>
          <div className="post-preview">
            <div className="post-header">
              <div className="avatar" />
              <div>
                <div className="name">Name</div>
                <div className="timestamp">Just Now</div>
              </div>
            </div>
            <div className="post-content">{content || 'Your post content will appear here'}</div>
            <div className="post-footer">
              <span>0 Likes</span> • <span>0 Comments</span> • <span>0 Shares</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
