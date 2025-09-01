"use client";

import ObjectDetection from "@/components/ObjectDetection";
import UserJoin from "@/components/UserJoin";
import ConnectedUsers from "@/components/ConnectedUsers";
import { useSocket } from "@/providers/socket-provider";


export default function Home() {
    const { userName, isConnected } = useSocket();

    // Show user join screen if user hasn't joined yet
    if (!userName) {
        return <UserJoin />;
    }

    // Show main split layout after joining
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            {/* Header */}
            {/* <header className="mb-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 tracking-tight">
                                Detection Hub
                            </h1>
                            <p className="text-gray-600 mt-2">Real-time object detection and user activity</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-gray-600">
                                {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                            <div className="text-sm text-gray-800">
                                Logged in as <span className="font-semibold text-blue-600">{userName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header> */}

            {/* Main Content - Split Layout */}
            <main className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
                    {/* Left Side - Camera Section (2/3 width on large screens) */}
                    <div className="lg:col-span-2 h-full">
                        <ObjectDetection />
                    </div>

                    {/* Right Side - Connected Users & Activity (1/3 width on large screens) */}
                    <div className="lg:col-span-1 h-full">
                        <ConnectedUsers />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-6 text-center">
                <div className="max-w-7xl mx-auto">
                    <p className="text-gray-500 text-sm">
                        🔧 Built with Next.js, TensorFlow.js & Socket.io | 
                        <span className="ml-2">📊 Real-time AI Object Detection</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}
