import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles.css";
import { FaTimes, FaCalendarAlt, FaPaperclip } from "react-icons/fa";

const CreatePostModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [client, setClient] = useState("JYP Entertainment");
  const [scheduledDate, setScheduledDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null); // Store uploaded file

  const datePickerRef = useRef(null);
  const fileInputRef = useRef(null); // Reference for file input

  if (!isOpen) return null;

  // Toggle the date picker without closing the modal
  const toggleDatePicker = (e) => {
    e.stopPropagation();
    setShowDatePicker((prev) => !prev);
  };

  // Close Date Picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle scheduling the post
  const handleSchedulePost = (e) => {
    e.stopPropagation();
    if (scheduledDate) {
      alert(`Post scheduled for: ${scheduledDate}`);
      setShowDatePicker(false);
    } else {
      alert("Please select a date and time to schedule the post.");
    }
  };

  // Handle file attachment
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  // Open file input when the icon is clicked
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Define platforms
  const platforms = [
    { id: "facebook", name: "Facebook" },
    { id: "instagram", name: "Instagram" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "twitter", name: "Twitter" },
  ];

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
          <div className="content-container">
            <textarea
              className="content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
            />
            {/* Attach File Button */}
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

          {/* Display Attached File */}
          {attachedFile && (
            <div className="attached-file-preview">
              {attachedFile.type.startsWith("image/") ? (
                <img src={URL.createObjectURL(attachedFile)} alt="Attachment Preview" />
              ) : (
                <p>{attachedFile.name}</p>
              )}
            </div>
          )}

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

          {/* Schedule Post Section */}
          <div className="schedule-container">
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
                  calendarClassName="custom-calendar"
                  popperPlacement="bottom"
                />
                <button className="confirm-schedule-btn" onClick={handleSchedulePost}>
                  Confirm Schedule Post
                </button>
              </div>
            )}
          </div>

          {/* Platform Selection */}
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

          {/* Submit Button */}
          <button className="post-submit-btn">Post</button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
