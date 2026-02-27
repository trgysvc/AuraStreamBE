'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

interface DashboardPlayableTrackProps {
    track: {
        id: string;
        title: string;
        artist: string;
        cover_image_url: string;
        src?: string; // S3 URL if available
        duration_sec?: number;
        bpm?: number;
        metadata?: any;
    };
    allTracks?: any[];
}

export function DashboardPlayableTrack({ track, allTracks }: DashboardPlayableTrackProps) {
    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

    const isCurrentTrack = currentTrack?.id === track.id;
    const isTrackPlaying = isCurrentTrack && isPlaying;

    const handlePlayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCurrentTrack) {
            togglePlay();
        } else {
            playTrack({
                id: track.id,
                title: track.title,
                artist: track.artist,
                src: track.src || track.cover_image_url, // fallback if src missing, though likely won't play
                duration: track.duration_sec ? `${Math.floor(track.duration_sec / 60)}:${(track.duration_sec % 60).toString().padStart(2, '0')}` : '0:00',
                bpm: track.bpm || 120,
                acoustic_matrix_url: track.metadata?.acoustic_matrix_url,
                metadata: track.metadata
            }, allTracks);
        }
    };

    return (
        <div onClick={handlePlayClick} className="space-y-3 md:space-y-4 group cursor-pointer block">
            <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-800">
                {track.cover_image_url ? (
                    <Image
                        src={track.cover_image_url}
                        alt={track.title || "Track Cover"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl md:text-2xl">🎵</div>
                )}

                {/* Always show overlay when playing, or on hover */}
                <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${isTrackPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {isTrackPlaying ? (
                        <div className="flex gap-1 items-center bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/20">
                            <div className="w-1.5 h-4 bg-white animate-pulse" />
                            <div className="w-1.5 h-4 bg-white animate-pulse delay-75" />
                        </div>
                    ) : (
                        <Play size={24} className="text-white fill-current md:w-8 md:h-8 drop-shadow-xl transform group-hover:scale-110 transition-transform" />
                    )}
                </div>
            </div>
            <div className="space-y-0.5 px-0.5 md:px-1">
                <p className={`text-[10px] md:text-[11px] font-black truncate uppercase italic transition-colors ${isTrackPlaying ? 'text-indigo-400' : 'text-white group-hover:text-indigo-400'}`}>
                    {track.title}
                </p>
                <p className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase truncate">
                    {track.artist}
                </p>
            </div>
        </div>
    );
}
