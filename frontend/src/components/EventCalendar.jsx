import React, { useEffect, useRef, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { FaAngleLeft, FaAnglesLeft, FaAngleRight, FaAnglesRight } from "react-icons/fa6";
import "../styles.css";
import calendarData from "../data/calendarEvents.json";

// Plugins
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";


const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState("");
  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    setEvents(calendarData);
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
    for (let i = 0; i < 12; i++) {
      calendarApi.prev();
    }
    updateTitle(calendarApi.getDate());
  };

  const goToNext = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
    updateTitle(calendarApi.getDate());
  };

  const goToNextDouble = () => {
    const calendarApi = calendarRef.current.getApi();
    for (let i = 0; i < 12; i++) {
      calendarApi.next();
    }
    updateTitle(calendarApi.getDate());
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="posts-container">
      {/* Header with welcome and refresh */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div>
        <div className="posts-actions">
          <FaSyncAlt className="refresh-icon" onClick={handleRefresh} title="Refresh Data" />
        </div>
      </div>

      {/* Calendar toolbar and view */}
      <div className="search-toolbar-container">
        <div className="search-container">
          <div className="fc-toolbar-left">
            <button className="fc-today-button" onClick={goToToday}>
              Today
            </button>
          </div>

          <div className="fc-toolbar-right">
            <FaAnglesLeft className="fc-nav-button" onClick={goToPrevDouble} />
            <FaAngleLeft className="fc-nav-button" onClick={goToPrev} />
            <p className="fc-current-date">
              {currentMonth}, {currentYear}
            </p>
            <FaAngleRight className="fc-nav-button" onClick={goToNext} />
            <FaAnglesRight className="fc-nav-button" onClick={goToNextDouble} />
          </div>
        </div>

        {/* FullCalendar View */}
        <div className="calendar-toolbar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            events={events}
            dayHeaderFormat={{ weekday: "long" }}
            datesSet={(info) => updateTitle(info.view.currentStart)}
          />
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
