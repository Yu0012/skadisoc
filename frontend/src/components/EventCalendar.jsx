// Import dependencies
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaAngleLeft, FaAnglesLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";
import { FaSyncAlt } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles.css";
import config from '../config'; 
import Preview from "./Preview";
import Swal from 'sweetalert2';


// FullCalendar plugins
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// Import CreatePostModal
import CreatePostModal from "./CreatePostModal";

const EventCalendar = () => {
  // State for calendar events
  const [events, setEvents] = useState([]); // Holds all calendar events
  const [currentMonth, setCurrentMonth] = useState(""); // Current month for header
  const [currentYear, setCurrentYear] = useState(""); // Current year for header
  const calendarRef = useRef(null); // Reference to calendar instance

  // Modal state management
  const [selectedEvent, setSelectedEvent] = useState(null); // Selected event for detail view
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Create post modal visibility
  const [createInitialData, setCreateInitialData] = useState({}); // Data passed to create modal

  // Filtering state
  const [availableClients, setAvailableClients] = useState([]); // All distinct clients
  const [activeClients, setActiveClients] = useState(new Set()); // Clients currently selected
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state

  // Platform selection state
  const [selectedPlatform, setSelectedPlatform] = useState(""); // Tracks platform selection for new posts

  const token = localStorage.getItem("token"); // JWT token for authentication

  const [username, setUsername] = useState("");

  const fetchPostsAndClients = async () => {
    try {
      // Fetch posts
      const res = await axios.get(`${config.API_BASE}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const posts = Array.isArray(res.data.posts) ? res.data.posts : [];

      // Fetch clients from all platforms
      const platforms = ["facebook", "instagram", "twitter"];
      let allClients = [];

      for (let platform of platforms) {
        try {
          const response = await axios.get(`${config.API_BASE}/api/clients/${platform}/all`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const platformClients = response.data.clients.map(client => ({
            id: client._id,
            name: client.pageName || client.username || client.name,
          }));
          allClients.push(...platformClients);
        } catch (err) {
          console.error(`❌ Failed to fetch ${platform} clients`, err);
        }
      }

      // Set client lists
      const uniqueNames = [...new Set(allClients.map(c => c.name))];
      setAvailableClients(uniqueNames);
      setActiveClients(new Set(uniqueNames));

      // Format and set events
      if (Array.isArray(posts)) {
        setEvents(formatEvents(posts));
      } else {
        console.warn("🛑 Unexpected post data format:", posts);
        setEvents([]);
      }

    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  // Initial fetch of all posts and clients
  useEffect(() => {
    fetchPostsAndClients();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const res = await fetch(`${config.API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user info");

        const data = await res.json();
        setUsername(data.username); // username is sent from backend
      } catch (err) {
        console.error("User info fetch error:", err);
      }
    };

    fetchUserInfo();
  }, []);

  // Format API response to FullCalendar-compatible objects
  const formatEvents = (posts) => {
    return posts.map(post => ({
      id: post._id,
      title: post.title || "Untitled Post",
      start: post.scheduledDate,
      extendedProps: {
        client: post.client,
        clientName: post.clientName || "",
        content: post.content,
        hashtags: post.hashtags,
        platforms: post.selectedPlatforms?.join(", "),
        link: post.filePath?.startsWith("http")
          ? post.filePath
          : `${config.API_BASE}${post.filePath}`,
        scheduledDate: post.scheduledDate,
        status: post.status || "scheduled",
      },
    }));
  };

  // Update calendar title when view changes
  const updateTitle = (date) => {
    setCurrentMonth(date.toLocaleString("default", { month: "long" }));
    setCurrentYear(date.getFullYear());
  };

  // Navigation controls
  const goToToday = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
    updateTitle(calendarApi.getDate());
  };

  const goToPrev = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
    updateTitle(calendarApi.getDate());
  };

  const goToPrevDouble = () => {
    const calendarApi = calendarRef.current.getApi();
    for (let i = 0; i < 12; i++) calendarApi.prev();
    updateTitle(calendarApi.getDate());
  };

  const goToNext = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
    updateTitle(calendarApi.getDate());
  };

  const goToNextDouble = () => {
    const calendarApi = calendarRef.current.getApi();
    for (let i = 0; i < 12; i++) calendarApi.next();
    updateTitle(calendarApi.getDate());
  };

  // Render custom content inside calendar events
  const renderEventContent = (eventInfo) => {
    return (
      <div className="custom-event-box">
        <span className="custom-event-time">{eventInfo.timeText}</span>
        <span className="custom-event-title">{eventInfo.event.extendedProps.clientName}</span>
      </div>
    );
  };

  // Reload the page
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="posts-container calendar-page-scroll">
      {/* Header Section */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">{username || "Loading..."}</h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="calendar-content-area">
        {/* Sidebar with filters and mini calendar */}
        <div className={`calendar-sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
          <div className="sidebar-header">
            {isSidebarOpen && <p className="sidebar-title">📅 CALENDARS</p>}
            <button className="collapse-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? "⮜" : "⮞"}
            </button>
          </div>

          {isSidebarOpen && (
            <>
              <label className="client-checkbox">
                <input
                  type="checkbox"
                  checked={activeClients.size === availableClients.length}
                  onChange={(e) => {
                    setActiveClients(e.target.checked ? new Set(availableClients) : new Set());
                  }}
                />
                <span>Select All</span>
              </label>
              {availableClients.map((client, index) => (
                <label key={index} className="client-checkbox">
                  <input
                    type="checkbox"
                    checked={activeClients.has(client)}
                    onChange={() => {
                      setActiveClients((prev) => {
                        const updated = new Set(prev);
                        updated.has(client) ? updated.delete(client) : updated.add(client);
                        return updated;
                      });
                    }}
                  />
                  <span>{client}</span>
                </label>
              ))}

              {/* Mini calendar */}
              <Calendar
                calendarType="gregory"
                tileClassName={({ date, view }) => {
                  if (view === "month") {
                    const match = events.some(
                      (e) =>
                        activeClients.has(e.extendedProps.client) &&
                        new Date(e.start).toDateString() === date.toDateString()
                    );
                    return match ? "square-highlight" : null;
                  }
                }}
              />
            </>
          )}
        </div>

        {/* Main Calendar Area - Wrapped in blur container */}
        <div className={`calendar-main-wrapper ${createInitialData?.scheduledDate && !isCreateModalOpen ? "blurred" : ""}`}>
          {/* Calendar Navigation Row */}
          <div className="search-toolbar-container">
            <div className="search-container calendar-controls-row calendar-nav-bar" style={{ justifyContent: "flex-end" }}>
              <div className="calendar-nav-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button className="fc-today-button" onClick={goToToday}>Today</button>
                <FaAnglesLeft className="fc-nav-button" onClick={goToPrevDouble} />
                <FaAngleLeft className="fc-nav-button" onClick={goToPrev} />
                <p className="fc-current-date">{currentMonth}, {currentYear}</p>
                <FaAngleRight className="fc-nav-button" onClick={goToNext} />
                <FaAnglesRight className="fc-nav-button" onClick={goToNextDouble} />
                <FaSyncAlt className="refresh-icon" onClick={handleRefresh} title="Refresh Data" />
              </div>
            </div>
            <div className="calendar-scroll-wrapper">
              {/* FullCalendar Component */}
              <div className="calendar-toolbar">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={false}
                  events={events.filter(event => activeClients.has(event.extendedProps.clientName))}
                  dayHeaderFormat={{ weekday: "long" }}
                  showNonCurrentDates={true}
                  contentHeight="auto"
                  expandRows={true}
                  fixedWeekCount={false}
                  dayMaxEventRows={true}
                  height="auto"
                  eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: true }}
                  datesSet={(info) => {
                    updateTitle(info.view.currentStart);
                    setIsSidebarOpen(false);
                  }}
                  eventClick={(info) => {
                    const eventProps = {
                      title: info.event.title,
                      ...info.event.extendedProps,
                      _id: info.event.id, // ✅ this is the fix
                    };

                    if (eventProps.status === "posted") {
                      setSelectedEvent(eventProps);
                      setIsModalOpen(true);
                    } else {
                      setCreateInitialData({
                        ...eventProps,
                        filePath: eventProps.link,
                      });

                      const primaryPlatform = eventProps.platforms?.split(",")[0].toLowerCase();
                      setSelectedPlatform(primaryPlatform || "");
                      setIsCreateModalOpen(true);
                    }
                  }}

                  eventClassNames={(arg) => {
                    const status = arg.event.extendedProps.status;
                    return status === 'posted' ? ['event-posted'] : ['event-scheduled'];
                  }}

                  dateClick={(info) => {
                    const clickedDate = new Date(info.dateStr);
                    setCreateInitialData({ scheduledDate: clickedDate });
                    setSelectedPlatform("");
                  }}
                  eventContent={renderEventContent}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Selection Popup (shown above blurred background) */}
        {createInitialData?.scheduledDate && !isCreateModalOpen && (
          <div className="platform-popup-box modern-platform-box">
            <p className="platform-box-title">📌 Please select a platform</p>
            <div className="platform-button-group">
              {["facebook", "instagram", "twitter"].map((plat) => (
                <button
                  key={plat}
                  className="platform-select-btn"
                  onClick={() => {
                    setSelectedPlatform(plat);
                    setIsCreateModalOpen(true);
                  }}
                >
                  {plat.charAt(0).toUpperCase() + plat.slice(1)}
                </button>
              ))}
              <button
                className="platform-select-btn cancel"
                onClick={() => setCreateInitialData({})}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className="modal-overlay">
          <div className="event-modal vertical-detail-modal">
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            <Preview
              compact
              platform={(selectedEvent.platforms?.split(",")[0] || "").trim().toLowerCase()}
              content={selectedEvent.content}
              client={selectedEvent.clientName}
              imageURL={selectedEvent.link}
            />

            <div className="modal-note" style={{ marginTop: "1rem" }}>
              Scheduled for: {new Date(selectedEvent.scheduledDate).toLocaleString()}
            </div>
          </div>
        </div>
      )}


      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateInitialData({});
            setSelectedPlatform("");
          }}
          initialData={{
            ...createInitialData,
            selectedPlatforms: [selectedPlatform],
          }}
          platform={selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
          onSave={async (formValues) => {
            try {
              const token = localStorage.getItem("token");

              const payload = {
                title: formValues.title,
                content: formValues.content,
                client: formValues.client,
                clientName: formValues.clientName,
                scheduledDate: formValues.scheduledDate,
                selectedPlatforms: formValues.selectedPlatforms,
                filePath: formValues.filePath || null,
              };

              const isEdit = !!formValues._id;
              const url = isEdit
                ? `${config.API_BASE}/api/posts/${formValues._id}`
                : `${config.API_BASE}/api/posts`;
              const method = isEdit ? "PUT" : "POST";

              const response = await fetch(url, {
                method,
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });

              const resultText = await response.text();
              let result;
              try {
                result = JSON.parse(resultText);
              } catch {
                throw new Error("Invalid JSON from server");
              }

              if (!response.ok) {
                throw new Error(result.message || "Failed to save post");
              }

              // Update calendar events
              setEvents((prev) => {
                const newEvent = {
                  id: result._id,
                  title: result.clientName || "Untitled Post",
                  start: result.scheduledDate,
                  extendedProps: {
                    client: result.client,
                    clientName: result.clientName,
                    content: result.content,
                    hashtags: result.hashtags,
                    platforms: result.selectedPlatforms?.join(", "),
                    link: result.filePath?.startsWith("http")
                      ? result.filePath
                      : `${config.API_BASE}${result.filePath}`,
                    scheduledDate: result.scheduledDate,
                    status: result.status || "scheduled",
                  },
                };

                const exists = prev.some((e) => e.id === result._id);
                return exists
                  ? prev.map((e) => (e.id === result._id ? newEvent : e))
                  : [...prev, newEvent];
              });

              setIsCreateModalOpen(false);
              setCreateInitialData({});
              setSelectedPlatform("");
              Swal.fire({
                icon: 'success',
                title: isEdit ? 'Post Updated' : 'Post Created',
                text: `The post has been ${isEdit ? 'updated' : 'created'} successfully.`,
                timer: 2000,
                showConfirmButton: false
              });

              await fetchPostsAndClients(); // 👈 Refresh after saving
            } catch (err) {
              console.error("❌ Failed to save post from calendar:", err);
              Swal.fire({
                icon: 'error',
                title: 'Save Failed',
                text: err.message || 'Unable to save post. Please try again.'
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default EventCalendar;