'use client';

import { useState, useEffect } from 'react';
import { Play, Download, Plus, Heart, MoreHorizontal, Wand2, ListPlus } from 'lucide-react';
import { WaveformSeekbar } from '@/components/shared/WaveformSeekbar';
import { usePlayer } from '@/context/PlayerContext';
import { toggleLikeTrack_Action, isTrackLiked_Action } from '@/app/actions/music';
import AddToPlaylistPopover from './AddToPlaylistPopover';
import { createClient } from '@/lib/db/client';

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
    acoustic_matrix_url?: string;
}

interface TrackProps extends Track {
    onSimilar?: (id: string) => void;
    metadata?: {
        waveform?: number[];
        acoustic_matrix_url?: string;
    };
    allTracks?: Track[]; // Optional list context
}

export default function TrackRow({ id, title, artist, duration, bpm, tags, image, lyrics, audioSrc, onSimilar, metadata, allTracks, acoustic_matrix_url }: TrackProps) {
    const { playTrack, currentTrack, isPlaying: globalIsPlaying, currentTime, duration: totalDuration } = usePlayer();

    // Multi-tenant state
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [showPlaylistPopover, setShowPlaylistPopover] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [tenantId, setTenantId] = useState<string | null>(null);

    const isCurrentTrack = currentTrack?.id === id;
    const isPlaying = isCurrentTrack && globalIsPlaying;

    // Helper: Convert "3:45" to seconds (225)
    const getDurationInSeconds = (durationStr: string | number) => {
        if (typeof durationStr === 'number') return durationStr;
        if (!durationStr) return 0;
        const parts = durationStr.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
        return 0;
    };

    const trackDurationSeconds = getDurationInSeconds(duration);

    // Provide the correct currentTime state
    const currentTrackTime = isCurrentTrack ? currentTime : 0;

    // Simplified multi-tenant session hook
    useEffect(() => {
        const fetchSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
                // Also fetch tenant_id from profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tenant_id')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.tenant_id) {
                    setTenantId(profile.tenant_id);
                }
            }
        };
        fetchSession();
    }, []);

    useEffect(() => {
        if (userId) {
            isTrackLiked_Action(id, userId).then(setIsLiked);
        }
    }, [id, userId]);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userId) return;
        const result = await toggleLikeTrack_Action(id, userId, tenantId || undefined);
        setIsLiked(result.liked);
    };

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioSrc) {
            console.warn("No audio source available for this track.");
            // Optionally show a toast here if available
            return;
        }
        playTrack({ id, title, artist, duration, bpm, tags, lyrics, src: audioSrc }, allTracks);
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
                <div className="h-10 w-full relative">
                    <WaveformSeekbar
                        duration={trackDurationSeconds}
                        currentTime={currentTrackTime}
                        isPlaying={isPlaying}
                        peakData={metadata?.waveform}
                        acousticMatrixUrl={acoustic_matrix_url || metadata?.acoustic_matrix_url}
                        playedColor={isCurrentTrack ? "#FFFFFF" : "rgba(255,255,255,0.2)"}
                        unplayedColor={isCurrentTrack ? "#A855F7" : "rgba(255,255,255,0.2)"}
                        onSeek={(time) => {
                            if (isCurrentTrack) {
                                // If it is already the active track, simply seek.
                                const audioRef = document.getElementById('aura-internal-audio') as HTMLAudioElement;
                                if (audioRef) audioRef.currentTime = time;
                            } else {
                                // If it's a new track, start playing from this specific point.
                                if (!audioSrc) return;
                                playTrack(
                                    { id, title, artist, duration, bpm, tags, lyrics, src: audioSrc },
                                    allTracks,
                                    time
                                );
                            }
                        }}
                    />
                </div>
            </div>

            {/* Meta Info: Time & BPM */}
            <div className="w-16 md:w-20 flex-shrink-0 text-right">
                <div className="text-[11px] md:text-[13px] font-black text-zinc-200">{duration}</div>
                <div className="text-[8px] md:text-[10px] font-black text-zinc-600 mt-0.5 md:mt-1 uppercase tracking-widest">{bpm} BPM</div>
            </div>

            {/* Tags / Category (Hidden on Mobile) */}
            <div className="hidden lg:block w-48 flex-shrink-0 px-4">
                <div className="flex flex-wrap gap-1">
                    {tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-black text-zinc-400 uppercase tracking-tighter border border-white/5">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Actions (Far Right - Simplified on Mobile) */}
            <div className="flex items-center gap-1 md:gap-4 pr-1 md:pr-2 opacity-40 group-hover:opacity-100 transition-opacity relative">
                <button
                    onClick={(e) => { e.stopPropagation(); onSimilar?.(id); }}
                    className="hidden lg:flex items-center gap-2 py-1.5 px-3 rounded-full border border-white/5 bg-white/5 text-zinc-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all cursor-pointer shadow-lg"
                    title="Find similar tracks"
                >
                    <Wand2 size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Similar</span>
                </button>
                <button
                    onClick={handleLike}
                    className={`p-2 transition-all hover:scale-110 ${isLiked ? 'text-pink-500' : 'text-zinc-400 hover:text-white'}`}
                    title={isLiked ? "Unlike" : "Like"}
                >
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 2 : 2.5} />
                </button>

                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowPlaylistPopover(!showPlaylistPopover); }}
                        className={`p-2 transition-all hover:scale-110 ${showPlaylistPopover ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}`}
                        title="Add to Playlist"
                    >
                        <ListPlus size={18} />
                    </button>
                    {showPlaylistPopover && (
                        <AddToPlaylistPopover
                            trackId={id}
                            tenantId={tenantId}
                            onClose={() => setShowPlaylistPopover(false)}
                        />
                    )}
                </div>

                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <MoreHorizontal size={18} />
                </button>
            </div>
        </div>
    );
}
