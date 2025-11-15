'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket?.id);
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on component unmount to keep connection alive
    };
  }, []);

  return { socket, isConnected };
};

export const getSocket = () => socket;
