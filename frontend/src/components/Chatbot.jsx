// Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import "../styles.css";
import { MdOutlineMessage } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { IoMdSend } from "react-icons/io";
import icon from "../assets/icon-women.png";

const Chatbot = () => {
  const [chatbotOverlay, setchatbotOverlay] = useState("closed"); // Triggers overlay opening/closing
  const [input, setInput] = useState(""); // User's message

  const chatboxRef = useRef(null);
  const [messages, setMessages] = useState([
    { type: "incoming", text: "Hi there! How can I help?" }, // Initial bot message
  ]);

  // Sets open/close of chatbot
  const toggleOverlay = (view) => {
    setchatbotOverlay(view);
  };

  // Retrives user message and send to messages Array
  const handleSend = () => {
    
    const trimmed = input.trim();
    if (trimmed === "") return;
  
    const newMessage = { type: "outgoing", text: trimmed };
    setMessages((prev) => [...prev, newMessage]); // Add message to array
    setInput("");  //Clears textarea when used
  
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
        <div className="chatbot-widget" onClick={() => toggleOverlay("open")}>
          <MdOutlineMessage 
          />
        </div>
      )}

    {/* Chatbot Open */}  
    {chatbotOverlay === "open" && (
      <div>
        <div className="chatbot">
          {/* Header Section */}
          <header>
            <img className="chatbot-icon" src={icon} />
            <h2>Skadi Chatbot</h2>
          </header>

          {/* Chatbox Section */}
          <ul className="chatbox" ref={chatboxRef}>
             {/* Display each user message through .map() */}
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
        <button className="chatbot-widget" onClick={() => toggleOverlay("closed")}>
            <ImCross className="chatbox-cross"/>
          </button>
      </div>
    )}
    </div>

  );
};

export default Chatbot;