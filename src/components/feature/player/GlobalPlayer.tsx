'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Settings2, X, Mic2, ListMusic, MonitorSpeaker } from 'lucide-react';

const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const SimpleTooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
    return (
        <div className="group/tooltip relative flex items-center justify-center">
            {children}
            <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:block whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-white shadow-lg">
                {text}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
            </div>
        </div>
    );
};

export function GlobalPlayer() {
    const {
        currentTrack, isPlaying, togglePlay, duration, currentTime,
        seek, analyser, tuning, setTuning, isAutoTuning, setAutoTuning, tier, role, stop
    } = usePlayer();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

    if (!isMounted) return null;

    const isVisible = !!currentTrack && (isPlaying || currentTime > 0);

    return (
        <div
            id="global-player-panel"
            className={`fixed bottom-0 left-0 right-0 h-24 bg-[#121212] z-[100] border-t border-white/5 flex flex-col transition-all duration-700 ease-in-out ${isVisible
                    ? 'translate-y-0 opacity-100 visible pointer-events-auto'
                    : 'translate-y-full opacity-0 invisible pointer-events-none'
                }`}
        >
            {/* Minimal Scrub Bar - Top */}
            <div className="h-0.5 w-full bg-white/5 cursor-pointer relative group" onClick={handleProgressClick}>
                <div
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 relative transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <div className="flex-1 container mx-auto px-6 flex items-center justify-between gap-12">
                {/* Left: Metadata */}
                <div className="flex items-center gap-4 w-72 min-w-0 group/meta">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 shadow-2xl border border-white/10 relative">
                        {currentTrack?.src ? (
                            <img src={currentTrack.src.includes('cover') ? currentTrack.src : "/placeholder-cover.jpg"} className="w-full h-full object-cover transition-transform duration-500 group-hover/meta:scale-110" alt={currentTrack.title} />
                        ) : <div className="w-full h-full flex items-center justify-center">🎵</div>}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/meta:opacity-100 transition-opacity" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-black text-white truncate uppercase tracking-tight hover:text-violet-400 cursor-pointer transition-colors">{currentTrack?.title}</h4>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 cursor-pointer transition-colors">{currentTrack?.artist}</p>
                    </div>
                </div>

                {/* Center: Controls */}
                <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-8 text-zinc-400">
                        <SimpleTooltip text="Shuffle">
                            <Shuffle size={18} className="hover:text-white cursor-pointer transition-colors" />
                        </SimpleTooltip>

                        <SimpleTooltip text="Previous">
                            <SkipBack size={24} className="hover:text-white cursor-pointer transition-colors fill-current" />
                        </SimpleTooltip>

                        <SimpleTooltip text={isPlaying ? "Pause" : "Play"}>
                            <button
                                onClick={togglePlay}
                                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </button>
                        </SimpleTooltip>

                        <SimpleTooltip text="Next">
                            <SkipForward size={24} className="hover:text-white cursor-pointer transition-colors fill-current" />
                        </SimpleTooltip>

                        <SimpleTooltip text="Repeat">
                            <Repeat size={18} className="hover:text-white cursor-pointer transition-colors" />
                        </SimpleTooltip>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
                        <span>{formatTime(currentTime)}</span>
                        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative group/progress cursor-pointer" onClick={handleProgressClick}>
                            <div
                                className="h-full bg-white/40 group-hover/progress:bg-violet-500 transition-colors"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Right: Frequency & Tech */}
                <div className="w-72 flex justify-end items-center gap-6">
                    {/* Frequency Switcher */}
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">Aura Tuning</span>
                        <div className="flex items-center bg-black/60 rounded-full p-1 border border-white/5 shadow-inner">
                            <SimpleTooltip text="Auto-Tune">
                                <button
                                    onClick={() => setAutoTuning(!isAutoTuning)}
                                    className={`text-[9px] font-black px-2 py-1.5 rounded-full transition-all ${isAutoTuning ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'} ${role !== 'admin' && tier !== 'business' && tier !== 'enterprise' ? 'opacity-20 cursor-not-allowed' : ''}`}
                                >
                                    AUTO
                                </button>
                            </SimpleTooltip>
                            {(['440hz', '432hz', '528hz'] as const).map((t) => (
                                <SimpleTooltip key={t} text={`Tuning: ${t}`}>
                                    <button
                                        onClick={() => setTuning(t)}
                                        className={`text-[9px] font-black px-2 py-1.5 rounded-full transition-all ${tuning === t ? 'bg-violet-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'} ${role !== 'admin' && tier === 'free' && t !== '440hz' ? 'opacity-20 cursor-not-allowed' : ''}`}
                                    >
                                        {t.toUpperCase()}
                                    </button>
                                </SimpleTooltip>
                            ))}
                        </div>
                    </div>

                    <div className="hidden xl:block w-24 h-8 opacity-40">
                        <canvas ref={canvasRef} width={96} height={32} className="w-full h-full" />
                    </div>

                    <div className="flex items-center gap-4 text-zinc-500">
                        <SimpleTooltip text="Lyrics">
                            <Mic2 size={18} className="hover:text-white cursor-pointer transition-colors" />
                        </SimpleTooltip>

                        <SimpleTooltip text="Queue">
                            <ListMusic size={18} className="hover:text-white cursor-pointer transition-colors" />
                        </SimpleTooltip>

                        <SimpleTooltip text="Connect to a device">
                            <MonitorSpeaker size={18} className="hover:text-white cursor-pointer transition-colors" />
                        </SimpleTooltip>

                        <SimpleTooltip text="Mute">
                            <Volume2 size={20} className="hover:text-white cursor-pointer transition-colors" />
                        </SimpleTooltip>

                        <SimpleTooltip text="Settings">
                            <Settings2 size={20} className="hover:text-white cursor-pointer transition-colors" />
                        </SimpleTooltip>

                        <SimpleTooltip text="Close Player">
                            <button
                                onClick={stop}
                                className="bg-white/5 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all ml-2"
                            >
                                <X size={18} />
                            </button>
                        </SimpleTooltip>
                    </div>
                </div>
            </div>
        </div>
    );
}
