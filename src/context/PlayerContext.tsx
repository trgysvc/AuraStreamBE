'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { EnergyCurve } from '@/lib/logic/EnergyCurve';
import { OfflineManager } from '@/lib/logic/OfflineManager';
import { createClient } from '@/lib/db/client';
import { logPlaybackEvent_Action } from '@/app/actions/playback';
import { logUIInteraction_Action } from '@/app/actions/elite-analytics';

interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string;
    bpm: number;
    src?: string;
    lyrics?: string;
    lyrics_synced?: any;
    availableTunings?: Record<string, string>;
}

type Tier = 'free' | 'pro' | 'business' | 'enterprise';

interface PlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    duration: number;
    currentTime: number;
    tuning: '440hz' | '432hz' | '528hz';
    isAutoTuning: boolean;
    tier: Tier;
    role: string | null;
    analyser: AnalyserNode | null;
    isMuted: boolean;
    volume: number;
    isShuffle: boolean;
    isRepeat: boolean;
    playTrack: (track: Track, list?: Track[]) => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setTuning: (tuning: '440hz' | '432hz' | '528hz') => void;
    setAutoTuning: (enabled: boolean) => void;
    setMuted: (muted: boolean) => void;
    setVolume: (volume: number) => void;
    setShuffle: (enabled: boolean) => void;
    setRepeat: (enabled: boolean) => void;
    playNext: () => void;
    playPrevious: () => void;
    stop: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [trackList, setTrackList] = useState<Track[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [tuning, setCurrentTuning] = useState<'440hz' | '432hz' | '528hz'>('440hz');
    const [isAutoTuning, setIsAutoTuning] = useState(false);
    const [tier, setTier] = useState<Tier>('free');
    const [role, setRole] = useState<string | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

    // Player settings
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolumeState] = useState(80);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // 1. Initialize Audio Instance (Singleton)
    useEffect(() => {
        if (!audioRef.current) {
            const audio = new Audio();
            audio.crossOrigin = "anonymous";
            audio.preload = "auto";
            audioRef.current = audio;

            audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
            audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
            audio.addEventListener('ended', () => {
                handleTrackEnd();
            });
        }

        // Web Audio API for visualizer
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx && !audioContextRef.current) {
                const ctx = new AudioCtx();
                const node = ctx.createAnalyser();
                node.fftSize = 256;
                const source = ctx.createMediaElementSource(audioRef.current);
                source.connect(node);
                node.connect(ctx.destination);
                audioContextRef.current = ctx;
                setAnalyser(node);
            }
        } catch (e) {
            console.warn("Web Audio setup failed");
        }

        // --- Safari Unlocking Hack ---
        const unlock = () => {
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume().catch(() => {});
            }
            // Safari also needs a "dummy" play on a user gesture to unlock the element
            if (audioRef.current && audioRef.current.paused) {
                const p = audioRef.current.play();
                if (p !== undefined) {
                    p.then(() => {
                        audioRef.current?.pause();
                    }).catch(() => {});
                }
            }
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('touchstart', unlock);

        return () => {
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
        };
    }, []);

    // Fetch User Data & Heartbeat (Feature 4: Churn Prediction)
    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase.from('profiles').select('subscription_tier, role').eq('id', session.user.id).single();
                if (profile) {
                    setTier(profile.subscription_tier as Tier);
                    setRole(profile.role);
                }

                // Log Heartbeat for Churn Prediction
                await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', session.user.id);
            }
        };
        fetchUserData();
    }, []);

    const togglePlay = async () => {
        if (!audioRef.current || !currentTrack) return;

        if (audioContextRef.current?.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        if (audioRef.current.paused) {
            await audioRef.current.play();
            setIsPlaying(true);
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const playTrack = async (track: Track, list?: Track[]) => {
        if (!track || !audioRef.current) return;

        // Log telemetry for the PREVIOUS track before switching
        if (currentTrack && currentTrack.id !== track.id) {
            const durationPlayed = Math.floor(audioRef.current.currentTime);
            logPlaybackEvent_Action({
                trackId: currentTrack.id,
                durationListened: durationPlayed,
                skipped: durationPlayed < (audioRef.current.duration * 0.8), // Considered skipped if < 80%
                tuningUsed: tuning,
                venueId: '00000000-0000-0000-0000-000000000000' // Placeholder UUID for development
            });
        }

        if (list) setTrackList(list);

        // If clicking current track, toggle it
        if (currentTrack?.id === track.id) {
            togglePlay();
            return;
        }

        const targetTuning = isAutoTuning ? EnergyCurve.getCurrentTuning() : tuning;
        let playUrl = track.availableTunings?.[targetTuning] || track.src;


        if (!playUrl) {
            console.error("No valid source found for track:", track.title);
            return;
        }

        try {
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume().catch(() => {});
            }

            audioRef.current.src = playUrl;

            // Apply DSP (Simplified for reliability)
            if (!track.availableTunings?.[targetTuning]) {
                if (targetTuning === '432hz') audioRef.current.playbackRate = 0.9818;
                else if (targetTuning === '528hz') audioRef.current.playbackRate = 1.05; 
                else audioRef.current.playbackRate = 1.0;
            } else {
                audioRef.current.playbackRate = 1.0;
            }

            audioRef.current.load();
            const playPromise = audioRef.current.play();
            
            if (playPromise !== undefined) {
                await playPromise;
            }

            setIsPlaying(true);
            setCurrentTrack(track);

        } catch (e) {
            console.error("Play failed:", e);
            setIsPlaying(false);
        }
    };

    const playNext = useCallback(() => {
        if (trackList.length === 0 || !currentTrack) return;
        let index = trackList.findIndex(t => t.id === currentTrack.id);
        if (index === -1) index = 0;

        let nextIndex = index + 1;
        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * trackList.length);
        } else if (nextIndex >= trackList.length) {
            if (isRepeat) nextIndex = 0;
            else {
                setIsPlaying(false);
                return;
            }
        }
        playTrack(trackList[nextIndex]);
    }, [trackList, currentTrack, isShuffle, isRepeat]);

    const playPrevious = () => {
        if (trackList.length === 0 || !currentTrack) return;
        let index = trackList.findIndex(t => t.id === currentTrack.id);
        let prevIndex = index - 1;
        if (prevIndex < 0) prevIndex = trackList.length - 1;
        playTrack(trackList[prevIndex]);
    };

    const handleTrackEnd = () => {
        // This is called by the audio event listener
        // We use a separate trigger to avoid stale closures in the event listener
        const btn = document.getElementById('aura-play-next-trigger');
        if (btn) btn.click();
    };

    const setMuted = (muted: boolean) => {
        setIsMuted(muted);
        if (audioRef.current) audioRef.current.muted = muted;
    };

    const setVolume = (val: number) => {
        setVolumeState(val);
        if (audioRef.current) audioRef.current.volume = val / 100;
    };

    const applyTuning = async (newTuning: '440hz' | '432hz' | '528hz') => {
        if (!audioRef.current || !currentTrack) return;
        setCurrentTuning(newTuning);

        const nextSrc = currentTrack.availableTunings?.[newTuning];
        if (nextSrc && nextSrc !== audioRef.current.src) {
            const savedTime = audioRef.current.currentTime;
            audioRef.current.src = nextSrc;
            audioRef.current.playbackRate = 1.0;
            audioRef.current.load();
            audioRef.current.currentTime = savedTime;
            if (isPlaying) audioRef.current.play().catch(() => { });
        } else {
            if (newTuning === '432hz') audioRef.current.playbackRate = 0.9818;
            else if (newTuning === '528hz') audioRef.current.playbackRate = 1.05;
            else audioRef.current.playbackRate = 1.0;
        }
    };

    const setTuning = (newTuning: '440hz' | '432hz' | '528hz') => {
        if (role !== 'admin' && tier === 'free' && newTuning !== '440hz') {
            alert('Tuning features require Pro tier.');
            return;
        }

        // Feature 5: UI Evolution - Log manual tuning switch
        logUIInteraction_Action('tuning_selector', 'manual_switch', { tuning: newTuning });

        setIsAutoTuning(false);
        applyTuning(newTuning);
    };

    const setAutoTuning = (enabled: boolean) => {
        if (role !== 'admin' && tier !== 'business' && tier !== 'enterprise') {
            alert('Auto-Tuning requires Business tier.');
            return;
        }
        setIsAutoTuning(enabled);
    };

    const stop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            setIsPlaying(false);
            setCurrentTrack(null);
        }
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack, isPlaying, duration, currentTime, tuning, isAutoTuning, tier, role,
            analyser, isMuted, volume, isShuffle, isRepeat,
            playTrack, togglePlay, seek: (t) => { if (audioRef.current) audioRef.current.currentTime = t; },
            setTuning, setAutoTuning, setMuted, setVolume, setShuffle: setIsShuffle, setRepeat: setIsRepeat,
            playNext, playPrevious, stop
        }}>
            {children}
            {/* Hidden trigger for auto-play b/c of event listener closures */}
            <button id="aura-play-next-trigger" onClick={playNext} className="hidden" />
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) throw new Error('usePlayer must be used within a PlayerProvider');
    return context;
};
