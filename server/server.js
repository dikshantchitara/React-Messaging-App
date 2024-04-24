const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = [];

wss.on("connection", function connection(ws) {
  clients.push(ws);
  console.log("New client connected");

  ws.on("message", function incoming(message) {
    console.log("Received message:", message);

    // Convert the message to a string if it's not already
    const stringMessage =
      typeof message === "string" ? message : message.toString();

    // Broadcast the string message to all clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(stringMessage);
      }
    });

    console.log("Message broadcasted to all clients");
  });

  ws.on("close", function close() {
    // Remove client from list when disconnected
    clients.splice(clients.indexOf(ws), 1);
    console.log("Client disconnected");
  });
});


server.listen(3001, function () {
  console.log("Server started on port 3001");
});
