'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/shared/Button';

// Helper to format seconds to MM:SS
const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function GlobalPlayer() {
    const { currentTrack, isPlaying, togglePlay, duration, currentTime, seek, analyser } = usePlayer();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    // Internal state for dragging progress
    const [isDragging, setIsDragging] = useState(false);
    const [dragTime, setDragTime] = useState(0);

    // Progress percentage (0-100)
    // If dragging, show dragTime. Else show currentTime.
    const displayTime = isDragging ? dragTime : currentTime;
    const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

    // Visualizer Animation
    useEffect(() => {
        if (!analyser || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const animate = () => {
            if (!isPlaying) {
                // Optional: Clear or show static state when paused
                // animationRef.current = requestAnimationFrame(animate); 
                // return;
            }

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#F97316'; // Primary Orange

            // We only show a subset of bars to fit the small canvas nicely
            const bars = 40;
            const step = Math.floor(bufferLength / bars);
            const barWidth = (canvas.width / bars) - 1;

            for (let i = 0; i < bars; i++) {
                // Get average of the bin range
                let sum = 0;
                for (let j = 0; j < step; j++) {
                    sum += dataArray[(i * step) + j];
                }
                const value = sum / step;

                // Scale value to canvas height
                const percent = value / 255;
                const height = Math.max(2, percent * canvas.height); // Min height 2px

                const x = i * (barWidth + 1);
                const y = (canvas.height - height) / 2; // Center vertically

                // Draw rounded bars
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, height, 2);
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [analyser, isPlaying]);

    // Handle Progress Bar Interactions
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (duration <= 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percent = Math.max(0, Math.min(1, x / width));
        const newTime = percent * duration;

        seek(newTime);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || duration <= 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percent = Math.max(0, Math.min(1, x / width));
        setDragTime(percent * duration);
    };

    const handleMouseDown = () => {
        setIsDragging(true);
        setDragTime(currentTime);
    };

    const handleMouseUp = () => {
        if (isDragging) {
            seek(dragTime);
            setIsDragging(false);
        }
    };

    if (!currentTrack) return null;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 h-24 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 text-white z-[100] transition-transform duration-300"
            onMouseUp={handleMouseUp} // Catch releases outside the bar
            onMouseLeave={handleMouseUp}
        >
            {/* Progress Bar (Scrubbable) */}
            <div
                className="group absolute top-0 left-0 right-0 h-1.5 cursor-pointer hover:h-4 transition-all bg-gray-800 z-10"
                onClick={handleProgressClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
            >
                {/* Background Layer to catch clicks consistently */}
                <div className="absolute inset-0 w-full h-full" />

                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-75 ease-linear relative pointer-events-none"
                    style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Time Tooltip on Hover (Optional, simplified for now just showing currTime/duration below) */}
            </div>

            <div className="container mx-auto h-full px-6 flex items-center justify-between gap-8">
                {/* Track Info */}
                <div className="flex items-center gap-4 w-1/4">
                    <div className="w-14 h-14 bg-gray-800 rounded-lg overflow-hidden relative group">
                        {currentTrack.src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={currentTrack.src.includes('cover') ? currentTrack.src : "/placeholder-cover.jpg"} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🎵</div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">{currentTrack.title}</h4>
                        <p className="text-xs text-gray-400 truncate hover:text-white cursor-pointer transition-colors">
                            {currentTrack.artist}
                        </p>
                    </div>
                    {/* Time Display for Mobile/Desktop */}
                    <div className="hidden md:block text-xs text-gray-400 ml-4 font-mono">
                        {formatTime(displayTime)} / {formatTime(duration)}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="flex items-center gap-6">
                        <button className="text-gray-400 hover:text-white transition-colors" title="Shuffle">🔀</button>
                        <button className="text-gray-300 hover:text-white transition-colors text-xl">⏮</button>

                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                        >
                            {isPlaying ? (
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                            ) : (
                                <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>

                        <button className="text-gray-300 hover:text-white transition-colors text-xl">⏭</button>
                        <button className="text-gray-400 hover:text-white transition-colors" title="Loop">🔁</button>
                    </div>
                </div>

                {/* Visualizer & Utility */}
                <div className="w-1/4 flex justify-end items-center gap-4">
                    <div className="hidden lg:block w-32 h-10 opacity-70">
                        <canvas ref={canvasRef} width={128} height={40} className="w-full h-full" />
                    </div>

                    <div className="flex items-center gap-2 group">
                        <span className="text-gray-400 text-xs">🔊</span>
                        <div className="w-24 h-1 bg-gray-700 rounded-full cursor-pointer relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 bg-white w-2/3 group-hover:bg-primary transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
