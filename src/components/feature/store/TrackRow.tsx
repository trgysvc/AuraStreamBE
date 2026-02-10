'use client';

import React, { useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { StoreTrack } from '@/app/actions/store';
import { LicenseWizard } from '@/components/feature/licensing/LicenseWizard';
import { Play, Pause, Heart, Plus, Download, MoreHorizontal, Waves } from 'lucide-react';

interface TrackRowProps {
    track: StoreTrack;
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
            <div className="epidemic-row group flex items-center h-[64px] px-4 gap-4 select-none">
                {/* 1. Play Button */}
                <button 
                    onClick={handlePlay}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                    {isPlayingCurrent ? (
                        <Pause size={20} fill="white" className="text-white" />
                    ) : (
                        <Play size={20} fill="white" className="text-white ml-0.5" />
                    )}
                </button>

                {/* 2. Track Metadata */}
                <div className="flex-1 min-w-0 pr-4">
                    <h4 className={`text-sm font-medium truncate ${isCurrent ? 'text-violet-400' : 'text-white'}`}>
                        {track.title}
                    </h4>
                    <p className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer truncate">
                        {track.artist}
                    </p>
                </div>

                {/* 3. Waveform (Compact) */}
                <div className="hidden lg:flex w-24 items-center gap-0.5 opacity-20">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-0.5 bg-white rounded-full ${isCurrent ? 'bg-violet-500 opacity-100' : ''}`}
                            style={{ height: `${20 + Math.random() * 60}%` }}
                        />
                    ))}
                </div>

                {/* 4. Duration & BPM */}
                <div className="hidden md:flex items-center gap-6 text-[13px] text-zinc-400 w-32">
                    <span className="w-10">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                    <span className="w-16 whitespace-nowrap">{track.bpm} BPM</span>
                </div>

                {/* 5. Genres & Moods */}
                <div className="hidden xl:flex flex-1 items-center gap-2 overflow-hidden">
                    <span className="text-[13px] text-zinc-500 hover:text-zinc-300 cursor-pointer whitespace-nowrap">
                        {track.genre || 'Cinematic'}
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-[13px] text-zinc-500 hover:text-zinc-300 cursor-pointer whitespace-nowrap">
                        Epic, Hybrid
                    </span>
                </div>

                {/* 6. Action Icons */}
                <div className="flex items-center gap-1">
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <Waves size={18} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <Heart size={18} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <Plus size={18} />
                    </button>
                    <button 
                        onClick={() => setShowLicense(true)}
                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        <Download size={18} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
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
