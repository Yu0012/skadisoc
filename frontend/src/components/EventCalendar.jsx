import React, { useEffect, useRef, useState } from "react";
import { FaSearch, FaDownload, FaEllipsisV, FaSyncAlt, FaPlus } from "react-icons/fa"; // Icons
import "../styles.css";
import calendarData from "../data/calendarEvents.json";

//Plugins of FullCalendar
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

//Icons
import leftButton from "../assets/LeftArrow.png";
import rightButton from "../assets/RightArrow.png";
import doubleLeftButton from "../assets/DoubleLeftArrow.png";
import doubleRightButton from "../assets/DoubleRightArrow.png";

const EventCalendar = () => {
  const [events, setEvents] = useState([]); // Store posts data
  const [category, setCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  const calendarRef = useRef(null); // Reference for FullCalendar
  const [currentMonth, setCurrentMonth] = useState("");
  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
   setEvents(calendarData); // Fetch data from JSON (simulate API call)
  }, []);

  // Checks date of calendar
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      updateTitle(calendarApi.getDate());
  }}, []);

    // Updates the title of current year, month
    const updateTitle = (date) => {
      setCurrentMonth(date.toLocaleString("default", { month: "long" }));
      setCurrentYear(date.getFullYear());
    };

  

  // Navigates to today's month/year
  const goToToday = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
    updateTitle(calendarApi.getDate());
  };

 //Goes back a month
 const goToPrev = () => {
  const calendarApi = calendarRef.current.getApi();
  calendarApi.prev();
  updateTitle(calendarApi.getDate());
};

//Goes back a year
const goToPrevDouble = () => {
  const calendarApi = calendarRef.current.getApi();
  for (let i = 0; i < 12; i++)
  {
    calendarApi.prev();
  }
  updateTitle(calendarApi.getDate());
};

//Goes forward a month
const goToNext = () => {
  const calendarApi = calendarRef.current.getApi();
  calendarApi.next();
  updateTitle(calendarApi.getDate());
};

//Goes forward a year
const goToNextDouble = () => {
  const calendarApi = calendarRef.current.getApi();
  for (let i = 0; i < 12; i++)
    {
      calendarApi.next();
    }
  updateTitle(calendarApi.getDate());
};

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Refresh Function - Reloads data
  const handleRefresh = () => {
    window.location.reload();
  };

  // Create Post Function (Placeholder for real functionality)
  const handleCreatePost = () => {
    console.log("Redirecting to Create Post Page...");
    // You can add navigation logic here
  };

  // Creates event in Calendar by clicking, can be referenced later when creating the Post Function
  const handleDateClick = (info) => {
    const newEvent = { title: "New Event", date: info.dateStr };
    setEvents([...events, newEvent]);
  };

  return (
    <div className="posts-container">
      {/* Welcome Message, Refresh & Create Post */}
      <div className="posts-header">
        <div className="welcome-message">
          <p>Welcome,</p>
          <h2 className="user-name">Amber Broos</h2>
        </div> 
        <div className="posts-actions">
          <FaSyncAlt className="refresh-icon" onClick={handleRefresh} title="Refresh Data" />
          <button className="create-post-btn" onClick={handleCreatePost}>
            <FaPlus /> Create Post
          </button>
          <div className="search-box">
            <input type="text" placeholder="Tap to Search" value={searchQuery} onChange={handleSearch} />
            <FaSearch className="search-icon" />
          </div>
        </div>
      </div>
  
      {/* Search Bar */}
      <div className="search-toolbar-container">
        {/* Search Filters */}
        <div className="search-container">
          <div className="fc-toolbar-left">
          <select className="dropdown" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Date</option>
            <option>Day</option>
            <option>Week</option>
            <option>Month</option>
            <option>Year</option>
          </select>
        
          <div className="search-box">
            <input type="text" placeholder="Search by keywords" value={searchQuery} onChange={handleSearch} />
            <FaSearch className="search-icon" />
          </div>
      
          {/* Sets calendar to today's date */}
          <button className="fc-today-button" onClick={goToToday}>
            Today
          </button>
        </div>
          <div className="fc-toolbar-right">
            {/* Navigation of calendar + title of current date */}
            <img src={doubleLeftButton} className="fc-nav-button" onClick={goToPrevDouble}></img>
            <img src={leftButton} className="fc-nav-button" onClick={goToPrev}></img>
            <p className="fc-current-date"> 
              {currentMonth}, {currentYear}
            </p>
            <img src={rightButton} className="fc-nav-button" onClick={goToNext}>
            </img>
            <img src={doubleRightButton} className="fc-nav-button" onClick={goToNextDouble}>
            </img>
          </div>
        </div>
  
        {/* FullCalendar */}
        <div className="calendar-toolbar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            //dateClick={handleDateClick} Can be used as reference for creating a new post
            headerToolbar={false}
            events={events}
            dayHeaderFormat={{ weekday: "long" }}
            datesSet={(info) => {
              updateTitle(info.view.currentStart); //updates title upon start
            }}
          />
        </div>
      </div>
    </div>
  );
  
};
  export default EventCalendar;