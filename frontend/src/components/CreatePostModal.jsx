import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles.css";
import { FaTimes, FaCalendarAlt, FaPaperclip } from "react-icons/fa";

const CreatePostModal = ({ isOpen, onClose, initialData = {}, onSave }) => {
  const [content, setContent] = useState(initialData.content || "");
  const [hashtags, setHashtags] = useState(initialData.hashtags || "");
  const [client, setClient] = useState(initialData.client || "JYP Entertainment");
  const [scheduledDate, setScheduledDate] = useState(initialData.scheduledDate || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState(initialData.platforms || []);
  const [attachedFile, setAttachedFile] = useState(null);

  const datePickerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = () => {
    const updatedPost = {
      ...initialData,
      content,
      hashtags,
      client,
      scheduledDate,
      platforms: selectedPlatforms,
    };
    onSave?.(updatedPost);
    onClose();
  };

  const toggleDatePicker = (e) => {
    e.stopPropagation();
    setShowDatePicker((prev) => !prev);
  };

  const platforms = [
    { id: "facebook", name: "Facebook" },
    { id: "instagram", name: "Instagram" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "twitter", name: "Twitter" },
  ];

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>{initialData?.id ? "Edit Post" : "Create Post"}</h2>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>

        <div className="modal-body">
          <label>Content</label>
          <div className="content-container">
            <textarea
              className="content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
            />
            <button className="attach-file-btn" onClick={triggerFileInput}>
              <FaPaperclip />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="file-input"
              onChange={handleFileChange}
              accept="image/*, .pdf, .docx"
              style={{ display: "none" }}
            />
          </div>

          {attachedFile && (
            <div className="attached-file-preview">
              {attachedFile.type.startsWith("image/") ? (
                <img src={URL.createObjectURL(attachedFile)} alt="Attachment Preview" />
              ) : (
                <p>{attachedFile.name}</p>
              )}
            </div>
          )}

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

          <div className="schedule-container">
            {scheduledDate && (
              <span className="selected-datetime">
                {scheduledDate.toLocaleString()}
              </span>
            )}
            <button className="schedule-btn" onClick={toggleDatePicker}>
              <FaCalendarAlt /> Schedule Post
            </button>

            {showDatePicker && (
              <div className="date-picker-container" ref={datePickerRef}>
                <DatePicker
                  selected={scheduledDate}
                  onChange={(date) => setScheduledDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="date-picker"
                />
                <button className="confirm-schedule-btn" onClick={() => setShowDatePicker(false)}>
                  Confirm Schedule Post
                </button>
              </div>
            )}
          </div>

          <label>Platforms</label>
          <div className="platform-container">
            {platforms.map((platform) => (
              <div key={platform.id} className="platform-item">
                <span className="platform-name">{platform.name}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={() =>
                      setSelectedPlatforms((prev) =>
                        prev.includes(platform.id)
                          ? prev.filter((p) => p !== platform.id)
                          : [...prev, platform.id]
                      )
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>

          <button className="post-submit-btn" onClick={handleSubmit}>
            {initialData?.id ? "Save Changes" : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
