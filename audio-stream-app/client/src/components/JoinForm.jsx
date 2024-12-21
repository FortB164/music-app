import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { socket } from '../services/socket';

const JoinForm = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleHost = () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    socket.emit('create-room', roomId);
    onJoin(roomId, true);
  };

  const handleJoin = () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    socket.emit('join-room', roomId);

    socket.once('room-joined', () => {
      onJoin(roomId, false);
    });

    socket.once('room-error', (message) => {
      setError(message);
    });
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Join Audio Room
      </Typography>
      <TextField
        fullWidth
        label="Room ID"
        value={roomId}
        onChange={(e) => {
          setRoomId(e.target.value);
          setError('');
        }}
        error={!!error}
        helperText={error}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleHost}>
          Host Room
        </Button>
        <Button variant="outlined" onClick={handleJoin}>
          Join Room
        </Button>
      </Box>
    </Box>
  );
};

export default JoinForm;
