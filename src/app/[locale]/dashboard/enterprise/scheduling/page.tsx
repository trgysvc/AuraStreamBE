'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getVenueTracks_Action } from '@/app/actions/venue';
import TrackRow from '@/components/dashboard/TrackRow';
import { usePlayer } from '@/context/PlayerContext';
import { Clock, Zap, Sun, Sunrise, Moon, Settings, Building2, Play } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function SmartSchedulingPage() {
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { setTrackList } = usePlayer();

    // Scheduling States
    const [autoSync, setAutoSync] = useState(true);
    const [manualTime, setManualTime] = useState<string | null>(null);

    // Dynamic Current Time (simulated for UI)
    const [currentTimeOfDay, setCurrentTimeOfDay] = useState<string>('Morning');

    useEffect(() => {
        // Simple logic to set time of day for Auto-Sync
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setCurrentTimeOfDay('Morning');
        else if (hour >= 12 && hour < 18) setCurrentTimeOfDay('Midday');
        else setCurrentTimeOfDay('Evening');
    }, []);

    // Determine the active time filter to send to the API
    const activeTimeFilter = autoSync ? currentTimeOfDay : manualTime;

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            // Apply the Time-of-Day filter to the API
            const filterPayload: any = {};
            if (activeTimeFilter) {
                filterPayload.timeOfDay = [activeTimeFilter];
            }

            const res = await getVenueTracks_Action(filterPayload);

            const displayTracks = res.map((t: any) => ({
                id: t.id,
                title: t.title,
                artist: t.artist,
                duration: `${Math.floor((t.duration_sec || 0) / 60)}:${String((t.duration_sec || 0) % 60).padStart(2, '0')}`,
                bpm: t.bpm || 120,
                tags: t.tags?.length ? t.tags : [t.genre || "Music"],
                image: t.cover_image_url || t.coverImage,
                src: t.track_files?.find((f: any) => f.file_type === 'stream_aac' || f.file_type === 'stream_mp3')?.s3_key || '',
                metadata: t.metadata
            }));

            setTracks(displayTracks);
            // Optionally, we could set queue here if auto-playing the schedule
            // setTrackList(displayTracks);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTimeFilter]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const handleAutoSyncToggle = () => {
        setAutoSync(true);
        setManualTime(null);
    };

    const handleManualSelect = (time: string) => {
        setAutoSync(false);
        // If clicking the same one, toggle it off to show ALL tracks
        setManualTime(prev => prev === time ? null : time);
    };

    return (
        <div className="space-y-12 pb-20 p-8 pt-16 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white text-glow">
                            Smart <span className="text-indigo-500">Scheduling</span>
                        </h1>
                        <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest italic flex items-center gap-1">
                            <Clock size={10} /> Active
                        </span>
                    </div>
                    <p className="text-zinc-500 font-medium text-lg">Define auto-play routines based on time-of-day metadata.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/enterprise"
                        className="px-6 py-3 bg-zinc-900 border border-white/10 text-zinc-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2"
                    >
                        Back to HQ
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Left Col: Controls */}
                <div className="lg:col-span-1 space-y-8">

                    {/* Mode selector */}
                    <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 shadow-2xl space-y-6">
                        <div className="flex items-center gap-2 text-white">
                            <Settings size={18} className="text-indigo-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Routing Mode</h3>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleAutoSyncToggle}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${autoSync
                                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                    : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Zap size={18} className={autoSync ? 'text-indigo-400' : 'text-zinc-500'} />
                                    <span className="text-xs font-black uppercase tracking-widest">Auto-Sync</span>
                                </div>
                                {autoSync && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                            </button>
                            <p className="text-[10px] text-zinc-600 px-2 leading-relaxed">
                                System matches track queues automatically to the current local timezone. Currently tracking as: <strong className="text-zinc-300 uppercase">{currentTimeOfDay}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Manual Override */}
                    <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 shadow-2xl space-y-6">
                        <div className="flex items-center gap-2 text-white">
                            <Clock size={18} className="text-pink-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Manual Override</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {['Morning', 'Midday', 'Evening'].map((time) => {
                                const isActive = !autoSync && manualTime === time;
                                const Icon = time === 'Morning' ? Sunrise : time === 'Midday' ? Sun : Moon;

                                return (
                                    <button
                                        key={time}
                                        onClick={() => handleManualSelect(time)}
                                        className={`flexItems-center justify-start gap-3 p-4 rounded-2xl transition-all border text-left ${isActive
                                            ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                                            : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <Icon size={18} className={isActive ? 'text-pink-400' : 'text-zinc-500'} />
                                        <span className="text-xs font-black uppercase tracking-widest">{time} Focus</span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-zinc-600 px-2 leading-relaxed">
                            Select a specific time-block to preview internal track pools and filter logic. Deselect to view the full un-scheduled catalog.
                        </p>
                    </div>

                </div>

                {/* Right Col: Timeline/Preview */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between px-2 pb-4 border-b border-white/5">
                        <div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">
                                {activeTimeFilter ? `${activeTimeFilter} Sequence Preview` : 'Unfiltered Catalog'}
                            </h3>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                            {tracks.length} MATCHING TRACKS
                        </div>
                    </div>

                    <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-4 lg:p-8 min-h-[500px]">
                        {loading ? (
                            <div className="h-40 flex items-center justify-center">
                                <div className="animate-pulse flex items-center gap-3 text-zinc-600">
                                    <Clock className="animate-spin duration-3000" size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Compiling Schedule...</span>
                                </div>
                            </div>
                        ) : tracks.length > 0 ? (
                            <div className="space-y-2">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-zinc-800/50 text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">
                                    <div className="col-span-6 md:col-span-4 flex items-center gap-2">Track</div>
                                    <div className="col-span-3 hidden md:flex items-center">BPM / Vibe</div>
                                    <div className="col-span-4 hidden md:flex items-center justify-center">Acoustic Signature</div>
                                    <div className="col-span-6 md:col-span-1 text-right flex items-center justify-end">Length</div>
                                </div>

                                {tracks.map((track) => (
                                    <TrackRow
                                        key={track.id}
                                        id={track.id}
                                        title={track.title}
                                        artist={track.artist}
                                        duration={track.duration}
                                        bpm={track.bpm}
                                        tags={track.tags}
                                        image={track.image}
                                        audioSrc={track.src}
                                        metadata={track.metadata}
                                        allTracks={tracks}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center gap-4 text-center">
                                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                                    <Sun size={24} className="text-zinc-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase italic">No Tracks Found</h4>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        No files matched the <span className="text-indigo-400 font-bold">{activeTimeFilter || 'current'}</span> time assignment. <br />Upload properly ID3-tagged files to populate.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
