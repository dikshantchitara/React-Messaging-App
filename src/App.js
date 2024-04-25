import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://192.168.1.215:3001");

    socket.onopen = () => {
      console.log("Connected to server");
      setWs(socket);
    };

  socket.onmessage = (event) => {
    const receivedMessage = event.data;
    if (receivedMessage instanceof Blob) {
     
      const reader = new FileReader();
      reader.onload = function () {
        const messageText = reader.result;
        setMessages((prevMessages) => [...prevMessages, messageText]);
      };
      reader.readAsText(receivedMessage);
    } else if (typeof receivedMessage === "string") {
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    } else {
      console.log("Received unsupported message format:", receivedMessage);
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

  const sendMessage = () => {
    if (ws && messageInput.trim() !== "") {
      const message = messageInput.trim();
      ws.send(message);
      setMessageInput("");
    }
  };

  return (
    <div className="App">
      <h1>Chat App</h1>
      <div className="message-container">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {typeof message === "string" ? (
              message
            ) : (
              <span>Received non-string message</span>
            )}
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
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
