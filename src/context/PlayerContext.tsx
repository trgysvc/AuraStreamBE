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
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    // Fetch User Tier on Mount
    useEffect(() => {
        const fetchTier = async () => {
            try {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', session.user.id).single();
                    if (profile) setTier(profile.subscription_tier as Tier);
                }
            } catch {
                // Silent fail for unauthenticated users
            }
        };
        fetchTier();
    }, []);

    // Initial Tuning logic
    useEffect(() => {
        if (isAutoTuning && (tier === 'business' || tier === 'enterprise')) {
            setCurrentTuning(EnergyCurve.getCurrentTuning());
        }
    }, [isAutoTuning, tier]);

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
        if (tier !== 'business' && tier !== 'enterprise') {
            alert('Auto-Tuning (Energy Curve) is only available for Business and Enterprise tiers.');
            return;
        }
        setIsAutoTuning(enabled);
    };

    const setTuning = (newTuning: '440hz' | '432hz' | '528hz') => {
        if (tier === 'free' && newTuning !== '440hz') {
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
            let nextSrc = currentTrack.availableTunings?.[newTuning] || currentTrack.src;

            if (tier === 'business' || tier === 'enterprise') {
                const cachedUrl = await OfflineManager.getCachedTrack(`${currentTrack.id}-${newTuning}`);
                if (cachedUrl) nextSrc = cachedUrl;
            }

            if (nextSrc && nextSrc !== audioRef.current.src) {
                const savedTime = audioRef.current.currentTime;
                const wasPlaying = isPlaying;
                audioRef.current.src = nextSrc;
                audioRef.current.load();
                audioRef.current.currentTime = savedTime;
                if (wasPlaying) audioRef.current.play().catch(() => { });
            }
        }
    };

    const playTrack = async (track: Track) => {
        console.log('PlayerContext playTrack:', track);
        const targetTuning = isAutoTuning ? EnergyCurve.getCurrentTuning() : tuning;
        let playUrl = track.availableTunings?.[targetTuning] || track.src;

        if (!playUrl) {
            console.warn('No playUrl found for track, using fallback silence');
            playUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // TEMP FALLBACK FOR TESTING
        }

        if (tier === 'business' || tier === 'enterprise') {
            const cachedUrl = await OfflineManager.getCachedTrack(`${track.id}-${targetTuning}`);
            if (cachedUrl) playUrl = cachedUrl;
        }

        if (!playUrl) return;

        if (audioRef.current) {
            if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume();

            if (currentTrack?.id === track.id) {
                togglePlay();
            } else {
                audioRef.current.src = playUrl;
                audioRef.current.load();
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                    setCurrentTrack(track);

                    if (tier === 'business' || tier === 'enterprise') {
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
            currentTrack, isPlaying, duration, currentTime, tuning, isAutoTuning, tier,
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
