'use client';

import { useState } from 'react';
import { Play, Tag, XCircle, Music, Loader2, X, Check } from 'lucide-react';
import { approveTrack_Action, rejectTrack_Action, updateTrackQC_Action } from '@/app/actions/qc';

const ALL_MOODS = ['Happy', 'Melancholic', 'Energetic', 'Dark', 'Hopeful', 'Aggressive', 'Relaxing', 'Chill', 'Cinematic', 'Lounge'];

const SimpleTooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
    return (
        <div className="group/tooltip relative flex items-center justify-center">
            {children}
            <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:block whitespace-nowrap rounded bg-zinc-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-2xl border border-white/10 z-[100]">
                {text}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
            </div>
        </div>
    );
};

export function QCAssetCard({ track }: { track: any }) {
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'tags' | null>(null);
    const [isTagging, setIsTagging] = useState(false);
    const [selectedMoods, setSelectedMoods] = useState<string[]>(track.mood_tags || []);

    const handleApprove = async () => {
        setLoading(true);
        setActionType('approve');
        try {
            await approveTrack_Action(track.id);
        } catch (e) {
            console.error(e);
            alert('Approval failed');
        } finally {
            setLoading(false);
            setActionType(null);
        }
    };

    const handleReject = async () => {
        if (!confirm('Are you sure you want to reject and purge this asset?')) return;
        setLoading(true);
        setActionType('reject');
        try {
            await rejectTrack_Action(track.id);
        } catch (e) {
            console.error(e);
            alert('Rejection failed');
        } finally {
            setLoading(false);
            setActionType(null);
        }
    };

    const handleSaveTags = async () => {
        setLoading(true);
        setActionType('tags');
        try {
            await updateTrackQC_Action(track.id, { mood_tags: selectedMoods });
            setIsTagging(false);
        } catch (e) {
            console.error(e);
            alert('Tag update failed');
        } finally {
            setLoading(false);
            setActionType(null);
        }
    };

    const toggleMood = (mood: string) => {
        setSelectedMoods(prev => 
            prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
        );
    };

    return (
        <div className={`bg-[#1E1E22] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group flex flex-col md:flex-row items-center gap-8 ${loading && actionType !== 'tags' ? 'opacity-50 pointer-events-none' : ''} relative`}>
            {/* Track Preview Info */}
            <div className="flex items-center gap-6 flex-1">
                <div className="h-16 w-16 bg-zinc-800 rounded-xl flex items-center justify-center relative overflow-hidden shadow-2xl">
                    {track.cover_image_url ? (
                        <img src={track.cover_image_url} className="w-full h-full object-cover" alt={track.title} />
                    ) : (
                        <Music className="text-zinc-600" size={24} />
                    )}
                    <SimpleTooltip text="Preview track audio">
                        <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                            <Play size={20} fill="currentColor" />
                        </button>
                    </SimpleTooltip>
                </div>
                <div className="min-w-0">
                    <h4 className="text-lg font-black text-white uppercase truncate">{track.title}</h4>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{track.artist || 'Unknown Artist'}</p>
                    <div className="flex gap-4 mt-2 text-[10px] font-black text-zinc-600 uppercase italic">
                        <span>BPM: {track.bpm}</span>
                        <span>Key: {track.key}</span>
                        <span>Dur: {track.duration_sec}s</span>
                    </div>
                </div>
            </div>

            {/* Tags Section */}
            <div className="flex flex-wrap gap-2 flex-1 justify-center relative">
                {track.mood_tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase text-zinc-400 border border-white/5">
                        {tag}
                    </span>
                ))}
                <SimpleTooltip text="Edit Mood Tags">
                    <button 
                        onClick={() => setIsTagging(!isTagging)}
                        className={`p-2 rounded-lg transition-all ${isTagging ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <Tag size={16} />
                    </button>
                </SimpleTooltip>

                {/* Inline Tag Editor Popover */}
                {isTagging && (
                    <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-80 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl z-[150] p-6 space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select Moods</h5>
                            <button onClick={() => setIsTagging(false)} className="text-zinc-600 hover:text-white"><X size={16} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {ALL_MOODS.map(mood => (
                                <button
                                    key={mood}
                                    onClick={() => toggleMood(mood)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${selectedMoods.includes(mood) ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-black text-zinc-500 border-white/5 hover:border-white/10'}`}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={handleSaveTags}
                            disabled={loading}
                            className="w-full py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            {loading && actionType === 'tags' ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                            Update Metadata
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <SimpleTooltip text="Confirm and Release to Catalog">
                    <button 
                        onClick={handleApprove}
                        disabled={loading}
                        className="min-w-[120px] px-6 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        {loading && actionType === 'approve' ? <Loader2 size={14} className="animate-spin" /> : 'Approve'}
                    </button>
                </SimpleTooltip>
                <SimpleTooltip text="Reject and Purge Asset">
                    <button 
                        onClick={handleReject}
                        disabled={loading}
                        className="p-3 text-zinc-600 hover:text-rose-500 transition-colors bg-white/5 rounded-xl border border-white/5"
                    >
                        {loading && actionType === 'reject' ? <Loader2 size={20} className="animate-spin" /> : <XCircle size={20} />}
                    </button>
                </SimpleTooltip>
            </div>
        </div>
    );
}
