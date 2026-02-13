'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { EnergyCurve } from '@/lib/logic/EnergyCurve';
import { OfflineManager } from '@/lib/logic/OfflineManager';
import { createClient } from '@/lib/db/client';

interface Track {
    id: string;
    title: string;
    artist: string;
    src?: string;
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
    playTrack: (track: Track) => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setTuning: (tuning: '440hz' | '432hz' | '528hz') => void;
    setAutoTuning: (enabled: boolean) => void;
    stop: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [tuning, setCurrentTuning] = useState<'440hz' | '432hz' | '528hz'>('440hz');
    const [isAutoTuning, setIsAutoTuning] = useState(false);
    const [tier, setTier] = useState<Tier>('free');
    const [role, setRole] = useState<string | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    // Fetch User Tier & Role on Mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('subscription_tier, role')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        setTier(profile.subscription_tier as Tier);
                        setRole(profile.role);
                    }
                }
            } catch {
                // Silent fail for unauthenticated users
            }
        };
        fetchUserData();
    }, []);

    // Initial Tuning logic
    useEffect(() => {
        if (isAutoTuning && (tier === 'business' || tier === 'enterprise' || role === 'admin')) {
            setCurrentTuning(EnergyCurve.getCurrentTuning());
        }
    }, [isAutoTuning, tier, role]);

    useEffect(() => {
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audioRef.current = audio;

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoadedMetadata = () => setDuration(audio.duration);
        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('ended', onEnded);

        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                const ctx = new AudioCtx();
                const node = ctx.createAnalyser();
                node.fftSize = 256;
                const source = ctx.createMediaElementSource(audio);
                source.connect(node);
                node.connect(ctx.destination);
                audioContextRef.current = ctx;
                sourceRef.current = source;
                setAnalyser(node);
            }
        } catch {
            console.error("Web Audio API setup failed");
        }

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('ended', onEnded);
            if (audioContextRef.current) audioContextRef.current.close();
            audioRef.current = null;
        };
    }, []);

    const setAutoTuning = (enabled: boolean) => {
        if (role !== 'admin' && tier !== 'business' && tier !== 'enterprise') {
            alert('Auto-Tuning (Energy Curve) is only available for Business and Enterprise tiers.');
            return;
        }
        setIsAutoTuning(enabled);
    };

    const setTuning = (newTuning: '440hz' | '432hz' | '528hz') => {
        if (role !== 'admin' && tier === 'free' && newTuning !== '440hz') {
            alert('Tuning features are only available for Pro tiers and above.');
            return;
        }
        setIsAutoTuning(false);
        applyTuning(newTuning);
    };

    const applyTuning = async (newTuning: '440hz' | '432hz' | '528hz') => {
        if (newTuning === tuning) return;
        setCurrentTuning(newTuning);

        if (currentTrack && audioRef.current) {
            const nextSrc = currentTrack.availableTunings?.[newTuning];

            // 1. If we have a dedicated high-fidelity pre-rendered file, use it
            if (nextSrc && nextSrc !== audioRef.current.src) {
                const savedTime = audioRef.current.currentTime;
                const wasPlaying = isPlaying;
                audioRef.current.src = nextSrc;
                audioRef.current.playbackRate = 1.0; // Reset rate for dedicated file
                audioRef.current.load();
                audioRef.current.currentTime = savedTime;
                if (wasPlaying) audioRef.current.play().catch(() => { });
                console.log(`Frequency Shift: Switched to pre-rendered ${newTuning} file.`);
            } 
            // 2. Real-time DSP Fallback (Frequency Engineering)
            // If the file is missing, we use the original and apply a pitch shift via playbackRate
            else {
                console.log(`Frequency Shift: Pre-rendered ${newTuning} missing. Applying Real-time DSP.`);
                
                if (newTuning === '432hz') {
                    // 432Hz is approx 1.8% lower than 440Hz
                    audioRef.current.playbackRate = 0.9818;
                } else if (newTuning === '528hz') {
                    // 528Hz is significantly higher (Awakening)
                    audioRef.current.playbackRate = 1.2;
                } else {
                    audioRef.current.playbackRate = 1.0;
                }
            }
        }
    };

    const playTrack = async (track: Track) => {
        console.log('--- Aura Smart Player: Initializing Session ---');
        const targetTuning = isAutoTuning ? EnergyCurve.getCurrentTuning() : tuning;
        
        // 1. Determine Play URL
        // Priority: Cached locally -> Pre-rendered on S3 -> On-demand Trigger
        let playUrl = track.availableTunings?.[targetTuning] || (targetTuning === '440hz' ? track.src : null);

        if (role === 'admin' || tier === 'business' || tier === 'enterprise') {
            const cachedLocal = await OfflineManager.getCachedTrack(`${track.id}-${targetTuning}`);
            if (cachedLocal) playUrl = cachedLocal;
        }

        // 2. JIT (Just-In-Time) Rendering Logic
        if (!playUrl && targetTuning !== '440hz') {
            console.log(`JIT: ${targetTuning} file missing for ${track.title}. Triggering Aura Cloud Renderer...`);
            // Here we would call a server action to trigger Lambda processing
            // For MVP/Demo: Fallback to real-time DSP if cloud is processing
            playUrl = track.src; 
        }

        if (!playUrl) playUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

        if (audioRef.current) {
            if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume();

            if (currentTrack?.id === track.id) {
                togglePlay();
            } else {
                audioRef.current.src = playUrl;
                
                // Real-time DSP Application (if using original 440Hz file for other Hz)
                const isOriginalFile = playUrl === track.src;
                if (isOriginalFile && targetTuning !== '440hz') {
                    console.log("Applying Real-time DSP (BPM preserved logic pending)...");
                    if (targetTuning === '432hz') audioRef.current.playbackRate = 0.9818;
                    else if (targetTuning === '528hz') audioRef.current.playbackRate = 1.2;
                } else {
                    audioRef.current.playbackRate = 1.0;
                }

                audioRef.current.load();
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                    setCurrentTrack(track);

                    if (role === 'admin' || tier === 'business' || tier === 'enterprise') {
                        OfflineManager.cacheTrack(`${track.id}-${targetTuning}`, playUrl!).catch(() => { });
                    }
                }).catch(() => {
                    setCurrentTrack(track);
                    setIsPlaying(false);
                });
            }
        }
    };

    const togglePlay = async () => {
        if (audioRef.current && currentTrack) {
            if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume();
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(() => { });
                setIsPlaying(true);
            }
        }
    };

    const seek = (time: number) => {
        if (audioRef.current) audioRef.current.currentTime = time;
    };

    const stop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setCurrentTrack(null);
        }
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack, isPlaying, duration, currentTime, tuning, isAutoTuning, tier, role,
            analyser, playTrack, togglePlay, seek, setTuning,
            setAutoTuning, stop
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) throw new Error('usePlayer must be used within a PlayerProvider');
    return context;
};
