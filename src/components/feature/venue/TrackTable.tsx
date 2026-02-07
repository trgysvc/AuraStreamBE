'use client';

import { useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { StoreTrack } from '@/app/actions/store';
import { LicenseWizard } from '@/components/feature/licensing/LicenseWizard';

interface TrackTableProps {
    tracks: StoreTrack[];
}

export function TrackTable({ tracks }: TrackTableProps) {
    const { playTrack, currentTrack, isPlaying } = usePlayer();
    const [licensingTrack, setLicensingTrack] = useState<StoreTrack | null>(null);

    return (
        <div className="w-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">All Tracks</h2>
                {/* ... existing header controls ... */}
            </div>

            {/* ... existing grid header ... */}

            <div className="space-y-2">
                {tracks.map((track) => {
                    const isCurrent = currentTrack?.id === track.id;

                    return (
                        <div
                            key={track.id}
                            // ... existing styles ...
                            onClick={() => playTrack(track)}
                            className={`
                                group grid grid-cols-12 gap-4 items-center p-3 rounded-lg cursor-pointer transition-colors
                                ${isCurrent ? 'bg-gray-800/80 border border-gray-700' : 'hover:bg-gray-800/50 border border-transparent'}
                            `}
                        >
                            {/* ... existing columns ... */}

                            {/* Track Info */}
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded overflow-hidden bg-gray-700 relative flex-shrink-0">
                                    {track.coverImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs">🎵</div>
                                    )}
                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <span className="text-white text-xs">{isCurrent && isPlaying ? '⏸' : '▶'}</span>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h4 className={`text-sm font-medium truncate ${isCurrent ? 'text-orange-500' : 'text-white'}`}>{track.title}</h4>
                                    <p className="text-xs text-gray-500 truncate">Annownious</p>
                                </div>
                            </div>

                            {/* Artist */}
                            <div className="col-span-2 text-sm text-gray-300 truncate">
                                {track.artist || 'AuraStream'}
                            </div>

                            {/* Tags */}
                            <div className="col-span-3 flex gap-2 overflow-hidden">
                                <span className="bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded text-xs whitespace-nowrap">{track.genre || 'Cinematic'}</span>
                            </div>

                            {/* Duration */}
                            <div className="col-span-1 text-sm text-gray-400">
                                {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '03:26'}
                            </div>

                            {/* Actions / Waveform */}
                            <div className="col-span-2 flex justify-end items-center gap-3">
                                {/* Buy Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent playing when clicking buy
                                        setLicensingTrack(track);
                                    }}
                                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    License
                                </button>

                                <button className="text-gray-400 hover:text-white">•••</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* License Wizard Modal */}
            {licensingTrack && (
                <LicenseWizard
                    track={licensingTrack}
                    onClose={() => setLicensingTrack(null)}
                />
            )}
        </div>
    );
}
