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
    duration: number;
    currentTime: number;
    analyser: AnalyserNode | null;
    playTrack: (track: Track) => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    stop: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Audio Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    // Initialize audio object once
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous"; // Essential for Visualizer with S3

        // Event Listeners
        const onTimeUpdate = () => {
            if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
            }
        };

        const onLoadedMetadata = () => {
            if (audioRef.current) {
                setDuration(audioRef.current.duration);
            }
        };

        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audioRef.current.addEventListener('timeupdate', onTimeUpdate);
        audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
        audioRef.current.addEventListener('ended', onEnded);

        // Web Audio API Setup
        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            if (AudioContextClass) {
                const ctx = new AudioContextClass();
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256; // Good balance for visualizer

                const source = ctx.createMediaElementSource(audioRef.current);
                source.connect(analyser);
                analyser.connect(ctx.destination);

                audioContextRef.current = ctx;
                analyserRef.current = analyser;
                sourceRef.current = source;
            }
        } catch (e) {
            console.error("Web Audio API setup failed (possibly due to CORS or browser policy):", e);
        }

        // Cleanup
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('timeupdate', onTimeUpdate);
                audioRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
                audioRef.current.removeEventListener('ended', onEnded);
                audioRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const playTrack = async (track: Track) => {
        if (!track.src) {
            console.error('Player Error: Track has no source URL', track);
            return;
        }

        if (audioRef.current) {
            // Resume AudioContext if suspended (browser policy)
            if (audioContextRef.current?.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            if (currentTrack?.id === track.id) {
                // Toggle if same track
                togglePlay();
            } else {
                try {
                    audioRef.current.src = track.src;
                    audioRef.current.load();

                    const playPromise = audioRef.current.play();

                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                setIsPlaying(true);
                                setCurrentTrack(track);
                            })
                            .catch(e => {
                                console.error("Play execution error:", e);
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

    const togglePlay = async () => {
        if (audioRef.current && currentTrack) {
            // Resume AudioContext if needed
            if (audioContextRef.current?.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(e => console.error("Play error:", e));
                setIsPlaying(true);
            }
        }
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
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
        <PlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            duration,
            currentTime,
            analyser: analyserRef.current,
            playTrack,
            togglePlay,
            seek,
            stop
        }}>
            {children}
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
