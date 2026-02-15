'use client';

import { Play, Download, Plus, Heart, MoreHorizontal, Wand2 } from 'lucide-react';
import { Waveform } from '@/components/shared/Waveform';
import { usePlayer } from '@/context/PlayerContext';

interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string;
    bpm: number;
    tags: string[];
    image?: string;
    lyrics?: string;
    audioSrc?: string;
}

interface TrackProps extends Track {
    onSimilar?: (id: string) => void;
    metadata?: {
        waveform?: number[];
    };
    allTracks?: Track[]; // Optional list context
}

export default function TrackRow({ id, title, artist, duration, bpm, tags, image, lyrics, audioSrc, onSimilar, metadata, allTracks }: TrackProps) {
    const { playTrack, currentTrack, isPlaying: globalIsPlaying, currentTime, duration: totalDuration } = usePlayer();
    const isCurrentTrack = currentTrack?.id === id;
    const isPlaying = isCurrentTrack && globalIsPlaying;

    // Calculate progress for this track if it's playing
    const progress = isCurrentTrack && totalDuration > 0 ? currentTime / totalDuration : 0;

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        playTrack({ id, title, artist, duration, bpm, tags, lyrics, src: audioSrc || image }, allTracks);
    };

    return (
        <div
            onClick={handlePlay}
            className={`group flex items-center gap-3 md:gap-6 py-3 md:py-4 px-3 md:px-4 hover:bg-white/[0.04] transition-all cursor-pointer border-b border-white/[0.02] ${isCurrentTrack ? 'bg-white/[0.02]' : ''}`}
        >
            {/* Play Button & Cover Art */}
            <div className="relative h-12 w-12 md:h-14 md:w-14 flex-shrink-0">
                {image ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center rounded-lg shadow-lg"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg shadow-lg border border-white/5" />
                )}

                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity rounded-lg ${isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                        onClick={handlePlay}
                        className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-white text-black shadow-2xl transform active:scale-90 transition-transform"
                    >
                        {isPlaying ? (
                            <div className="flex gap-0.5 items-center">
                                <div className="w-1 h-3 md:w-1.5 md:h-4 bg-black animate-pulse" />
                                <div className="w-1 h-3 md:w-1.5 md:h-4 bg-black animate-pulse delay-75" />
                            </div>
                        ) : (
                            <Play size={14} fill="currentColor" className="md:ml-0.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 md:w-44 md:flex-initial min-w-0">
                <h4 className="text-white font-bold truncate text-sm md:text-[15px] leading-tight group-hover:text-pink-500 transition-colors uppercase italic">{title}</h4>
                <p className="text-zinc-500 text-[10px] md:text-xs truncate mt-0.5 md:mt-1 font-medium">{artist}</p>
            </div>

            {/* Waveform Visualization (Hidden on Mobile) */}
            <div className="hidden md:block flex-1 px-4 min-w-[200px]">
                <Waveform
                    seed={id}
                    progress={progress}
                    bpm={bpm}
                    isPlaying={isPlaying}
                    data={metadata?.waveform}
                    height={36}
                    inactiveColor="rgba(255,255,255,0.1)"
                    activeColor={isCurrentTrack ? "#7C3AED" : "#FFFFFF"}
                />
            </div>

            {/* Meta Info: Time & BPM */}
            <div className="w-16 md:w-20 flex-shrink-0 text-right">
                <div className="text-[11px] md:text-[13px] font-black text-zinc-200">{duration}</div>
                <div className="text-[8px] md:text-[10px] font-black text-zinc-600 mt-0.5 md:mt-1 uppercase tracking-widest">{bpm} BPM</div>
            </div>

            {/* Tags / Category (Hidden on Mobile) */}
            <div className="hidden lg:block w-48 flex-shrink-0 px-4">
                <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-black text-zinc-400 uppercase tracking-tighter border border-white/5">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Actions (Far Right - Simplified on Mobile) */}
            <div className="flex items-center gap-1 md:gap-4 pr-1 md:pr-2 opacity-40 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onSimilar?.(id); }}
                    className="hidden md:block p-2 text-zinc-400 hover:text-pink-500 transition-colors"
                    title="Find similar tracks"
                >
                    <Wand2 size={18} />
                </button>
                <button className="hidden sm:block p-2 text-zinc-400 hover:text-white transition-colors">
                    <Heart size={18} />
                </button>
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <MoreHorizontal size={18} />
                </button>
            </div>
        </div>
    );
}
