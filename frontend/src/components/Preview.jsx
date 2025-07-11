import React from "react";
import "../styles.css";
const Preview = ({ platform, content, client, attachedFile, imageURL,compact = false }) => {
  const renderPreview = () => {
    const renderImagePreview = () => {
      if (!attachedFile && !imageURL) return null;
      return (
        <div className="post-image">
          {attachedFile ? (
            attachedFile.type?.startsWith("image/") ? (
              <img src={URL.createObjectURL(attachedFile)} alt="Attachment Preview" />
            ) : (
              <video src={URL.createObjectURL(attachedFile)} controls style={{ maxWidth: '100%', borderRadius: '8px' }} />
            )
          ) : (
            imageURL.endsWith(".mp4") || imageURL.includes("video")
              ? <video src={imageURL} controls style={{ maxWidth: '100%', borderRadius: '8px' }} />
              : <img src={imageURL} alt="Attachment Preview" />
          )}
        </div>
      );
    };

    switch (platform?.toLowerCase()) {
      case "facebook":
        return (
          <div className={`post-preview ${compact ? "compact-preview" : ""}`}>
            <div className="post-header">
              <div className="avatar"></div>
              <div>
                <div className="name">{client || "Page Name"}</div>
                <div className="timestamp">Just now • Facebook</div>
              </div>
            </div>
            <div className="post-content">
              {content.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
            {renderImagePreview()}
            <div className="post-footer">👍 Like • 💬 Comment • ↪️ Share</div>
          </div>
        );
      case "instagram":
        return (
          <div className={`post-preview ${compact ? "compact-preview" : ""}`}>
            <div className="post-header">
              <div className="avatar"></div>
              <div>
                <div className="name">{client || "Instagram Page"}</div>
                <div className="timestamp">Just now • Instagram</div>
              </div>
            </div>
            <div className="post-content">
              {content.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
            {renderImagePreview()}
            <div className="post-footer">❤️ 💬 📤</div>
          </div>
        );
      case "twitter":
        return (
          <div className={`post-preview ${compact ? "compact-preview" : ""}`}>
            <div className="post-header">
              <div className="avatar"></div>
              <div>
                <div className="name">{client || "Twitter Page"}</div>
                <div className="timestamp">@skadi • now</div>
              </div>
            </div>
            <div className="post-content">
              {content.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
            {renderImagePreview()}
            <div className="post-footer">💬 Reply • 🔁 Retweet • ❤️ Like</div>
          </div>
        );
      case "linkedin":
        return (
          <div className={`post-preview ${compact ? "compact-preview" : ""}`}>
            <div className="post-header">
              <div className="avatar"></div>
              <div>
                <div className="name">{client || "LinkedIn Page"}</div>
                <div className="timestamp">Just now • LinkedIn</div>
              </div>
            </div>
            <div className="post-content">
              {content.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
            {renderImagePreview()}
            <div className="post-footer">👍 Like • 💬 Comment • 🔁 Share</div>
          </div>
        );
      default:
        return <div className="post-preview">Select a platform to see preview</div>;
    }
  };

  return <div className={`preview-section ${compact ? "compact-preview" : ""}`}>{renderPreview()}</div>;
};

export default Preview;