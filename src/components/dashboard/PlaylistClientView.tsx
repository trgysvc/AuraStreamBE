'use client';

import React, { useEffect } from 'react';
import { Clock, Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import TrackRow from '@/components/dashboard/TrackRow';
import { usePlayer } from '@/context/PlayerContext';

interface PlaylistClientViewProps {
    playlistId: string;
    items: any[];
}

export default function PlaylistClientView({ playlistId, items }: PlaylistClientViewProps) {
    const { playTrack, setTrackList } = usePlayer();

    // The tracks that can be played
    const playableTracks = items.map(item => ({
        id: item.track?.id,
        title: item.track?.title,
        artist: item.track?.artist,
        duration: item.track?.duration_sec ? `${Math.floor(item.track.duration_sec / 60)}:${(item.track.duration_sec % 60).toString().padStart(2, '0')}` : "0:00",
        rawDurationMs: (item.track?.duration_sec || 0) * 1000,
        bpm: item.track?.bpm || 120,
        tags: item.track?.tags?.length ? item.track.tags : [item.track?.genre || "Music", "General"],
        image: item.track?.cover_image_url,
        lyrics: item.track?.lyrics,
        audioSrc: item.track?.src,
        src: item.track?.src,
        metadata: item.track?.metadata
    })).filter(t => t.id && t.audioSrc);

    // Sync playlist tracks into the player queue context when mounted or updated
    useEffect(() => {
        if (playableTracks.length > 0) {
            setTrackList(playableTracks);
        }
    }, [items, setTrackList]);

    return (
        <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-8 py-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-[#1A1A1A]">
                <div className="w-8 text-center">#</div>
                <div>Title</div>
                <div className="text-right px-4 w-24"><Clock size={14} className="ml-auto" /></div>
                <div className="w-24"></div>
            </div>

            {items.length === 0 ? (
                <div className="p-16 text-center space-y-4">
                    <p className="text-zinc-500 font-medium">This playlist is empty.</p>
                    <Link href={`/dashboard/playlists/${playlistId}/edit`} className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-full transition-all font-bold uppercase text-[10px] tracking-widest">
                        <Plus size={14} /> Add Tracks from Library
                    </Link>
                </div>
            ) : (
                <div className="divide-y divide-white/5 bg-[#111]">
                    {items.map((item: any, index: number) => {
                        const trackInfo = item.track;
                        if (!trackInfo) return null;

                        const durationStr = trackInfo.duration_sec
                            ? `${Math.floor(trackInfo.duration_sec / 60)}:${(trackInfo.duration_sec % 60).toString().padStart(2, '0')}`
                            : "0:00";

                        return (
                            <TrackRow
                                key={item.id}
                                id={trackInfo.id}
                                title={trackInfo.title || 'Unknown Title'}
                                artist={trackInfo.artist || 'Unknown Artist'}
                                duration={durationStr}
                                bpm={trackInfo.bpm || 120}
                                tags={[]}
                                image={trackInfo.cover_image_url}
                                audioSrc={trackInfo.src}
                                allTracks={playableTracks}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
