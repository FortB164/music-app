const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const rooms = {};

// Set up static file serving
app.use(express.static(path.join(__dirname, '../frontend')));

// Configure file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve the host.html file
app.get('/host', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/host.html'));
});

// Serve the join.html file
app.get('/join', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/join.html'));
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const roomId = req.body.roomId;
  if (rooms[roomId]) {
    rooms[roomId].playlist.push(req.file.filename);
    res.status(200).json({ success: true, file: req.file.filename });
    io.to(roomId).emit('playlistUpdated', rooms[roomId].playlist);
  } else {
    res.status(404).json({ success: false, message: 'Room not found' });
  }
});

// WebSocket logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('createRoom', (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { host: socket.id, playlist: [] };
      socket.join(roomId);
      console.log(`Room ${roomId} created`);
    }
  });

  socket.on('joinRoom', (roomId) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
      socket.emit('playlistUpdated', rooms[roomId].playlist);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('play', (roomId) => {
    io.to(roomId).emit('play');
  });

  socket.on('pause', (roomId) => {
    io.to(roomId).emit('pause');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const roomId in rooms) {
      if (rooms[roomId].host === socket.id) {
        delete rooms[roomId];
        io.to(roomId).emit('roomClosed');
      }
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
