'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Repeat,
    Shuffle,
    Settings2,
    X,
    Mic2,
    ListMusic
} from 'lucide-react';

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
            <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:block whitespace-nowrap rounded bg-zinc-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-2xl border border-white/10 z-[100]">
                {text}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
            </div>
        </div>
    );
};

export function GlobalPlayer() {
    const {
        currentTrack, isPlaying, togglePlay, duration, currentTime,
        seek, analyser, tuning, setTuning, isAutoTuning, setAutoTuning, tier, role, stop,
        isMuted, setMuted, volume, setVolume, isShuffle, setShuffle, isRepeat, setRepeat,
        playNext, playPrevious
    } = usePlayer();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const [isMounted, setIsMounted] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // --- Synced Lyrics Parser ---
    const parsedLyrics = useMemo(() => {
        if (!currentTrack?.lyrics) return [];
        const lines = currentTrack.lyrics.split('\n');
        const lrcRegex = /\[(\d{2}):(\d{2})\.(\d{2})\](.*)/;

        const synced = lines.map(line => {
            const match = line.match(lrcRegex);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const ms = parseInt(match[3]);
                return {
                    time: minutes * 60 + seconds + ms / 100,
                    text: match[4].trim()
                };
            }
            return null;
        }).filter(l => l !== null) as { time: number; text: string }[];

        if (synced.length === 0) {
            return lines.filter(l => l.trim() !== '').map((line, i, arr) => ({
                time: (duration / arr.length) * i,
                text: line.trim()
            }));
        }
        return synced.sort((a, b) => a.time - b.time);
    }, [currentTrack, duration]);

    const currentLine = useMemo(() => {
        if (parsedLyrics.length === 0) return null;
        const line = [...parsedLyrics].reverse().find(l => currentTime >= l.time);
        return line || parsedLyrics[0];
    }, [parsedLyrics, currentTime]);

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

            const bars = 20;
            const barWidth = (canvas.width / bars) - 1;
            for (let i = 0; i < bars; i++) {
                const value = dataArray[i * Math.floor(bufferLength / bars)];
                const height = (value / 255) * canvas.height;
                ctx.fillStyle = isPlaying ? '#7C3AED' : '#333333';
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
            className={`fixed bottom-0 left-0 right-0 h-24 bg-[#0A0A0A] z-[100] border-t border-white/5 flex flex-col transition-all duration-700 ease-in-out ${isVisible
                ? 'translate-y-0 opacity-100 visible pointer-events-auto shadow-[0_-20px_60px_rgba(0,0,0,0.8)]'
                : 'translate-y-full opacity-0 invisible pointer-events-none'
                }`}
        >
            {/* 1. Top Scrub Bar (Restored Thin Line) */}
            <div className="h-0.5 w-full bg-white/5 cursor-pointer relative group" onClick={handleProgressClick}>
                <div
                    className="h-full bg-indigo-500 relative transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <div className="flex-1 flex items-center px-12 relative h-full">

                {/* LEFT: Metadata */}
                <div className="flex items-center gap-4 ml-32 min-w-0 group/meta max-w-[220px] z-10">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 shadow-2xl border border-white/10 flex-shrink-0">
                        {currentTrack?.src ? (
                            <img
                                src={currentTrack.src.includes('cover') ? currentTrack.src : "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200"}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/meta:scale-110"
                                alt={currentTrack.title}
                            />
                        ) : <div className="w-full h-full flex items-center justify-center">🎵</div>}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[13px] font-black text-white truncate uppercase italic tracking-tighter leading-tight">{currentTrack?.title}</h4>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-0.5">{currentTrack?.artist}</p>
                    </div>
                </div>

                {/* LYRICS AREA */}
                <div className="absolute left-[400px] right-[calc(50%+220px)] flex items-center justify-center overflow-hidden">
                    {showLyrics && currentLine && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-center">
                            <p className="text-zinc-200 text-[11px] font-black italic uppercase tracking-tighter line-clamp-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                {currentLine.text}
                            </p>
                        </div>
                    )}
                </div>

                {/* CENTER: Main Playback Controls */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20">
                    <div className="flex items-center gap-6 text-zinc-400">
                        <SimpleTooltip text={isShuffle ? "Shuffle On" : "Shuffle Off"}>
                            <Shuffle
                                size={15}
                                onClick={() => setShuffle(!isShuffle)}
                                className={`cursor-pointer transition-all ${isShuffle ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'text-zinc-600 hover:text-white'}`}
                            />
                        </SimpleTooltip>

                        <SkipBack size={18} onClick={playPrevious} className="text-zinc-400 hover:text-white cursor-pointer transition-colors fill-current" />

                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex-shrink-0"
                        >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                        </button>

                        <SkipForward size={18} onClick={playNext} className="text-zinc-400 hover:text-white cursor-pointer transition-colors fill-current" />

                        <SimpleTooltip text={isRepeat ? "Repeat On" : "Repeat Off"}>
                            <Repeat
                                size={15}
                                onClick={() => setRepeat(!isRepeat)}
                                className={`cursor-pointer transition-all ${isRepeat ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'text-zinc-600 hover:text-white'}`}
                            />
                        </SimpleTooltip>
                    </div>
                    <div className="flex items-center gap-3 text-[8px] font-black text-zinc-700 tracking-widest uppercase italic">
                        <span>{formatTime(currentTime)}</span>
                        <div className="w-36 h-0.5 bg-white/5 rounded-full overflow-hidden relative group/progress cursor-pointer" onClick={handleProgressClick}>
                            <div
                                className="h-full bg-white/30 group-hover/progress:bg-indigo-500 transition-colors"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* RIGHT CLUSTER: Tuning + Extra Options */}
                <div className="absolute left-[calc(50%+220px)] flex items-center gap-6 z-10">
                    <div className="flex items-center bg-black/60 rounded-full p-0.5 border border-white/5 shadow-inner scale-90">
                        <SimpleTooltip text="Auto-Pilot">
                            <button
                                onClick={() => setAutoTuning(!isAutoTuning)}
                                className={`text-[8px] font-black px-2.5 py-1 rounded-full transition-all ${isAutoTuning ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'} ${role !== 'admin' && tier !== 'business' && tier !== 'enterprise' ? 'opacity-20 cursor-not-allowed' : ''}`}
                            >
                                AUTO
                            </button>
                        </SimpleTooltip>
                        {(['440hz', '432hz', '528hz'] as const).map((t) => (
                            <SimpleTooltip key={t} text={`Shift to ${t}`}>
                                <button
                                    onClick={() => setTuning(t)}
                                    className={`text-[8px] font-black px-2.5 py-1.5 rounded-full transition-all ${tuning === t ? 'bg-violet-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'} ${role !== 'admin' && tier === 'free' && t !== '440hz' ? 'opacity-20 cursor-not-allowed' : ''}`}
                                >
                                    {t.toUpperCase()}
                                </button>
                            </SimpleTooltip>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 text-zinc-500">
                        <SimpleTooltip text="Toggle Lyrics">
                            <button onClick={() => setShowLyrics(!showLyrics)} className={`p-1.5 transition-colors ${showLyrics ? 'text-indigo-400' : 'hover:text-white'}`}>
                                <Mic2 size={16} />
                            </button>
                        </SimpleTooltip>

                        <SimpleTooltip text="Queue">
                            <ListMusic size={16} className="hover:text-white cursor-pointer transition-colors" />
                        </SimpleTooltip>

                        <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5 scale-90">
                            <button onClick={() => setMuted(!isMuted)} className="text-zinc-500 hover:text-white transition-colors">
                                {isMuted || volume === 0 ? <VolumeX size={14} className="text-rose-500" /> : <Volume2 size={14} />}
                            </button>
                            <input
                                type="range" min="0" max="100"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => setVolume(parseInt(e.target.value))}
                                className="w-16 h-0.5 accent-indigo-500 cursor-pointer"
                            />
                        </div>

                        <button onClick={() => setShowSettings(!showSettings)} className={`p-1 transition-colors ${showSettings ? 'text-indigo-400' : 'hover:text-white'}`}>
                            <Settings2 size={16} />
                        </button>
                    </div>
                </div>

                {/* FINAL CLOSE ACTION */}
                <div className="absolute right-12">
                    <button onClick={stop} className="p-2 bg-white/5 hover:bg-rose-500/20 rounded-full text-zinc-500 hover:text-rose-500 transition-all border border-white/5">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Settings Popover */}
            {showSettings && (
                <div className="absolute bottom-28 right-12 w-64 bg-[#18181b] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-300 z-[200]">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Audio Engine Config</h5>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-300 uppercase italic">High Fidelity (WAV)</span>
                            <div className="h-5 w-10 bg-indigo-600 rounded-full p-1 flex justify-end shadow-lg"><div className="h-3 w-3 bg-white rounded-full" /></div>
                        </div>
                        <div className="flex justify-between items-center opacity-40">
                            <span className="text-xs font-bold text-zinc-300 uppercase italic">Crossfade (3.5s)</span>
                            <div className="h-5 w-10 bg-zinc-800 rounded-full p-1 flex justify-start"><div className="h-3 w-3 bg-zinc-600 rounded-full" /></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
