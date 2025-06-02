// // src/components/AIChatbox/ChatboxWrapper.jsx
// import React, { useState, useEffect } from 'react';
// import AIChatbox, { ChatToggleButton } from './AIChatbox';


// const ChatboxWrapper = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [chats, setChats] = useState([]);
//   const [activeChat, setActiveChat] = useState(null);
  
//   // Toggle chatbox visibility
//   const toggleChatbox = () => {
//     setIsOpen(!isOpen);
//   };
  
//   // Create a new chat
//   const createNewChat = () => {
//     const newChat = {
//       id: Date.now(),
//       title: `Chat ${chats.length + 1}`,
//       messages: [],
//       createdAt: new Date().toISOString()
//     };
    
//     setChats([...chats, newChat]);
//     setActiveChat(newChat.id);
//   };
  
//   // Load chats from localStorage on component mount
//   useEffect(() => {
//     const savedChats = localStorage.getItem('ai-chatbox-chats');
//     if (savedChats) {
//       try {
//         const parsedChats = JSON.parse(savedChats);
//         setChats(parsedChats);
        
//         // Set active chat to the most recent one if available
//         if (parsedChats.length > 0) {
//           setActiveChat(parsedChats[parsedChats.length - 1].id);
//         }
//       } catch (error) {
//         console.error('Failed to parse saved chats:', error);
//       }
//     }
//   }, []);
  
//   // Save chats to localStorage whenever they change
//   useEffect(() => {
//     if (chats.length > 0) {
//       localStorage.setItem('ai-chatbox-chats', JSON.stringify(chats));
//     }
//   }, [chats]);
  
//   return (
//     <>
//       {isOpen && <AIChatbox toggleChatbox={toggleChatbox} />}
//       <ChatToggleButton toggleChatbox={toggleChatbox} isOpen={isOpen} />
//     </>
//   );
// };

// export default ChatboxWrapper;