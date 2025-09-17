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
  // confidence: number;
  // bbox: [number, number, number, number];
  timestampInitial: string;
  timestampFinal: string;
}

export interface VideoFrame {
  userId: string;
  userName: string;
  frameData: string; // base64 image data
  timestamp: string;
  lastUpdate?: Date;
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
  videoFrames: Map<string, VideoFrame>;
  
  // Actions
  joinSession: (name: string) => void;
  sendDetection: (detection: Pick<Detection, 'objectClass'>) => void;
  sendVideoFrame: (frameData: string) => void;
  stopVideoStream: () => void;
  requestUsersList: () => void;
}

// Socket configuration
export const SOCKET_CONFIG = {
  url: process.env.NEXT_PUBLIC_SOCKET_URL || 
       (process.env.NODE_ENV === 'production'
         ? `https://${window.location.hostname}` // ← No port needed!
         : 'http://localhost:5000'),
  options: {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  }
} as const;
