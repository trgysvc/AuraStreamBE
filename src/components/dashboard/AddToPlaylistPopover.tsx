'use client';

import { useState, useEffect } from 'react';
import { Plus, ListPlus, Check, Search, X } from 'lucide-react';
import { getPlaylists_Action, addTrackToPlaylist_Action, Playlist } from '@/app/actions/playlist';

interface AddToPlaylistPopoverProps {
    trackId: string;
    tenantId: string | null;
    onClose: () => void;
}

export default function AddToPlaylistPopover({ trackId, tenantId, onClose }: AddToPlaylistPopoverProps) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingToId, setAddingToId] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (tenantId) {
            getPlaylists_Action(tenantId).then(data => {
                setPlaylists(data);
                setLoading(false);
            });
        }
    }, [tenantId]);

    const handleAdd = async (playlistId: string) => {
        setAddingToId(playlistId);
        try {
            await addTrackToPlaylist_Action(playlistId, trackId);
            setSuccessId(playlistId);
            setTimeout(() => {
                setSuccessId(null);
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error adding to playlist:', error);
        } finally {
            setAddingToId(null);
        }
    };

    const filteredPlaylists = playlists.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="absolute right-0 bottom-full mb-2 w-64 bg-[#1E1E22]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white italic">Add to Playlist</h3>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                    <X size={14} />
                </button>
            </div>

            <div className="p-2">
                <div className="bg-white/5 rounded-lg mb-2 flex items-center px-3 py-1.5 focus-within:bg-white/10 transition-colors">
                    <Search size={14} className="text-zinc-500 mr-2" />
                    <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter playlists..."
                        className="bg-transparent border-none outline-none text-[12px] text-white w-full placeholder-zinc-600 font-bold"
                    />
                </div>

                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                    {loading ? (
                        <div className="py-8 flex justify-center">
                            <div className="h-5 w-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : filteredPlaylists.length > 0 ? (
                        filteredPlaylists.map((playlist) => (
                            <button
                                key={playlist.id}
                                disabled={addingToId !== null}
                                onClick={() => handleAdd(playlist.id)}
                                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group flex items-center justify-between"
                            >
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[12px] font-bold text-zinc-200 truncate group-hover:text-white">{playlist.name}</span>
                                    <span className="text-[9px] text-zinc-500 font-medium">{playlist.item_count} tracks</span>
                                </div>
                                <div className="flex-shrink-0 ml-2">
                                    {successId === playlist.id ? (
                                        <Check size={16} className="text-green-500" />
                                    ) : addingToId === playlist.id ? (
                                        <div className="h-4 w-4 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Plus size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
                                    )}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="py-8 text-center text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">
                            No playlists found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
