'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface Track {
    id: string;
    title: string;
    artist: string;
    src?: string; // URL to play
}

interface PlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    playTrack: (track: Track) => void;
    togglePlay: () => void;
    stop: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio object once
    useEffect(() => {
        audioRef.current = new Audio();

        // Cleanup
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const playTrack = (track: Track) => {
        if (!track.src) {
            console.error('Player Error: Track has no source URL', track);
            return;
        }

        if (audioRef.current) {
            if (currentTrack?.id === track.id) {
                // Toggle if same track
                togglePlay();
            } else {
                try {
                    audioRef.current.src = track.src;
                    audioRef.current.load(); // Explicitly load the new source

                    const playPromise = audioRef.current.play();

                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                setIsPlaying(true);
                                setCurrentTrack(track);
                            })
                            .catch(e => {
                                console.error("Play execution error:", e);
                                // If auto-play fails, we might still want to show the player bar in paused state
                                setCurrentTrack(track);
                                setIsPlaying(false);
                            });
                    }
                } catch (e) {
                    console.error("Player setup error:", e);
                }
            }
        }
    };

    const togglePlay = () => {
        if (audioRef.current && currentTrack) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(e => console.error("Play error:", e));
                setIsPlaying(true);
            }
        }
    };

    const stop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    return (
        <PlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, togglePlay, stop }}>
            {children}
            {/* GLOBAL PLAYER BAR COMPONENT WILL BE RENDERED HERE OR IN LAYOUT */}
            {currentTrack && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 p-4 shadow-lg z-50">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">🎵</div>
                            <div>
                                <h4 className="font-bold text-sm">{currentTrack.title}</h4>
                                <p className="text-xs text-gray-500">{currentTrack.artist}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                                {isPlaying ? '⏸' : '▶'}
                            </button>
                        </div>

                        <div className="hidden md:block text-xs text-gray-500">
                            Player Active
                        </div>
                    </div>
                </div>
            )}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
