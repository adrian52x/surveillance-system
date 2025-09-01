"use client";

import { useSocket } from '@/providers/socket-provider';
import { useState } from 'react';

const UserJoin: React.FC = () => {
    const [name, setName] = useState('');
    const { isConnected, joinSession } = useSocket();

    const generateRandomName = () => {
        const adjectives = ['Smart', 'Quick', 'Bright', 'Cool', 'Fast', 'Sharp', 'Bold', 'Clever'];
        const animals = ['Fox', 'Eagle', 'Tiger', 'Wolf', 'Bear', 'Lion', 'Hawk', 'Shark'];
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
        const randomNumber = Math.floor(Math.random() * 100);
        return `${randomAdjective}${randomAnimal}${randomNumber}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            joinSession(name.trim());
        }
    };

    const handleRandomName = () => {
        const randomName = generateRandomName();
        setName(randomName);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                Object Detection
                </h1>
                <p className="text-gray-600 text-center mb-6">
                Enter your name to start detecting objects with AI
                </p>

                {/* Connection Status */}
                <div className="mb-6 p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">
                    {isConnected ? 'Connected to server' : 'Connecting to server...'}
                    </span>
                </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                    </label>
                    <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={20}
                    />
                </div>

                <button
                    type="button"
                    onClick={handleRandomName}
                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                    🎲 Generate Random Name
                </button>

                <button
                    type="submit"
                    disabled={!name.trim() || !isConnected}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    name.trim() && isConnected
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {!isConnected ? 'Connecting...' : 'Start Detection Session'}
                </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                <p>📹 Make sure your camera is ready</p>
                <p>🤖 AI will detect objects in real-time</p>
                </div>
            </div>
        </div>
    );
};

export default UserJoin;
