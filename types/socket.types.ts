import { Socket } from 'socket.io-client';

// Socket context types and interfaces
export interface User {
  id: string;
  name: string;
  isActive: boolean;
  joinedAt: Date;
}

export interface Detection {
  id: string;
  userId: string;
  userName: string;
  objectClass: string;
  confidence: number;
  bbox: [number, number, number, number];
  timestamp: string;
}

export interface SocketContextType {
  // Connection state
  socket: Socket | null;
  isConnected: boolean;
  
  // User state
  userId: string | null;
  userName: string | null;
  
  // Global app state
  users: User[];
  recentDetections: Detection[];
  
  // Actions
  joinSession: (name: string) => void;
  sendDetection: (detection: {
    objectClass: string;
    confidence: number;
    bbox: [number, number, number, number];
  }) => void;
}

// Socket configuration
export const SOCKET_CONFIG = {
  url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
  options: {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  }
} as const;
