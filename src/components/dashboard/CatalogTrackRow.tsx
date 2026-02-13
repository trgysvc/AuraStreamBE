'use client';

import { useState } from 'react';
import { 
    Music, 
    Edit3, 
    BarChart3, 
    Trash2, 
    Check, 
    X,
    Activity,
    Wind
} from 'lucide-react';
import { updateTrackMetadata_Action, deleteTrack_Action } from '@/app/actions/catalog';

const SimpleTooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
    return (
        <div className="group/tooltip relative flex items-center justify-center">
            {children}
            <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:block whitespace-nowrap rounded bg-zinc-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-2xl border border-white/10 z-50">
                {text}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
            </div>
        </div>
    );
};

export function CatalogTrackRow({ track }: { track: any }) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Local Edit State
    const [editData, setEditData] = useState({
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        bpm: track.bpm,
        key: track.key,
        popularity_score: track.popularity_score || 0
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateTrackMetadata_Action(track.id, editData);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            alert('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure? This will permanently delete the asset.')) return;
        setLoading(true);
        try {
            await deleteTrack_Action(track.id);
        } catch (e) {
            console.error(e);
            alert('Delete failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <tr className={`hover:bg-white/[0.02] transition-colors group ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Asset Primary Info */}
            <td className="p-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-zinc-800 rounded-lg flex items-center justify-center relative overflow-hidden shadow-xl">
                        {track.cover_image_url ? (
                            <img src={track.cover_image_url} className="w-full h-full object-cover" alt={track.title} />
                        ) : (
                            <Music size={18} className="text-zinc-600" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        {isEditing ? (
                            <input 
                                value={editData.title} 
                                onChange={e => setEditData({...editData, title: e.target.value})}
                                className="bg-black border border-white/10 rounded px-2 py-1 text-sm text-white w-full"
                            />
                        ) : (
                            <p className="text-sm font-bold text-white truncate uppercase italic">{track.title}</p>
                        )}
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{track.artist}</p>
                    </div>
                </div>
            </td>

            {/* Attributes (Technical) */}
            <td className="p-6">
                <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2 items-center">
                        <span className="text-[9px] font-black text-zinc-600 uppercase">Genre:</span>
                        {isEditing ? (
                            <input 
                                value={editData.genre} 
                                onChange={e => setEditData({...editData, genre: e.target.value})}
                                className="bg-black border border-white/10 rounded px-2 py-0.5 text-[9px] text-white w-20"
                            />
                        ) : (
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[9px] font-black uppercase">{track.genre}</span>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <div className="flex gap-1 items-center">
                            <Activity size={10} className="text-zinc-600" />
                            <span className="text-[9px] font-black text-white uppercase">{track.bpm} BPM</span>
                        </div>
                        <div className="flex gap-1 items-center">
                            <Wind size={10} className="text-zinc-600" />
                            <span className="text-[9px] font-black text-white uppercase">{track.key}</span>
                        </div>
                    </div>
                </div>
            </td>

            {/* Vibe & Tags */}
            <td className="p-6">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {track.mood_tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 text-zinc-400 rounded-[4px] text-[8px] font-bold uppercase italic">
                            #{tag}
                        </span>
                    ))}
                    {track.mood_tags?.length > 3 && <span className="text-[8px] text-zinc-600">+{track.mood_tags.length - 3}</span>}
                </div>
            </td>

            {/* Popularity / Score */}
            <td className="p-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-zinc-600 uppercase">Aura Score</span>
                        <span className="text-[9px] font-bold text-zinc-400">{Math.round((track.popularity_score || 0) * 100)}%</span>
                    </div>
                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500" 
                            style={{ width: `${(track.popularity_score || 0) * 100}%` }} 
                        />
                    </div>
                </div>
            </td>

            {/* Quick Actions */}
            <td className="p-6 text-right">
                <div className="flex items-center justify-end gap-1">
                    {isEditing ? (
                        <>
                            <SimpleTooltip text="Save Changes">
                                <button onClick={handleSave} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg">
                                    <Check size={16} />
                                </button>
                            </SimpleTooltip>
                            <SimpleTooltip text="Cancel">
                                <button onClick={() => setIsEditing(false)} className="p-2 text-zinc-500 hover:bg-white/5 rounded-lg">
                                    <X size={16} />
                                </button>
                            </SimpleTooltip>
                        </>
                    ) : (
                        <>
                            <SimpleTooltip text="Edit Metadata">
                                <button onClick={() => setIsEditing(true)} className="p-2 text-zinc-400 hover:text-white transition-colors">
                                    <Edit3 size={16} />
                                </button>
                            </SimpleTooltip>
                            <SimpleTooltip text="View Analytics">
                                <button className="p-2 text-zinc-400 hover:text-indigo-400 transition-colors">
                                    <BarChart3 size={16} />
                                </button>
                            </SimpleTooltip>
                            <SimpleTooltip text="Delete Track">
                                <button onClick={handleDelete} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </SimpleTooltip>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}
