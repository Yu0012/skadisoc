import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaSyncAlt } from "react-icons/fa";
import "../styles.css";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import leftButton from "../assets/LeftArrow.png";
import rightButton from "../assets/RightArrow.png";
import doubleLeftButton from "../assets/DoubleLeftArrow.png";
import doubleRightButton from "../assets/DoubleRightArrow.png";

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const calendarRef = useRef(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="posts-container">
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>
        <div className="posts-actions">
          <FaSyncAlt className="refresh-icon" onClick={handleRefresh} title="Refresh Data" />
        </div>
      </div>

      <div className="search-toolbar-container">
        <div className="search-container">
          <div className="fc-toolbar-left">
            <button className="fc-today-button" onClick={goToToday}>Today</button>
          </div>
          <div className="fc-toolbar-right">
            <img src={doubleLeftButton} className="fc-nav-button" onClick={goToPrevDouble} />
            <img src={leftButton} className="fc-nav-button" onClick={goToPrev} />
            <p className="fc-current-date">{currentMonth}, {currentYear}</p>
            <img src={rightButton} className="fc-nav-button" onClick={goToNext} />
            <img src={doubleRightButton} className="fc-nav-button" onClick={goToNextDouble} />
          </div>
        </div>

        <div className="calendar-toolbar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            events={events}
            dayHeaderFormat={{ weekday: "long" }}
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
          />
        </div>
      </div>

      {isModalOpen && selectedEvent && (
        <div className="modal-overlay">
          <div className="event-modal vertical-detail-modal">
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className="modal-title">{selectedEvent.title}</h2>

            <div className="modal-field"><strong>Client:</strong> {selectedEvent.client || '-'}</div>
            <div className="modal-field"><strong>Content:</strong> {selectedEvent.content || '-'}</div>
            <div className="modal-field"><strong>Hashtags:</strong> {selectedEvent.hashtags || '-'}</div>
            <div className="modal-field">
              <strong>Platforms:</strong>{" "}
              {selectedEvent.platforms ? (
                selectedEvent.platforms.split(",").map((platform, index) => {
                  const trimmed = platform.trim();
                  return (
                    <span key={index} style={{ marginRight: "6px" }}>
                      {trimmed.toLowerCase() === "facebook" ? (
                        <a
                          href={`/facebook-preview/${selectedEvent.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="platform-link"
                        >
                          {trimmed}
                        </a>
                      ) : trimmed.toLowerCase() === "instagram" ? (
                        <a
                          href={`/instagram-preview/${selectedEvent.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="platform-link"
                        >
                          {trimmed}
                        </a>
                      ) : (
                        trimmed
                      )}
                    </span>
                  );
                })
              ) : (
                "-"
              )}
            </div>

            <div className="modal-field">
              <strong>Link:</strong>{" "}
              {selectedEvent.link ? (
                <a
                  href={selectedEvent.link}
                  className="modal-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedEvent.link}
                </a>
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
    </div>
  );
};

export default EventCalendar;