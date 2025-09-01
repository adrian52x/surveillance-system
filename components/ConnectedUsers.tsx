"use client";

import { useSocket } from '@/providers/socket-provider';

const ConnectedUsers: React.FC = () => {
    const { users, recentDetections } = useSocket();

    const formatTime = (timestamp: string | Date) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-600 bg-green-100';
        if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
        return 'text-orange-600 bg-orange-100';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Live Activity</h2>
            
            {/* Connected Users Section - Fixed height */}
            <div className="h-44 mb-6 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Connected Users ({users.length})
                </h3>
                
                {users.length === 0 ? (
                <p className="text-gray-500 text-sm">No users connected</p>
                ) : (
                <div className="space-y-2 overflow-y-auto h-32">
                    {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <p className="font-medium text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500">
                                Joined {formatTime(user.joinedAt)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-500 ml-1">Online</span>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>

            {/* Recent Detections Section - Calculated remaining height */}
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                Recent Detections {recentDetections.length}
                </h3>
                
                {recentDetections.length === 0 ? (
                <p className="text-gray-500 text-sm">No detections yet</p>
                ) : (
                <div className="space-y-2 overflow-y-auto pr-2 h-[45vh]">
                    {recentDetections.map((detection) => (
                    <div key={detection.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {detection.userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="ml-2 font-medium text-gray-800 text-sm">
                            {detection.userName}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {formatTime(detection.timestamp)}
                        </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">
                            {detection.objectClass}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(detection.confidence)}`}>
                            {(detection.confidence * 100).toFixed(1)}%
                        </span>
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                        Position: [{detection.bbox.map(b => Math.round(b)).join(', ')}]
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
};

export default ConnectedUsers;
