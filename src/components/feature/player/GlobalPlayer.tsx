'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/shared/Button';

export function GlobalPlayer() {
    const { currentTrack, isPlaying, togglePlay } = usePlayer();
    const [progress, setProgress] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    // Visualizer Animation
    useEffect(() => {
        if (!isPlaying || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#F97316'; // Primary Orange

            const bars = 50;
            const barWidth = canvas.width / bars;

            for (let i = 0; i < bars; i++) {
                // Mock frequency data
                const height = Math.random() * canvas.height * 0.8;
                const x = i * barWidth;
                const y = (canvas.height - height) / 2;

                // Draw rounded bars
                ctx.beginPath();
                ctx.roundRect(x + 1, y, barWidth - 2, height, 4);
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying]);

    // Mock progress for now
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setProgress(p => (p >= 100 ? 0 : p + 0.5));
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying]);

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 text-white z-[100] transition-transform duration-300">
            {/* Progress Bar (Scrubbable) */}
            <div className="group absolute top-0 left-0 right-0 h-1 cursor-pointer hover:h-2 transition-all bg-gray-800">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 ease-linear relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
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
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                        ♥
                    </button>
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
                    <div className="hidden lg:block w-32 h-10 opacity-50">
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
