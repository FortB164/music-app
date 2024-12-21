import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { socket } from '../services/socket';

const Room = ({ roomId, isHost, onLeave }) => {
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    // Listen for audio data from the server
    if (!isHost) {
      socket.on('audio-ready', (audioData) => {
        const blob = new Blob([audioData], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      });
    }

    // Listen for host disconnection
    socket.on('host-disconnected', () => {
      alert('Host has disconnected. Room is closed.');
      onLeave(); // Navigate back
    });

    return () => {
      socket.off('audio-ready');
      socket.off('host-disconnected');
    };
  }, [isHost, onLeave]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const audioData = e.target.result;
        socket.emit('audio-upload', { roomId, audioData }); // Broadcast to server
        const blob = new Blob([audioData], { type: 'audio/mpeg' });
        setAudioUrl(URL.createObjectURL(blob)); // Play locally for the host
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Room: {roomId}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        You are {isHost ? 'hosting' : 'participating in'} this room
      </Typography>

      {/* Show file upload only for the host */}
      {isHost && (
        <Box sx={{ my: 2 }}>
          <input
            accept="audio/*"
            style={{ display: 'none' }}
            id="audio-file"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="audio-file">
            <Button variant="contained" component="span">
              Upload Audio
            </Button>
          </label>
        </Box>
      )}

      {/* Audio Player for Both Host and Participants */}
      {audioUrl && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Current Audio:
          </Typography>
          <audio controls style={{ width: '100%' }} src={audioUrl}></audio>
        </Box>
      )}
    </Box>
  );
};

export default Room;
