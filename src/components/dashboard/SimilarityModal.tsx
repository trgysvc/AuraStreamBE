import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Play, Wand2 } from 'lucide-react';
import { InteractiveWaveform } from '@/components/shared/InteractiveWaveform';
import { findSimilarSections, TrackData, SimilarityMatch } from '@/utils/similarityEngine';
import { usePlayer } from '@/context/PlayerContext';
import { useTranslations } from 'next-intl';

interface SimilarityModalProps {
    isOpen: boolean;
    onClose: () => void;
    referenceTrack: any;
    allTracks: any[];
}

export function SimilarityModal({ isOpen, onClose, referenceTrack, allTracks }: SimilarityModalProps) {
    const t = useTranslations('VenueDashboard');
    const { playTrack, setLoopRegion, currentTrack, isPlaying } = usePlayer();

    const [selectionStartMs, setSelectionStartMs] = useState(0);
    const [selectionEndMs, setSelectionEndMs] = useState(15000); // Default 15s window
    const [matches, setMatches] = useState<SimilarityMatch[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);

    // Precise string or number to MS parsing utility
    const getDurationMs = useCallback((durationVal: any) => {
        if (!durationVal) return 180000; // 3 min fallback
        if (typeof durationVal === 'number') {
            return durationVal > 10000 ? durationVal : durationVal * 1000;
        }
        if (typeof durationVal === 'string') {
            const parts = durationVal.split(':');
            if (parts.length === 2) {
                return (parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)) * 1000;
            }
        }
        return 180000;
    }, []);

    // Initial setup when modal opens
    useEffect(() => {
        if (isOpen && referenceTrack) {
            setSelectionStartMs(0);
            const refDurationMs = getDurationMs(referenceTrack.duration || referenceTrack.rawDurationMs);
            setSelectionEndMs(Math.min(15000, refDurationMs));

            // Lock body scroll
            document.body.style.overflow = 'hidden';
        } else {
            // When closing the modal, clear any active loops so normal playback resumes
            setLoopRegion(null);
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, referenceTrack, setLoopRegion, getDurationMs]);

    // Data preparation for the Engine
    const targetTracksData = useMemo<TrackData[]>(() => {
        return allTracks
            .filter(t => t.id !== referenceTrack?.id && t.metadata?.waveform?.length > 0)
            .map(t => ({
                id: t.id,
                name: t.title,
                peakData: t.metadata.waveform,
                durationMs: getDurationMs(t.duration || t.rawDurationMs)
            }));
    }, [allTracks, referenceTrack, getDurationMs]);

    const refDurationMs = useMemo(() => {
        if (!referenceTrack) return 1;
        return getDurationMs(referenceTrack.duration || referenceTrack.rawDurationMs);
    }, [referenceTrack, getDurationMs]);

    // Format utility
    const formatTime = (ms: number) => {
        if (isNaN(ms) || ms < 0) return "0:00";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // --- Debounced Similarity Engine Trigger ---
    useEffect(() => {
        if (!isOpen || !referenceTrack || !referenceTrack.metadata?.waveform) return;

        setIsCalculating(true);
        // Debounce calculation by 200ms
        const timer = setTimeout(() => {
            const safeRefLen = referenceTrack.metadata.waveform.length || 1000;
            const refStartIdx = Math.max(0, Math.floor((selectionStartMs / refDurationMs) * safeRefLen));
            const refEndIdx = Math.min(safeRefLen - 1, Math.floor((selectionEndMs / refDurationMs) * safeRefLen));

            const engineMatches = findSimilarSections(
                referenceTrack.metadata.waveform,
                refStartIdx,
                refEndIdx,
                targetTracksData,
                5 // Step size optimization!
            );
            // Take top 10 best matches
            setMatches(engineMatches.slice(0, 10));
            setIsCalculating(false);
        }, 200);

        return () => clearTimeout(timer);
    }, [isOpen, referenceTrack, selectionStartMs, selectionEndMs, targetTracksData, refDurationMs]);


    const handleSelectionChange = useCallback((start: number, end: number) => {
        setSelectionStartMs(start);
        setSelectionEndMs(end);
    }, []);

    const handleSelectionDragEnd = useCallback((start: number, end: number) => {
        if (referenceTrack) {
            if (currentTrack?.id === referenceTrack.id) {
                const audioRef = document.getElementById('aura-internal-audio') as HTMLAudioElement;
                if (audioRef) audioRef.currentTime = start / 1000;
            } else {
                playTrack(referenceTrack, allTracks, start / 1000);
            }
            setLoopRegion({ start: start / 1000, end: end / 1000 });
        }
    }, [referenceTrack, allTracks, playTrack, setLoopRegion, currentTrack]);

    const handleResultClick = (match: SimilarityMatch) => {
        const track = allTracks.find(t => t.id === match.trackId);
        if (!track) return;

        if (currentTrack?.id === track.id) {
            const audioRef = document.getElementById('aura-internal-audio') as HTMLAudioElement;
            if (audioRef) audioRef.currentTime = match.matchStartMs / 1000;
        } else {
            playTrack(track, allTracks, match.matchStartMs / 1000);
        }
        setLoopRegion({ start: match.matchStartMs / 1000, end: match.matchEndMs / 1000 });
    };

    if (!isOpen || !referenceTrack) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-start overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <div className="w-full max-w-[1200px] flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                        <Wand2 className="text-yellow-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-widest text-white">Smart Similarity</h2>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Audio Acoustics Matching Engine</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-3 hover:bg-white/10 rounded-full transition-colors text-white"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 w-full max-w-[1200px] p-6 flex flex-col gap-8 min-h-0">

                {/* 1. The Reference Track Panel */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl shrink-0 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wand2 size={120} />
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                        <img
                            src={referenceTrack.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200'}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover shadow-lg border border-white/10"
                        />
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-1">Reference Source</div>
                            <h3 className="text-xl font-black tracking-tight text-white uppercase italic">{referenceTrack.title}</h3>
                            <p className="text-xs text-zinc-400 font-medium">{referenceTrack.artist || 'AuraStream Studio'}</p>
                        </div>
                    </div>

                    <div className="relative z-10 w-full h-24 bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                        <InteractiveWaveform
                            duration={refDurationMs / 1000}
                            peakData={referenceTrack.metadata?.waveform}
                            isReference={true}
                            selectionStartMs={selectionStartMs}
                            selectionEndMs={selectionEndMs}
                            onSelectionChange={handleSelectionChange}
                            onSelectionDragEnd={handleSelectionDragEnd}
                        />
                    </div>
                    <div className="relative z-10 flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <span>Drag yellow loop to analyze</span>
                        <span className="text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                            {formatTime(selectionStartMs)} - {formatTime(selectionEndMs)}
                        </span>
                    </div>
                </div>

                {/* 2. Results Engine */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                            Acoustic Matches
                        </h4>
                        {isCalculating && (
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 animate-pulse">Calculating...</span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24 h-full">
                        <div className="grid gap-3">
                            {matches.map((match, idx) => {
                                const track = allTracks.find(t => t.id === match.trackId);
                                if (!track) return null;
                                const tDurMs = getDurationMs(track.duration || track.rawDurationMs);

                                return (
                                    <div
                                        key={match.trackId}
                                        onClick={() => handleResultClick(match)}
                                        className="group cursor-pointer bg-[#1E1E22]/50 hover:bg-[#1E1E22] border border-white/5 hover:border-yellow-500/30 rounded-2xl p-4 flex items-center gap-6 transition-all"
                                    >
                                        <div className="w-12 text-center text-zinc-600 font-black text-xs group-hover:text-yellow-500">
                                            {(match.score * 100).toFixed(0)}%
                                        </div>
                                        <div className="flex items-center gap-4 w-48 shrink-0">
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 hidden md:block border border-white/10">
                                                <img src={track.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150'} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="text-white w-4 h-4 fill-current" />
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[12px] font-bold text-white truncate group-hover:text-yellow-400 transition-colors tracking-tight">{track.title}</div>
                                                <div className="text-[10px] text-zinc-500 font-medium truncate">{track.artist || 'AuraStream Studio'}</div>
                                            </div>
                                        </div>

                                        {/* The visual proof: Track Waveform with highlight */}
                                        <div className="flex-1 h-12 bg-black/20 rounded-xl overflow-hidden border border-white/5">
                                            <InteractiveWaveform
                                                duration={tDurMs / 1000}
                                                peakData={track.metadata?.waveform}
                                                isReference={false}
                                                highlightStartMs={match.matchStartMs}
                                                highlightEndMs={match.matchEndMs}
                                            />
                                        </div>

                                        <div className="w-24 text-right text-[10px] font-black text-zinc-500 tracking-widest hidden md:block">
                                            {formatTime(match.matchStartMs)}
                                        </div>
                                    </div>
                                );
                            })}
                            {matches.length === 0 && !isCalculating && (
                                <div className="py-12 text-center text-zinc-600 font-black uppercase tracking-widest text-[10px]">
                                    No acoustic matches found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
