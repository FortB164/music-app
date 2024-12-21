import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const AudioPlayer = ({ audioStream, isPlaying }) => {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (audioStream && isPlaying && audioContextRef.current) {
      const playAudio = async () => {
        try {
          const arrayBuffer = await audioStream.arrayBuffer();
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          source.start();
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      };
      playAudio();
    }
  }, [audioStream, isPlaying]);

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <audio ref={audioRef} controls style={{ width: '100%' }} />
    </Box>
  );
};

export default AudioPlayer;
