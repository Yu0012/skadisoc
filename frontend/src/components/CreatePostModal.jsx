import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles.css";
import { FaTimes, FaCalendarAlt, FaPaperclip } from "react-icons/fa";
import Preview from "./Preview";
import Swal from "sweetalert2";
import config from '../config';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, initialData = {}, onSave, platform }) => {
  const [content, setContent] = useState(initialData?.content || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [client, setClient] = useState(initialData?.client || "");
  const [scheduledDate, setScheduledDate] = useState(initialData?.scheduledDate || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState(initialData?.selectedPlatforms || []);
  const [attachedFile, setAttachedFile] = useState(null);
  const [existingFilePath, setExistingFilePath] = useState(initialData?.filePath || null);
  const [clients, setClients] = useState([]);
  const [clientName, setClientName] = useState("");
  const [platformToggles, setPlatformToggles] = useState({
    Facebook: false,
    Instagram: false,
    LinkedIn: false,
    Twitter: false,
  });

  const datePickerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    // Cleanup in case the modal is unmounted
    return () => document.body.classList.remove("modal-open");
  }, [isOpen]);


  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
      setClient(initialData.client || "");
      setScheduledDate(initialData.scheduledDate ? new Date(initialData.scheduledDate) : null);
      setSelectedPlatforms(initialData.selectedPlatforms || []);
      setExistingFilePath(initialData.filePath || null); // Reset file input when editing
    }
  }, [initialData]);

  useEffect(() => {
    const selected = clients.find((c) => c._id === client);
    if (selected) {
      setClientName(
        selected.companyName || selected.pageName || selected.username || selected.name || ""
      );
    }
  }, [client, clients]);

  // Fetch clients based on selected platform NEW!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  useEffect(() => {
    const fetchClients = async () => {
      if (!platform) return;

      try {
        const response = await fetch(`${config.API_BASE}/api/clients/${platform.toLowerCase()}/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch assigned clients");
        const data = await response.json();
        setClients(data.clients); // make sure this matches res.json({ clients }) in backend
      } catch (err) {
        console.error(`❌ Error fetching assigned ${platform} clients:`, err);
      }
    };

    fetchClients();
  }, [platform]);

  // Automatically enable the selected platform
  useEffect(() => {
    setPlatformToggles((prev) => ({
      ...prev,
      [platform]: true,
    }));
  }, [platform]);

  useEffect(() => {
    if (platform && !selectedPlatforms.includes(platform.toLowerCase())) {
      setSelectedPlatforms([platform.toLowerCase()]);
    }
  }, [platform]);

  const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // ⬅️ This gives base64 string
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

  const handleUpload = async (file) => {
    const token = localStorage.getItem("token");
    const base64 = await toBase64(file);
    const fileType = file.type;

    const res = await fetch(`${config.API_BASE}/api/posts/upload`, {
      method: "POST",
      headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      body: JSON.stringify({ base64, fileType }),
    });

    const data = await res.json();
    return data.filePath; // 🟢 Cloudinary URL
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("Post content cannot be empty!");
      return;
    }

    if (!client || client === "" || client === "No Client Selected") {
      alert("Please select a client before creating a post.");
      return;
    }

    const selectedClient = clients.find((c) => c._id === client);
    const finalClientName = selectedClient?.companyName || selectedClient?.pageName || selectedClient?.username || selectedClient?.name || "";

    let filePath = existingFilePath; // Use existing file path if editing

    if (attachedFile) {
      try {
        filePath = await handleUpload(attachedFile); // 🔥 Use Cloudinary uploader
      } catch (err) {
        console.error("❌ Upload error:", err);
        alert("Failed to upload file.");
        return;
      }
    }

    const formValues = {
      _id: initialData?._id || null,
      title,
      content,
      client: selectedClient?._id || "",
      clientName: finalClientName,
      scheduledDate,
      selectedPlatforms,
      filePath, // 🔗 ✅ Cloudinary URL
    };

    console.log("🛰️ Submitting with formValues:", formValues);
    const now = new Date();
    if (scheduledDate && scheduledDate < now) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'Scheduled date must be in the future.',
      });
      return;
    }

    onSave?.(formValues);
    onClose();
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

  const handleToggle = (platformKey) => {
    setPlatformToggles((prev) => ({
      ...prev,
      [platformKey]: !prev[platformKey],
    }));
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

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) setAttachedFile(file);
  // };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <FaTimes className="close-icon" onClick={onClose} />
        <div className="modal-header">
          <h2>{initialData?._id ? "Edit Post" : "Create Post"}</h2>
        </div>

        <div className="modal-box">
          <div className="content-section">
            <div className="modal-body">
              <div className="left-column">
                <label>Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Skadi SocMed #business #socialmedia #marketing"
                />
              </div>

              <div className="content-container">
                <label>Content</label>
                <textarea
                  className="content-input"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                />
              </div>

              <div className="file-schedule-row">
                <button className="attach-file-btn" onClick={triggerFileInput}>
                  <FaPaperclip id="paperclip" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="file-input"
                  onChange={(e) => setAttachedFile(e.target.files[0])}
                  accept="image/*"
                  style={{ display: "none" }}
                /> 

                <div className="schedule-row">
                  <button className="modal-schedule-btn" onClick={toggleDatePicker}>
                    <FaCalendarAlt /> Schedule Post
                  </button>
                  {scheduledDate && (
                    <span className="selected-date">
                      {scheduledDate.toLocaleString()}
                    </span>
                  )}
                  {showDatePicker && (
                    <div className="modal-calendar">
                      <DatePicker
                        selected={scheduledDate}
                        onChange={(date) => setScheduledDate(date)}
                        showTimeSelect
                        timeIntervals={10} // ⏱️ Allows flexible 10-minute steps
                        dateFormat="MMMM d, yyyy h:mm aa"
                        minDate={new Date()} // 🚫 Disables past dates
                        inline
                        onClickOutside={() => setShowDatePicker(false)}
                        dayClassName={(date) => {
                          const now = new Date();
                          now.setHours(0, 0, 0, 0); // Midnight today
                          return date < now ? 'past-date' : undefined;
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="">
                {/* Right */}
                <div className="client-column">
                  <label>Client</label>
                  <select
                    className="dropdown-field"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                  >
                    <option value="">Select a Client</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.companyName || c.pageName || c.username || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="post-submit-btn" onClick={handleSubmit}>
                {initialData?._id ? "Save Changes" : "Create Post"}
              </button>
            </div>
          </div>

          <Preview
            platform={(Array.isArray(selectedPlatforms) ? selectedPlatforms[0] : selectedPlatforms) || ""}
            content={content}
            client={clientName}
            attachedFile={attachedFile}
            imageURL={initialData?.filePath}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
