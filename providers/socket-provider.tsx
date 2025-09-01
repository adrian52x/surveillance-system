'use client'

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback
} from 'react';

import { io as ClientIO, Socket } from 'socket.io-client';
import { User, Detection, SocketContextType, SOCKET_CONFIG } from '@/types/socket.types';

// Create Socket Context with default values
const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    userId: null,
    userName: null,
    users: [],
    recentDetections: [],
    joinSession: () => {},
    sendDetection: () => {}
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    
    // Connection state
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    
    // User state
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    
    // Global app state
    const [users, setUsers] = useState<User[]>([]);
    const [recentDetections, setRecentDetections] = useState<Detection[]>([]);

    // ============================================================================
    // SOCKET CONNECTION SETUP
    // ============================================================================
    
    useEffect(() => {
        const socketInstance = ClientIO(SOCKET_CONFIG.url, SOCKET_CONFIG.options);

        // Connection Event Handlers
        const handleConnect = () => {
            console.log('✅ Connected to server:', socketInstance.id);
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            console.log('❌ Disconnected from server');
            setIsConnected(false);
            // Clear user state on disconnect
            setUserId(null);
            setUserName(null);
            setUsers([]);
        };

        const handleConnectError = (error: Error) => {
            console.error('❌ Connection error:', error);
            setIsConnected(false);
        };

        // Session Event Handlers
        // Triggered by: socket.emit('session-joined') - only for this session
        const handleSessionJoined = (data: { userId: string; userName: string; connectedUsers: number }) => {
            console.log('🎉 Session joined:', data);
            setUserId(data.userId);
            setUserName(data.userName);
        };

        // User List Event Handlers
        // Triggered by: socket.emit('users-list') - only for this session
        const handleUsersList = (usersList: User[]) => {
            console.log('📋 Received users list:', usersList.length, 'users');
            setUsers(usersList);
        };

        // User Activity Event Handlers
        // Triggered by: socket.broadcast.emit('user-joined') - for all OTHER sessions
        const handleUserJoined = (data: { userId: string; userName: string; timestamp: string }) => {
            console.log('👤 New user joined:', data.userName);
            setUsers(prev => [...prev, {
                id: data.userId,
                name: data.userName,
                isActive: true,
                joinedAt: new Date(data.timestamp)
            }]);
        };

        // Triggered by: socket.broadcast.emit('user-left') - for all OTHER sessions
        const handleUserLeft = (data: { userId: string; userName: string; timestamp: string }) => {
            console.log('👋 User left:', data.userName);
            setUsers(prev => prev.filter(user => user.id !== data.userId));
        };

        // Detection Event Handlers
        // Triggered by: socket.broadcast.emit('new-detection') - for all OTHER sessions
        const handleNewDetection = (detection: Detection) => {
            console.log('🔍 New detection:', detection.objectClass, 'by', detection.userName);
            setRecentDetections(prev => [detection, ...prev.slice(0, 49)]);
        };

        // Register Connection Events
        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);
        socketInstance.on('connect_error', handleConnectError);

        // Register Session Events
        // Backend: socket.emit('session-joined') - sent to the current session only
        socketInstance.on('session-joined', handleSessionJoined);

        // Register User List Events  
        // Backend: socket.emit('users-list') - sent to the current session only
        socketInstance.on('users-list', handleUsersList);

        // Register User Activity Events
        // Backend: socket.broadcast.emit('user-joined') - sent to all OTHER sessions (not current)
        // Backend: socket.broadcast.emit('user-left') - sent to all OTHER sessions (not current)
        socketInstance.on('user-joined', handleUserJoined);
        socketInstance.on('user-left', handleUserLeft);

        // Register Detection Events
        // Backend: socket.broadcast.emit('new-detection') - sent to all OTHER sessions (not current)
        socketInstance.on('new-detection', handleNewDetection);

        setSocket(socketInstance);

        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up socket connection...');
            
            // Remove all event listeners
            socketInstance.off('connect', handleConnect);
            socketInstance.off('disconnect', handleDisconnect);
            socketInstance.off('connect_error', handleConnectError);
            socketInstance.off('session-joined', handleSessionJoined);
            socketInstance.off('users-list', handleUsersList);
            socketInstance.off('user-joined', handleUserJoined);
            socketInstance.off('user-left', handleUserLeft);
            socketInstance.off('new-detection', handleNewDetection);
            
            socketInstance.disconnect();
        };
    }, []); // Empty dependency array - socket should connect only once!

    // ============================================================================
    // ACTION METHODS
    // ============================================================================
    
    const joinSession = useCallback((name: string) => {
        if (socket && isConnected) {
            console.log('🚀 Joining session:', name);
            socket.emit('join-session', { userName: name });
        } else {
            console.warn('⚠️ Cannot join session: not connected');
        }
    }, [socket, isConnected]);

    const sendDetection = useCallback((detection: {
        objectClass: string;
        confidence: number;
        bbox: [number, number, number, number];
    }) => {
        if (socket && isConnected) {
            socket.emit('detection', detection);
        } else {
            console.warn('⚠️ Cannot send detection: not connected');
        }
    }, [socket, isConnected]);

    // ============================================================================
    // CONTEXT VALUE
    // ============================================================================
    
    const value: SocketContextType = {
        socket,
        isConnected,
        userId,
        userName,
        users,
        recentDetections,
        joinSession,
        sendDetection
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};