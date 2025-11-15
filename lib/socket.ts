import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HTTPServer) => {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  if (!io) {
    console.warn('⚠️ Socket.IO not initialized');
  }
  return io;
};

export const emitInventoryUpdate = () => {
  const socketIO = getIO();
  if (socketIO) {
    socketIO.emit('inventory-updated');
    console.log('📡 Emitted inventory-updated event');
  }
};

export const emitReplenishmentUpdate = () => {
  const socketIO = getIO();
  if (socketIO) {
    socketIO.emit('replenishment-updated');
    console.log('📡 Emitted replenishment-updated event');
  }
};
