// components/PostPreview.jsx
import React from 'react';
import '../styles.css';

const platforms = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter'];

const Preview = ({ selectedPlatform, setSelectedPlatform, content }) => {
  return (
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
        <div className="post-content">
          {content || 'Your post content will appear here'}
        </div>
        <div className="post-footer">
          <span>0 Likes</span> • <span>0 Comments</span> • <span>0 Shares</span>
        </div>
      </div>
    </div>
  );
};

export default Preview;