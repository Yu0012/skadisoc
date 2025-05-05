// Import dependencies
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaAngleLeft, FaAnglesLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";
import { FaSyncAlt } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles.css";

// FullCalendar plugins
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// Import CreatePostModal
import CreatePostModal from "./CreatePostModal";

const EventCalendar = () => {
  // Calendar and state references
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const calendarRef = useRef(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialData, setCreateInitialData] = useState({});

  // Sidebar state
  const [availableClients, setAvailableClients] = useState([]);
  const [activeClients, setActiveClients] = useState(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch posts and initialize state
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts");
        const posts = res.data;
        const clientsSet = new Set(posts.map(p => p.client).filter(Boolean));
        const uniqueClients = Array.from(clientsSet);
        setAvailableClients(uniqueClients);
        setActiveClients(new Set(uniqueClients));
        setEvents(formatEvents(posts));
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };
    fetchPosts();
  }, []);

  // Update events when active clients change
  useEffect(() => {
    const fetchFilteredPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts");
        const posts = res.data;
        const filtered = posts.filter(post => activeClients.has(post.client));
        setEvents(formatEvents(filtered));
      } catch (err) {
        console.error("Failed to filter posts:", err);
      }
    };
    fetchFilteredPosts();
  }, [activeClients]);

  // Format event data for FullCalendar
  const formatEvents = (posts) => {
    return posts.map(post => ({
      id: post._id,
      title: post.client || "Untitled Post",
      start: post.scheduledDate,
      extendedProps: {
        client: post.client,
        content: post.content,
        hashtags: post.hashtags,
        platforms: post.selectedPlatforms?.join(", "),
        link: post.filePath ? `http://localhost:5000${post.filePath}` : null,
        scheduledDate: post.scheduledDate,
      },
    }));
  };

  // Set current month and year
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      updateTitle(calendarApi.getDate());
    }
  }, []);

  const updateTitle = (date) => {
    setCurrentMonth(date.toLocaleString("default", { month: "long" }));
    setCurrentYear(date.getFullYear());
  };

  // Navigation buttons
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

  // Custom render for events
  const renderEventContent = (eventInfo) => {
    const time = eventInfo.timeText;
    const title = eventInfo.event.title;
    return (
      <div className="custom-event-box">
        <span className="custom-event-time">{time}</span>
        <span className="custom-event-title">{title}</span>
      </div>
    );
  };

  // Manual refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="posts-container">
      {/* Welcome Header */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="search-toolbar-container">
        <div className="search-container calendar-controls-row">
          <div className="fc-toolbar-left">
            <FaAnglesLeft className="fc-nav-button" onClick={goToPrevDouble} />
            <FaAngleLeft className="fc-nav-button" onClick={goToPrev} />
            <p className="fc-current-date">{currentMonth}, {currentYear}</p>
            <FaAngleRight className="fc-nav-button" onClick={goToNext} />
            <FaAnglesRight className="fc-nav-button" onClick={goToNextDouble} />
          </div>
          <div className="fc-toolbar-right">
            <FaSyncAlt className="refresh-icon" onClick={handleRefresh} title="Refresh Data" />
            <button className="fc-today-button" onClick={goToToday}>Today</button>
          </div>
        </div>

        {/* FullCalendar Display */}
        <div className="calendar-toolbar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            events={events}
            dayHeaderFormat={{ weekday: "long" }}
            showNonCurrentDates={true}
            contentHeight="auto"
            expandRows={true}
            fixedWeekCount={false}
            dayMaxEventRows={true}
            height="auto"
            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }}
            datesSet={(info) => {
              updateTitle(info.view.currentStart);
              setIsSidebarOpen(false); // Auto-close sidebar on page change
            }}
            eventClick={(info) => {
              const eventProps = {
                title: info.event.title,
                ...info.event.extendedProps,
                id: info.event.id
              };
              setSelectedEvent(eventProps);
              setIsModalOpen(true);
            }}
            eventContent={renderEventContent}
            dateClick={(info) => {
              const clickedDate = new Date(info.dateStr);
              setCreateInitialData({ scheduledDate: clickedDate });
              setIsCreateModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Sidebar with client filters and mini calendar */}
      <div className={`calendar-sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <p className="sidebar-title">📅 CALENDARS</p>}
          <button className="collapse-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? "⮜" : "⮞"}
          </button>
        </div>

        {/* Select All + Client List */}
        {isSidebarOpen && (
          <>
            {/* Select All */}
            <label className="client-checkbox">
              <input
                type="checkbox"
                checked={activeClients.size === availableClients.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setActiveClients(new Set(availableClients));
                  } else {
                    setActiveClients(new Set());
                  }
                }}
              />
              <span>Select All</span>
            </label>

            {/* Individual Clients */}
            {availableClients.map((client, index) => (
              <label key={index} className="client-checkbox">
                <input
                  type="checkbox"
                  checked={activeClients.has(client)}
                  onChange={() => {
                    setActiveClients((prev) => {
                      const updated = new Set(prev);
                      if (updated.has(client)) {
                        updated.delete(client);
                      } else {
                        updated.add(client);
                      }
                      return updated;
                    });
                  }}
                />
                <span>{client}</span>
              </label>
            ))}

            {/* Mini Calendar with outlined posts */}
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

      {/* Modal: View post details */}
      {isModalOpen && selectedEvent && (
        <div className="modal-overlay">
          <div className="event-modal vertical-detail-modal">
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className="modal-title">{selectedEvent.title}</h2>
            <div className="modal-field"><strong>Client:</strong> {selectedEvent.client || '-'}</div>
            <div className="modal-field"><strong>Content:</strong> {selectedEvent.content || '-'}</div>
            <div className="modal-field">
              <strong>Platforms:</strong>{" "}
              {selectedEvent.platforms ? (
                selectedEvent.platforms.split(",").map((platform, index) => {
                  const trimmed = platform.trim().toLowerCase();
                  const previewLinks = {
                    facebook: `/facebook-preview/${selectedEvent.id}`,
                    instagram: `/instagram-preview/${selectedEvent.id}`,
                    twitter: `/twitter-preview/${selectedEvent.id}`,
                  };
                  return (
                    <span key={index} style={{ marginRight: "6px" }}>
                      {previewLinks[trimmed] ? (
                        <a href={previewLinks[trimmed]} target="_blank" rel="noreferrer" className="platform-link">
                          {platform.trim()}
                        </a>
                      ) : (
                        platform.trim()
                      )}
                    </span>
                  );
                })
              ) : (
                "-"
              )}
            </div>
            <div className="modal-note">
              This post was scheduled on {new Date(selectedEvent.scheduledDate).toLocaleString()}.
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create post on date click */}
      {isCreateModalOpen && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          initialData={createInitialData}
          onSave={(newPost) => {
            setEvents((prev) => [
              ...prev,
              {
                id: newPost._id,
                title: newPost.client || "Untitled Post",
                start: newPost.scheduledDate,
                extendedProps: {
                  client: newPost.client,
                  content: newPost.content,
                  hashtags: newPost.hashtags,
                  platforms: newPost.selectedPlatforms?.join(", "),
                  link: newPost.filePath ? `http://localhost:5000${newPost.filePath}` : null,
                  scheduledDate: newPost.scheduledDate,
                },
              },
            ]);
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default EventCalendar;
