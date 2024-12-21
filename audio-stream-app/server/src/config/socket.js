const { Server } = require('socket.io');

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('create_room', (roomId) => {
      rooms.set(roomId, {
        hostId: socket.id,
        participants: new Set([socket.id]),
      });
      socket.join(roomId);
      console.log(`Room ${roomId} created by host: ${socket.id}`);
      socket.emit('room_created', roomId);
    });
    
    socket.on('audio-upload', ({ roomId, audioData }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        if (socket.id === room.hostId) {
          console.log(`Broadcasting audio from host (${socket.id}) to room: ${roomId}`);
          socket.to(roomId).emit('audio-ready', audioData);
        } else {
          console.log(`Non-host (${socket.id}) attempted to upload audio.`);
        }
      } else {
        console.log(`Room ${roomId} not found.`);
      }
    });
    

    socket.on('join_room', (roomId) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      room.participants.add(socket.id);
      socket.join(roomId);
      socket.emit('room_joined', roomId);
    });

    socket.on('leave_room', (roomId) => {
      const room = rooms.get(roomId);
      if (room) {
        room.participants.delete(socket.id);
        if (room.hostId === socket.id) {
          io.to(roomId).emit('host_disconnected');
          rooms.delete(roomId);
        }
      }
      socket.leave(roomId);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      rooms.forEach((room, roomId) => {
        if (room.hostId === socket.id) {
          io.to(roomId).emit('host_disconnected');
          rooms.delete(roomId);
        } else {
          room.participants.delete(socket.id);
        }
      });
    });
  });

  return io;
};

module.exports = configureSocket;
