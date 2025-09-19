"use client";

import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/providers/socket-provider';

const AdminDashboard: React.FC = () => {
    const { isConnected, users, videoFrames, requestUsersList, socket } = useSocket();
    const [discordNotificationsEnabled, setDiscordNotificationsEnabled] = useState<boolean>(true);

    // Function to toggle Discord notifications
    const toggleDiscordNotifications = () => {
        const newState = !discordNotificationsEnabled;
        
        // Send to backend
        if (socket) {
            socket.emit('toggle-discord-notifications', { enabled: newState });
        }
    };

    // Listen for Discord toggle confirmation from backend
    useEffect(() => {
        if (socket) {
            const handleDiscordToggled = (data: { enabled: boolean; message: string }) => {
                setDiscordNotificationsEnabled(data.enabled);
            };

            socket.on('discord-notifications-toggled', handleDiscordToggled);

            return () => {
                socket.off('discord-notifications-toggled', handleDiscordToggled);
            };
        }
    }, [socket]);

    // Request users list when admin dashboard loads and connects
    useEffect(() => {
        if (isConnected) {
            requestUsersList();
        }
    }, [isConnected]);

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-10">
            {/* Header */}
            <header className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Watch Center</h1>
                        <p className="text-gray-400 mt-1 text-sm sm:text-base">Live video feeds from all connected users</p>
                    </div>
                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-start sm:justify-end">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-300">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        <div className="text-sm text-gray-300">
                            {users.length} Active Users
                        </div>
                        <button
                            onClick={toggleDiscordNotifications}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                discordNotificationsEnabled
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                            }`}
                            title={`${discordNotificationsEnabled ? 'Disable' : 'Enable'} Discord notifications`}
                        >
                            🔔 Discord {discordNotificationsEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Video Grid */}
            <main>
                {users.length === 0 ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="text-gray-400 text-lg mb-2">No users connected</div>
                            <div className="text-gray-500 text-sm">Waiting for users to join the session...</div>
                        </div>
                    </div>
                ) : (
                    <div className={`grid gap-4 ${
                        users.length === 1 
                            ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
                            : users.length <= 4 
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                            : users.length <= 9 
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }`}>
                        {users.map((user) => {
                            const videoFrame = videoFrames.get(user.id);
                            
                            return (
                                <VideoFeedCard
                                    key={user.id}
                                    user={user}
                                    videoFrame={videoFrame}
                                />
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

interface VideoFeedCardProps {
    user: any;
    videoFrame?: any;
}

const VideoFeedCard: React.FC<VideoFeedCardProps> = ({ user, videoFrame }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Update canvas when new frame data arrives
    useEffect(() => {
        if (videoFrame?.frameData && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                const img = new Image();
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                };
                img.src = videoFrame.frameData;
            }
        }
    }, [videoFrame?.frameData]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            {/* User Info Header */}
            <div className="bg-gray-700 px-4 py-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium text-sm">{user.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-300 text-xs">Live</span>
                    </div>
                </div>
            </div>

            {/* Video Feed Area */}
            <div className="relative aspect-video bg-neutral-800">
                {videoFrame ? (
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                                📹
                            </div>
                            <div className="text-gray-400 text-sm">Waiting for video...</div>
                        </div>
                    </div>
                )}
                
                {/* Timestamp overlay */}
                {videoFrame && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        {formatTime(videoFrame.lastUpdate || new Date(videoFrame.timestamp))}
                    </div>
                )}
            </div>

            {/* User Stats Footer */}
            <div className="bg-gray-700 px-4 py-2">
                <div className="text-gray-300 text-xs">
                    Joined: {formatTime(new Date(user.joinedAt))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
