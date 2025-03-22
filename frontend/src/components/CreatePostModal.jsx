import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles.css";
import { FaTimes, FaCalendarAlt, FaPaperclip } from "react-icons/fa";

const CreatePostModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("#");
  const [client, setClient] = useState("JYP Entertainment");
  const [scheduledDate, setScheduledDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [clients, setClients] = useState([]);

  const datePickerRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const toggleDatePicker = (e) => {
    e.stopPropagation();
    setShowDatePicker((prev) => !prev);
  };

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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/clients");
        if (!response.ok) {
          throw new Error("Failed to fetch clients");
        }
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handlePlatformChange = (platformId) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platformId)) {
        return prev.filter((p) => p !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };
  


  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("Post content cannot be empty!");
      return;
    }
  
    const formData = new FormData();
    formData.append("content", content);
    formData.append("hashtags", hashtags);
    formData.append("client", client);
    formData.append("scheduledDate", scheduledDate ? scheduledDate.toISOString() : "");
    formData.append("selectedPlatforms", JSON.stringify(selectedPlatforms)); // Convert array to JSON string
  
    if (attachedFile) {
      formData.append("file", attachedFile);
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit post");
      }
  
      alert("Post submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("An error occurred. Please try again.");
    }
  };
  

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
                <option value="">Select a Client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c.companyName}>
                    {c.companyName}
                  </option>
                ))}
                
              </select>
            </div>
          </div>

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
                    onChange={() => handlePlatformChange(platform.id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>

          <button className="post-submit-btn" onClick={handleSubmit}>Post</button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
