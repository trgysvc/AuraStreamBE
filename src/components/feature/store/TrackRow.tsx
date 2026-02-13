'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { StoreTrack } from '@/app/actions/store';
import { LicenseWizard } from '@/components/feature/licensing/LicenseWizard';
import { Play, Pause, Heart, Plus, Download, MoreHorizontal, Waves } from 'lucide-react';

interface TrackRowProps {
    track: StoreTrack;
}

/**
 * Aura Mini Waveform Animator
 */
function MiniWaveform({ isActive, isPlaying }: { isActive: boolean, isPlaying: boolean }) {
    const bars = 12;
    return (
        <div className="flex items-center gap-[1.5px] h-4">
            {Array.from({ length: bars }).map((_, i) => (
                <div
                    key={i}
                    className={`w-[2px] rounded-full transition-all duration-300 ${isActive ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                    style={{
                        height: isActive && isPlaying 
                            ? `${30 + Math.random() * 70}%` 
                            : isActive ? '40%' : '20%',
                        animation: isActive && isPlaying 
                            ? `aura-wave-mini 0.6s ease-in-out infinite ${i * 0.05}s` 
                            : 'none'
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes aura-wave-mini {
                    0%, 100% { height: 30%; }
                    50% { height: 100%; }
                }
            `}</style>
        </div>
    );
}

export function TrackRow({ track }: TrackRowProps) {
    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
    const [showLicense, setShowLicense] = useState(false);

    const isCurrent = currentTrack?.id === track.id;
    const isPlayingCurrent = isCurrent && isPlaying;

    const handlePlay = () => {
        if (isCurrent) togglePlay();
        else playTrack(track);
    };

    return (
        <>
            <div className={`epidemic-row group flex items-center h-[64px] px-4 gap-4 select-none transition-colors ${isCurrent ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'}`}>
                {/* 1. Play Button / Index */}
                <div className="w-10 flex-shrink-0 flex items-center justify-center relative">
                    <button 
                        onClick={handlePlay}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${isCurrent ? 'bg-white text-black scale-100' : 'opacity-0 group-hover:opacity-100 bg-white/10 text-white scale-90 hover:scale-100'}`}
                    >
                        {isPlayingCurrent ? (
                            <Pause size={16} fill="currentColor" />
                        ) : (
                            <Play size={16} fill="currentColor" className="ml-0.5" />
                        )}
                    </button>
                    {!isCurrent && (
                        <span className="absolute text-[10px] font-bold text-zinc-600 group-hover:opacity-0 transition-opacity">
                            {/* In a real list we'd pass the index, using a placeholder icon or empty */}
                        </span>
                    )}
                </div>

                {/* 2. Track Metadata */}
                <div className="flex-1 min-w-0 pr-4">
                    <h4 className={`text-[13px] font-black uppercase italic tracking-tighter truncate leading-tight ${isCurrent ? 'text-indigo-400' : 'text-zinc-100'}`}>
                        {track.title}
                    </h4>
                    <p className="text-[9px] font-bold text-zinc-500 hover:text-zinc-300 cursor-pointer uppercase tracking-widest mt-0.5 truncate transition-colors">
                        {track.artist}
                    </p>
                </div>

                {/* 3. Aura Discovery Waveform (The "Time Wave" requested) */}
                <div className="hidden lg:flex w-32 items-center justify-center">
                    <MiniWaveform isActive={isCurrent} isPlaying={isPlayingCurrent} />
                </div>

                {/* 4. Duration & BPM */}
                <div className="hidden md:flex items-center gap-6 text-[10px] font-bold text-zinc-500 w-32 uppercase tracking-tighter">
                    <span className="w-10 tabular-nums">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                    <span className="w-16 whitespace-nowrap opacity-40">{track.bpm} BPM</span>
                </div>

                {/* 5. Genres & Tags (Premium Aesthetic) */}
                <div className="hidden xl:flex flex-1 items-center gap-3 overflow-hidden">
                    <span className="text-[10px] font-black text-zinc-600 hover:text-indigo-400 cursor-pointer whitespace-nowrap uppercase italic tracking-widest transition-colors">
                        {track.genre || 'Ambient'}
                    </span>
                    <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <span className="text-[10px] font-black text-zinc-600 hover:text-indigo-400 cursor-pointer whitespace-nowrap uppercase italic tracking-widest transition-colors">
                        {(track as any).vibe || 'Neutral'}
                    </span>
                </div>

                {/* 6. Action Icons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <Heart size={16} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <Plus size={16} />
                    </button>
                    <button 
                        onClick={() => setShowLicense(true)}
                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        <Download size={16} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {showLicense && (
                <LicenseWizard 
                    track={{ id: track.id, title: track.title, artist: track.artist, cover_image_url: track.coverImage }}
                    onClose={() => setShowLicense(false)}
                />
            )}
        </>
    );
}
