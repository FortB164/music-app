import React, { useState } from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import JoinForm from './components/JoinForm';
import Room from './components/Room';
import { socket } from './services/socket';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [roomState, setRoomState] = useState({
    inRoom: false,
    roomId: null,
    isHost: false,
  });

  const handleJoin = (roomId) => {
    socket.emit('join_room', roomId);
    setRoomState({ inRoom: true, roomId, isHost: false });
  };

  const handleHost = (roomId) => {
    socket.emit('create_room', roomId); // Notify the server to create the room
    setRoomState({ inRoom: true, roomId, isHost: true });
  };

  const handleLeave = () => {
    socket.emit('leave_room', roomState.roomId);
    setRoomState({ inRoom: false, roomId: null, isHost: false });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ minHeight: '100vh', py: 4 }}>
          {!roomState.inRoom ? (
            <JoinForm onJoin={handleJoin} onHost={handleHost} />
          ) : (
            <Room
              roomId={roomState.roomId}
              isHost={roomState.isHost}
              onLeave={handleLeave}
            />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
