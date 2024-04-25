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
        // Received message is text
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: "text", data: receivedMessage },
        ]);
      } else if (receivedMessage instanceof Blob) {
        // Received message is a file
        const reader = new FileReader();
        reader.onload = function () {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              type: "file",
              data: reader.result,
              name: fileInput ? fileInput.name : "",
            },
          ]);
        };
        reader.readAsDataURL(receivedMessage);
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
  }, [fileInput]);

  const handleMessageChange = (event) => {
    setMessageInput(event.target.value);
  };

  const handleFileChange = (event) => {
    setFileInput(event.target.files[0]);
  };

  const sendMessage = () => {
    if (ws) {
      if (messageInput.trim() !== "") {
        // Send text message
        ws.send(messageInput.trim());
        setMessageInput("");
      }
      if (fileInput) {
        // Send file data
        ws.send(fileInput);
        setFileInput(null);
      }
    }
  };

  return (
    <div className="App">
      <h1>Chat App</h1>
      <div className="message-container">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message.type === "text" && <span>{message.data}</span>}
            {message.type === "file" && (
              <div>
                <img src={message.data} alt="Received File" />
                <a href={message.data} download={message.name}>
                  Download
                </a>
              </div>
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
