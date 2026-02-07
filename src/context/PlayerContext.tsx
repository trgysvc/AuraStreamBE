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
            {/* Player is now handled by GlobalPlayer component in layout */}
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
