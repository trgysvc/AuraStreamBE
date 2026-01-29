'use client';

import { usePlayer } from '@/context/PlayerContext';
import { StoreTrack } from '@/app/actions/store';

interface TrackCardProps {
    track: StoreTrack;
}

export function TrackCard({ track }: TrackCardProps) {
    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

    const isCurrentTrack = currentTrack?.id === track.id;
    const isTrackPlaying = isCurrentTrack && isPlaying;

    const handlePlayClick = () => {
        if (isCurrentTrack) {
            togglePlay();
        } else {
            playTrack({
                id: track.id,
                title: track.title,
                artist: track.artist,
                src: track.src
            });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow group">
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative group-hover:bg-gray-300 dark:group-hover:bg-gray-700 transition-colors">
                {/* Placeholder for Cover Art */}
                {track.coverImage ? (
                    <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-50">
                        🎵
                    </div>
                )}

                {/* Play Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity bg-black/40 ${isTrackPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                        onClick={handlePlayClick}
                        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg transform scale-90 hover:scale-105 transition-transform"
                    >
                        {isTrackPlaying ? '⏸' : '▶'}
                    </button>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    {formatDuration(track.duration || 0)}
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate" title={track.title}>{track.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{track.artist}</p>

                <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{track.genre || 'Unknown'}</span>
                    <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${track.bpm > 120 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        {track.bpm} BPM
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}
