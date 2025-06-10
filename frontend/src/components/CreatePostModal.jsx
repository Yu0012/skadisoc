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
  //const [attachedFile, setAttachedFile] = useState(null);
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
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
      setClient(initialData.client || "");
      setScheduledDate(initialData.scheduledDate ? new Date(initialData.scheduledDate) : null);
      setSelectedPlatforms(initialData.selectedPlatforms || []);
      // if (initialData.filePath) {
      //   const fetchFile = async () => {
      //     try {
      //       const response = await fetch(`${config.API_BASE}${initialData.filePath}`);
      //       const blob = await response.blob();
      //       const fileName = initialData.filePath.split("/").pop();
      //       const file = new File([blob], fileName, { type: blob.type });
      //       setAttachedFile(file);
      //     } catch (err) {
      //       console.error("⚠️ Failed to preload image:", err);
      //     }
      //   };
      //   fetchFile();
      // }
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

  const handleSubmit = () => {
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

    const formValues = {
      title,
      content,
      client: selectedClient?._id || "",
      clientName: finalClientName,
      scheduledDate,
      selectedPlatforms,
    };

    console.log("client:", client);
console.log("clientName:", finalClientName);
console.log("clients:", clients);



    onSave?.(formValues); // Pass values up
    onClose(); // Close modal
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
                {/* <button className="attach-file-btn" onClick={triggerFileInput}>
                  <FaPaperclip id="paperclip" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="file-input"
                  onChange={handleFileChange}
                  accept="image/*, .pdf, .docx"
                  style={{ display: "none" }}
                /> */}

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
                        onChange={(date) => {
                          setScheduledDate(date);
                          setShowDatePicker(false);
                        }}
                        showTimeSelect
                        timeIntervals={30}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        inline
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* File preview (optional) */}
              {/* {attachedFile && (
                <div className="attached-file-preview">
                  {attachedFile.type.startsWith("image/") ? (
                    <img src={URL.createObjectURL(attachedFile)} alt="Attachment Preview" />
                  ) : (
                    <p>{attachedFile.name}</p>
                  )}
                </div>
              )} */}

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
            // attachedFile={attachedFile}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
