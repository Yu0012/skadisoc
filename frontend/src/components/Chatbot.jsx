import React, { useState, useEffect, useRef } from "react";
import "../styles.css";
import { MdOutlineMessage } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { IoMdSend } from "react-icons/io";
import { BsGripVertical } from "react-icons/bs";
import icon from "../assets/icon-women.png";

const Chatbot = () => {
  const [chatbotOverlay, setchatbotOverlay] = useState("closed"); // Triggers overlay opening/closing
  const [input, setInput] = useState(""); // User's message
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Widget position

  // Dragging state and offset tracking
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });


  const dragRef = useRef(false); // Track if movement occurred

  // Directional alignment for where the chatbot opens
  const [horizontalAlignment, setHAlignment] = useState("left");
  const [verticalAlignment, setVAlignment] = useState("bottom");

  // Reference to chatbox DOM element (for scroll management)
  const chatboxRef = useRef(null);

  // Message list + initialization message
  const [messages, setMessages] = useState([
    { type: "incoming", text: "Hi there! How can I help?" }, // Initial bot message
  ]);

  // Load saved position from localStorage on mount. 
  // If this is the first time the user logs in, or hasn't been to website in a long time,
  // widget would be at a fixed place until the user moves the widget
  useEffect(() => {
    const savedPosition = localStorage.getItem("chatbotPosition");

    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        if (
          typeof parsed.x === "number" &&
          typeof parsed.y === "number"
        ) {
          setPosition(parsed);
          return;
        }
      } catch (e) {
        // If JSON parse fails, ignore
      }
    }

    // Default position if no saved position found
    setPosition({ x: window.innerWidth - 100, y: window.innerHeight - 130 }); // Adjust as needed
  }, []);


  // Calculate offset between cursor and widget origin
  const handleMouseDown = (e) => {
    setDragging(true);
    dragRef.current = false; // Reset drag flag
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };
  
  // Move widget based on cursor movement, update position
  const handleMouseMove = (e) => {
    if (!dragging) return;

    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;

    const widgetWidth = 100; // Match your widget width
    const widgetHeight = 60; // Match your widget height

    // Clamp the values to keep widget within the screen
    const clampedX = Math.max(0, Math.min(newX, window.innerWidth - widgetWidth));
    const clampedY = Math.max(0, Math.min(newY, window.innerHeight - widgetHeight));

    if (Math.abs(clampedX - position.x) > 3 || Math.abs(clampedY - position.y) > 3) {
      dragRef.current = true;
    }

    setPosition({ x: clampedX, y: clampedY });
  };

  
  // Save new position to localStorage
  const handleMouseUp = (e) => {
    setDragging(false);

    // Save the new position to localStorage when the user finishes dragging
    localStorage.setItem("chatbotPosition", JSON.stringify(position));

    console.log("Vertical position (Y):", position.y);
  };
  
  // Add/remove event listeners dynamically based on dragging state
  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
  
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  // Sets open/close of chatbot
  const toggleOverlay = (view) => {
    if (view === "open") {

      // Website length and height
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Position of widget
      const widgetCenterX = position.x + 25; 
      const widgetCenterY = position.y + 25;

      // Check horizontal alignment
      if (widgetCenterX > screenWidth / 2) {
        setHAlignment("left"); // open to the left
      } else {
        setHAlignment("right"); // open to the right
      }

      // Check vertical alignment
      if (widgetCenterY >= 186 && widgetCenterY <= 511){
        setVAlignment("middle"); // custom flag for side display
      }
      else if (widgetCenterY > screenHeight / 2) {
        setVAlignment("bottom"); // open at the bottom
      } else {
        setVAlignment("top"); // open at the top
      }


    }
    setchatbotOverlay(view);
  };

  // Retrieves user message and sends it to messages Array
  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed === "") return;

    const newMessage = { type: "outgoing", text: trimmed };
    setMessages((prev) => [...prev, newMessage]); // Add message to array
    setInput("");  // Clears textarea when used

    // Scrolls down after user sends message to see recent message
    setTimeout(() => {
      if (chatboxRef.current) {
        chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <div>
      {/* Chatbot Closed */}
      {chatbotOverlay === "closed" && (
      // Widget
      <div
        className="chatbot-widget"
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000,
        }}
      >
        {/* Grip icons are draggable */}
        <BsGripVertical
          id="grip-icon"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        />

        {/* Message icon toggles chatbot overlay on click */}
        <MdOutlineMessage
          id="message-icon"
          onClick={() => toggleOverlay("open")}
        />

        {/* Second grip icon is also draggable */}
        <BsGripVertical
          id="grip-icon"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        />
      </div>

            )}

      {/* Chatbot Open */}
      {chatbotOverlay === "open" && (
        <div
          style={{
            position: "fixed",
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 1000,
          }}
        >
          <div
            className="chatbot"
            style={{
              position: "fixed",
              left:
              verticalAlignment === "middle"
                ? (horizontalAlignment === "left"
                    ? `${position.x - 430}px`  // Widget at middle-right: open at left
                    : `${position.x + 70}px`) // Widget at middle left: open at right
                : (horizontalAlignment === "left"
                    ? `${position.x - 360}px` // Widget at right: open at left 
                    : `${position.x}px`), // Widget at left: open at right
            
                  top:
                  verticalAlignment === "bottom"
                    ? `${position.y - 510}px` // Widget at bottom: open at top
                    : verticalAlignment === "top"
                    ? `${position.y + 70}px` // Widget at top: open at bottle
                    : `${position.y - 230}px`, // Widget at middle: open at side
                
              zIndex: 1000,
            }}
          >
            {/* Header Section */}
            <header>
              <img className="chatbot-icon" src={icon} />
              <h2>Skadi Chatbot</h2>
            </header>

            {/* Chatbox Section */}
            <ul className="chatbox" ref={chatboxRef}>
              {messages.map((msg, index) => (
                <li className={`chat ${msg.type}`} key={index}>
                  <p>{msg.text}</p>
                </li>
              ))}
            </ul>

            {/* Message Section */}
            <div className="chat-input">
              <textarea
                placeholder="Enter a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <IoMdSend id="send-btn" onClick={handleSend} />
            </div>
          </div>

          {/* Close Button */}
          <button
            className="chatbot-widget-closed"
            style={{
              position: "fixed",
              left: `${position.x}px`,
              top: `${position.y}px`,
              cursor: "pointer",
              zIndex: 1001,
            }}
            onClick={() => toggleOverlay("closed")}
          >
            <ImCross className="chatbox-cross" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
