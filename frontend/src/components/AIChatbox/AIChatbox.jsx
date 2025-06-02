// src/components/AIChatbox/AIChatbox.jsx
import React, { useState, useRef, useEffect } from 'react';
import './AIChatbox.css';

const AIChatbox = () => {
  // State variables
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('chatgpt');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Toggle chatbox open/close
  const toggleChatbox = () => {
    setIsOpen(!isOpen);
    if (isMinimized && !isOpen) {
      setIsMinimized(false);
    }
  };

  // Toggle minimize/maximize
  const toggleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  // Toggle dark/light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle dragging functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('.chatbox-header')) {
      setIsDragging(true);
      const rect = chatContainerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep chatbox within window bounds
      const maxX = window.innerWidth - chatContainerRef.current.offsetWidth;
      const maxY = window.innerHeight - chatContainerRef.current.offsetHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle file attachment
  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputText.trim() && attachments.length === 0) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      attachments: [...attachments],
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setAttachments([]);

    // Mock AI response for now - we'll implement the actual API calls later
    setIsLoading(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: `This is a sample response from the ${selectedModel} AI model.`,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  // Handle key press events
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Set up event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      const chatContent = chatContainerRef.current.querySelector('.chatbox-content');
      if (chatContent) {
        chatContent.scrollTop = chatContent.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div 
      className={`chatbox-container ${isDarkMode ? 'dark-mode' : 'light-mode'} ${isMinimized ? 'minimized' : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        display: isOpen ? 'flex' : 'none'
      }}
      ref={chatContainerRef}
      onMouseDown={handleMouseDown}
    >
      <div className="chatbox-header">
        <div className="header-title">AI Assistant</div>
        <div className="header-controls">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button className="minimize-btn" onClick={toggleMinimize}>
            {isMinimized ? '▲' : '▼'}
          </button>
          <button className="close-btn" onClick={toggleChatbox}>×</button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="model-selector">
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="chatgpt">ChatGPT</option>
              <option value="gemini">Gemini</option>
              <option value="deepseek">DeepSeek</option>
              <option value="ollama">Ollama</option>
            </select>
          </div>
          
          <div className="chatbox-content">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">
                  {message.text}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="message-attachments">
                      {message.attachments.map((file, index) => (
                        <div key={index} className="attachment-preview">
                          {file.type.startsWith('image/') ? (
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={file.name} 
                              className="attachment-image" 
                            />
                          ) : (
                            <div className="file-attachment">
                              <span className="file-icon">📄</span>
                              <span className="file-name">{file.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="loading-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            )}
          </div>
          
          <div className="attachment-previews">
            {attachments.map((file, index) => (
              <div key={index} className="attachment-item">
                <span className="attachment-name">{file.name}</span>
                <button 
                  className="remove-attachment" 
                  onClick={() => removeAttachment(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="chatbox-input">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
            />
            <button className="attachment-btn" onClick={handleAttachmentClick}>
              📎
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              multiple
            />
            <button className="send-btn" onClick={handleSendMessage}>
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Chat toggle button component that appears fixed on the screen
export const ChatToggleButton = ({ toggleChatbox, isOpen }) => {
  return (
    <button 
      className={`chat-toggle-btn ${isOpen ? 'active' : ''}`}
      onClick={toggleChatbox}
    >
      {isOpen ? '✕' : '💬'}
    </button>
  );
};

export default AIChatbox;