'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Settings2, X } from 'lucide-react';

const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function GlobalPlayer() {
    const {
        currentTrack, isPlaying, togglePlay, duration, currentTime,
        seek, analyser, tuning, setTuning, isAutoTuning, setAutoTuning, tier, stop
    } = usePlayer();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    useEffect(() => {
        if (!analyser || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw visualizer with Aura Violet
            const bars = 30;
            const barWidth = (canvas.width / bars) - 1;
            for (let i = 0; i < bars; i++) {
                const value = dataArray[i * Math.floor(bufferLength / bars)];
                const height = (value / 255) * canvas.height;
                ctx.fillStyle = i % 2 === 0 ? '#7C3AED' : '#0ea5e9';
                ctx.beginPath();
                ctx.roundRect(i * (barWidth + 1), (canvas.height - height) / 2, barWidth, height, 10);
                ctx.fill();
            }
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
    }, [analyser, isPlaying]);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        seek(((e.clientX - rect.left) / rect.width) * duration);
    };

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 glass-panel z-[100] border-t border-white/5 flex flex-col">
            {/* Minimal Scrub Bar */}
            <div className="h-1 w-full bg-white/5 cursor-pointer relative group" onClick={handleProgressClick}>
                <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 relative transition-all"
                    style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            <div className="flex-1 container mx-auto px-6 flex items-center justify-between gap-12">
                {/* Left: Metadata */}
                <div className="flex items-center gap-4 w-72 min-w-0">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 shadow-2xl border border-white/10">
                        {currentTrack.src ? (
                            <img src={currentTrack.src.includes('cover') ? currentTrack.src : "/placeholder-cover.jpg"} className="w-full h-full object-cover" alt="" />
                        ) : <div className="w-full h-full flex items-center justify-center">🎵</div>}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-black text-white truncate uppercase tracking-tight">{currentTrack.title}</h4>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{currentTrack.artist}</p>
                    </div>
                </div>

                {/* Center: Controls */}
                <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-8 text-zinc-400">
                        <Shuffle size={18} className="hover:text-white cursor-pointer transition-colors" />
                        <SkipBack size={24} className="hover:text-white cursor-pointer transition-colors fill-current" />
                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>
                        <SkipForward size={24} className="hover:text-white cursor-pointer transition-colors fill-current" />
                        <Repeat size={18} className="hover:text-white cursor-pointer transition-colors" />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
                        <span>{formatTime(currentTime)}</span>
                        <div className="w-64 h-0.5 bg-white/5 rounded-full" />
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Right: Frequency & Tech */}
                <div className="w-72 flex justify-end items-center gap-6">
                    {/* Frequency Switcher */}
                    <div className="flex items-center bg-black/40 rounded-full p-1 border border-white/5">
                        <button
                            onClick={() => setAutoTuning(!isAutoTuning)}
                            className={`text-[9px] font-black px-2 py-1.5 rounded-full transition-all ${isAutoTuning ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            AUTO
                        </button>
                        {(['440hz', '432hz', '528hz'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTuning(t)}
                                className={`text-[9px] font-black px-2 py-1.5 rounded-full transition-all ${tuning === t ? 'bg-violet-600 text-white' : 'text-zinc-600 hover:text-zinc-400'} ${tier === 'free' && t !== '440hz' ? 'opacity-20 cursor-not-allowed' : ''}`}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="hidden xl:block w-24 h-8 opacity-40">
                        <canvas ref={canvasRef} width={96} height={32} className="w-full h-full" />
                    </div>

                    <div className="flex items-center gap-3 text-zinc-500">
                        <Volume2 size={20} className="hover:text-white cursor-pointer transition-colors" />
                        <Settings2 size={20} className="hover:text-white cursor-pointer transition-colors" />
                        <button
                            onClick={stop}
                            className="bg-white/5 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all ml-2"
                            title="Close Player"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
