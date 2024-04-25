import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://192.168.1.215:3001");

    socket.onopen = () => {
      console.log("Connected to server");
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const receivedMessage = event.data;
      if (typeof receivedMessage === "string") {
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      } else {
        convertBlobToText(receivedMessage);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  const handleMessageChange = (event) => {
    setMessageInput(event.target.value);
  };

  const handleFileChange = (event) => {
    setFileInput(event.target.files[0]);
  };

  const sendMessage = () => {
    if (ws) {
      if (messageInput.trim() !== "" || fileInput) {
        if (messageInput.trim() !== "") {
          // Send text message
          ws.send(messageInput.trim());
          setMessageInput("");
        }
        if (fileInput) {
          // Read file data and send as base64 encoded string
          const reader = new FileReader();
          reader.onload = function () {
            const fileData = reader.result.split(",")[1]; // Remove data URI prefix
            ws.send(fileData);
          };
          reader.readAsDataURL(fileInput);
          setFileInput(null);
        }
      }
    }
  };

  const convertBlobToText = (blob) => {
    const reader = new FileReader();
    reader.onload = function () {
      const messageText = reader.result;
      setMessages((prevMessages) => [...prevMessages, messageText]);
    };
    reader.readAsText(blob);
  };

  return (
    <div className="App">
      <h1>Chat App</h1>
      <div className="message-container">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={messageInput}
          onChange={handleMessageChange}
          placeholder="Type your message..."
        />
        <input
          type="file"
          onChange={handleFileChange}
          accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
