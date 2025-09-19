"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDLoad, ObjectDetection as CocoSSDModel } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPredictions } from "@/utils/render-predictions";
import { useSocket } from "@/providers/socket-provider";

const ObjectDetection: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDetecting, setIsDetecting] = useState<boolean>(false);
    const [detectionCount, setDetectionCount] = useState<number>(0);
    const [lastDetections, setLastDetections] = useState<any[]>([]);
    const [videoFps, setVideoFps] = useState<number>(0);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Default to back camera

    const [model, setModel] = useState<CocoSSDModel | null>(null);

    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameCountRef = useRef<number>(0);
    const lastFpsUpdateRef = useRef<number>(Date.now());
    const { sendDetection, sendVideoFrame, stopVideoStream, isConnected, userName } = useSocket();

    async function runCoco(): Promise<void> {

        // Step 1: Initialize TensorFlow.js backend
        setIsLoading(true);
        await tf.ready();
        
        //const net: CocoSSDModel = await cocoSSDLoad() keep this

        // Step 2: Load the trained model from local files
        const modelUrl = '/models/coco-ssd/model.json';
        console.log('🎯 Loading COCO-SSD model from:', modelUrl);
        
        const net: CocoSSDModel = await cocoSSDLoad({
            modelUrl: modelUrl
        });
        
        console.log('✅ Model loaded successfully from local files!');
        setIsLoading(false);
        setModel(net); // Store model, don't create interval here
    }

    async function runObjectDetection(net: CocoSSDModel): Promise<void> {
        if (
            canvasRef.current &&
            webcamRef.current !== null &&
            webcamRef.current.video?.readyState === 4
        ) {
            canvasRef.current.width = webcamRef.current.video.videoWidth;
            canvasRef.current.height = webcamRef.current.video.videoHeight;

            // find detected objects
            const detectedObjects = await net.detect(
                webcamRef.current.video,
                undefined,
                0.70
            );

            //   console.log(detectedObjects);

            const context = canvasRef.current.getContext("2d");
            if (context) {
                renderPredictions(detectedObjects, context);
            }

            // Update local state
            setLastDetections(detectedObjects);

            // Send ONLY person detections to backend if detecting and connected
            if (isDetecting && isConnected && detectedObjects.length > 0) {
                const personDetections = detectedObjects.filter(detection => 
                    detection.class === 'person'
                );
                
                if (personDetections.length > 0) {
                    personDetections.forEach((detection) => {
                        sendDetection({
                            objectClass: detection.class,
                            // confidence: detection.score,
                            // bbox: detection.bbox as [number, number, number, number]
                        });
                    });
                    setDetectionCount(prev => prev + personDetections.length);
                }
            }
        }
    }

    const captureAndSendVideoFrame = () => {
        if (webcamRef.current?.video) {
            const video = webcamRef.current.video;
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
                // Reduce resolution for better performance while maintaining quality
                const scaleFactor = 0.5; // 50% of original size
                tempCanvas.width = video.videoWidth * scaleFactor;
                tempCanvas.height = video.videoHeight * scaleFactor;
                
                // Draw current video frame to canvas with scaling
                tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
                
                // Convert to base64 with optimized quality/compression
                const frameData = tempCanvas.toDataURL('image/jpeg', 0.6); // Reduced quality for better performance
                sendVideoFrame(frameData);
                
                // Update FPS counter
                frameCountRef.current++;
                const now = Date.now();
                if (now - lastFpsUpdateRef.current >= 1000) {
                    setVideoFps(frameCountRef.current);
                    frameCountRef.current = 0;
                    lastFpsUpdateRef.current = now;
                }
            }
        }
    };

    const toggleDetection = () => {
        setIsDetecting(!isDetecting);
        if (!isDetecting) {
            setDetectionCount(0); // Reset count when starting
        } else {
            // Clear canvas when stopping detection
            if (canvasRef.current) {
                const context = canvasRef.current.getContext("2d");
                if (context) {
                    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
            }
            // Clear last detections
            setLastDetections([]);
            // Stop video stream to notify admin dashboard
            stopVideoStream();
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const isMobileDevice = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // Video constraints with dynamic facing mode
    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: facingMode
    };

    const showmyVideo = (): void => {
        if (
            webcamRef.current !== null &&
            webcamRef.current.video?.readyState === 4
        ) {
            const myVideoWidth = webcamRef.current.video.videoWidth;
            const myVideoHeight = webcamRef.current.video.videoHeight;

            webcamRef.current.video.width = myVideoWidth;
            webcamRef.current.video.height = myVideoHeight;
        }
    };

    // Load model only once on mount
    useEffect(() => {
        runCoco();
        showmyVideo();
    }, []);

    // Create/destroy intervals when detection state or model changes
    useEffect(() => {
        let detectionInterval: NodeJS.Timeout | null = null;
        let videoInterval: NodeJS.Timeout | null = null;
        
        if (model && isDetecting) {
            // Object detection at lower frequency (more CPU intensive)
            detectionInterval = setInterval(() => {
                runObjectDetection(model);
            }, 500); // 2 FPS for detection
            
            // Video streaming at higher frequency (smoother video)
            videoInterval = setInterval(() => {
                if (isConnected && webcamRef.current?.video) {
                    captureAndSendVideoFrame();
                }
            }, 33); // ~20 FPS for video streaming
        }
        
        // Cleanup function
        return () => {
            if (detectionInterval) {
                clearInterval(detectionInterval);
            }
            if (videoInterval) {
                clearInterval(videoInterval);
            }
        };
    }, [model, isDetecting, isConnected]); // Safe dependencies

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
            {/* User Info Header */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Camera</h2>
                        <p className="text-sm text-gray-600">{userName}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-600">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        {isDetecting && (
                        <div className="text-sm text-blue-600 font-medium">
                            📡 Broadcasting: {detectionCount} detections sent
                        </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Control Panel */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="text-sm text-gray-700">
                            Current detections: {lastDetections.length > 0 
                            ? lastDetections.map(d => d.class).join(', ') 
                            : 'None'}
                        </div>
                        {isMobileDevice() && (
                            <div className="text-sm text-purple-600 font-medium">
                                📹 {facingMode === 'user' ? 'Front Camera' : 'Back Camera'}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        {isDetecting && (
                            <div className="text-sm text-blue-600 font-medium">
                                📡 Video FPS: {videoFps}
                            </div>
                        )}
                        <button
                            onClick={toggleDetection}
                            disabled={!isConnected}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto ${
                            isDetecting
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : isConnected
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isDetecting ? '⏹️ Stop Broadcasting' : '▶️ Start Broadcasting'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Camera Area */}
            <div className="flex-1">
                {isLoading ? (
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                    <div className="text-center">
                    <div className="text-lg font-medium text-gray-700">Loading AI Model...</div>
                    <div className="text-sm text-gray-500 mt-2">This may take a moment</div>
                    </div>
                </div>
                ) : (
                <div className="relative h-full bg-gradient-to-br from-purple-400 to-blue-500 p-1.5 rounded-lg">
                    <Webcam
                        ref={webcamRef}
                        className="rounded-lg w-full h-full object-cover"
                        muted
                        videoConstraints={videoConstraints}
                        key={facingMode} // Force re-render when camera changes
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-1.5 left-1.5 right-1.5 bottom-1.5 w-[calc(100%-12px)] h-[calc(100%-12px)] rounded-lg"
                    />
                    
                    {/* Detection Status Overlay */}
                    {isDetecting && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                            🔴 LIVE
                        </div>
                    )}

                    {/* Camera Switch Button - Show only on mobile */}
                    {isMobileDevice() && (
                        <button
                            onClick={toggleCamera}
                            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                            title={`Switch to ${facingMode === 'user' ? 'back' : 'front'} camera`}
                        >
                            🔄
                        </button>
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

export default ObjectDetection;
