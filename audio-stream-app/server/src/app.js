const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store active rooms
const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // When a host creates a room
  socket.on('create-room', (roomId) => {
    activeRooms.set(roomId, { host: socket.id });
    socket.join(roomId);
    socket.emit('room-created', roomId);
    console.log(`Room ${roomId} created by ${socket.id}`);
  });

  // When a client tries to join a room
  socket.on('join-room', (roomId) => {
    if (activeRooms.has(roomId)) {
      socket.join(roomId);
      socket.emit('room-joined', roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    } else {
      socket.emit('room-error', 'Room does not exist');
      console.log(`Join failed: Room ${roomId} does not exist`);
    }
  });

  // Handle audio upload
  socket.on('audio-upload', (audioData) => {
    // Get the room this socket is in
    const [, room] = Array.from(socket.rooms); // First element is socket's own room
    if (room && activeRooms.has(room)) {
      // Broadcast the audio to all other users in the room
      socket.to(room).emit('audio-ready', audioData);
      console.log(`Audio broadcasted to room ${room}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove room if host disconnects
    activeRooms.forEach((value, key) => {
      if (value.host === socket.id) {
        activeRooms.delete(key);
        io.to(key).emit('host-disconnected');
        console.log(`Room ${key} closed - host disconnected`);
      }
    });
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
