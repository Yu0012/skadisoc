// Import dependencies
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaAngleLeft, FaAnglesLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";
import { FaSyncAlt } from "react-icons/fa";
import "../styles.css";

// FullCalendar plugins
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// ✅ Import CreatePostModal
import CreatePostModal from "./CreatePostModal"; // Adjust the path if necessary

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const calendarRef = useRef(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ New state for create modal logic
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialData, setCreateInitialData] = useState({});

  // ✅ Fetch posts and format for calendar
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts");
        const posts = res.data;

        const formatted = posts.map((post) => ({
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

        setEvents(formatted);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    fetchPosts();
  }, []);

  // ✅ On calendar load, update title
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

  // ✅ Render time + title for each calendar event cell
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

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="posts-container">
      {/* Header section */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>
      </div>

      {/* Toolbar + Calendar */}
      <div className="search-toolbar-container">
        <div className="search-container calendar-controls-row">
          {/* ✅ Navigation Row with Today button on the left side of month/year switch */}
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

        <div className="calendar-toolbar ">
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
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            }}
            datesSet={(info) => updateTitle(info.view.currentStart)}
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

            // ✅ Hide full rows that are completely outside the current month (no height leftovers)
            viewDidMount={() => {
              const calendarApi = calendarRef.current?.getApi?.();
              if (!calendarApi) return;

              const calendarMonth = calendarApi.getDate().getMonth();
              const rows = document.querySelectorAll(".fc-daygrid-body tr");

              rows.forEach((row) => {
                const allTds = Array.from(row.querySelectorAll("td"));
                const isFullRowOutsideMonth = allTds.every((td) => {
                  const dateStr = td.getAttribute("data-date");
                  if (!dateStr) return false;
                  const cellDate = new Date(dateStr);
                  return cellDate.getMonth() !== calendarMonth;
                });

                if (isFullRowOutsideMonth) {
                  row.style.display = "none";
                  row.style.height = "0px";
                  row.style.padding = "0";
                  row.style.margin = "0";
                }
              });
            }}
          />
        </div>
      </div>

      {/* Modal with event details */}
      {isModalOpen && selectedEvent && (
        <div className="modal-overlay">
          <div className="event-modal vertical-detail-modal">
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className="modal-title">{selectedEvent.title}</h2>

            <div className="modal-field"><strong>Client:</strong> {selectedEvent.client || '-'}</div>
            <div className="modal-field"><strong>Content:</strong> {selectedEvent.content || '-'}</div>

            {/* ✅ Dynamic platform links */}
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
                        <a
                          href={previewLinks[trimmed]}
                          target="_blank"
                          rel="noreferrer"
                          className="platform-link"
                        >
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
              This post was scheduled on {" "}
              {new Date(selectedEvent.scheduledDate).toLocaleString()}.
            </div>
          </div>
        </div>
      )}

      {/* ✅ CreatePostModal when clicking on empty calendar cell */}
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