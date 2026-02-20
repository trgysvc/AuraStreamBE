'use client';

import React, { useState, useEffect } from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult
} from '@hello-pangea/dnd';
import {
    GripVertical,
    Trash2,
    Plus,
    Search,
    Music,
    Clock,
    ChevronLeft,
    Check,
    Loader2,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    reorderPlaylistTracks_Action,
    removeTrackFromPlaylist_Action,
    addTracksToPlaylist_Action
} from '@/app/actions/playlist';
import { searchTracks_Action } from '@/app/actions/music';

interface Track {
    id: string;
    title: string;
    artist: string;
    duration_sec: number;
    cover_image_url: string;
}

interface PlaylistItem {
    id: string;
    track_id: string;
    position: number;
    track: Track;
}

interface Props {
    playlist: {
        id: string;
        name: string;
        description: string | null;
    };
    initialItems: PlaylistItem[];
    allTracks: Track[]; // Initial few tracks for search suggestions
}

export function PlaylistEditorClient({ playlist, initialItems, allTracks }: Props) {
    const router = useRouter();
    const [items, setItems] = useState(initialItems);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Filter tracks based on search query
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            setDebouncedQuery(searchQuery);
            try {
                const results = await searchTracks_Action(searchQuery);
                setSearchResults(results as any);
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, allTracks]);

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const reordered = Array.from(items);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);

        // Update local state immediately for snappy UI
        setItems(reordered);

        // Persist to DB
        try {
            setIsSaving(true);
            const orderedIds = reordered.map(item => item.id);
            await reorderPlaylistTracks_Action(playlist.id, orderedIds);
        } catch (error) {
            console.error('Failed to reorder:', error);
            // Optionally revert UI on failure
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async (itemId: string) => {
        const updated = items.filter(item => item.id !== itemId);
        setItems(updated);

        try {
            await removeTrackFromPlaylist_Action(itemId, playlist.id);
        } catch (error) {
            console.error('Failed to remove:', error);
        }
    };

    const handleAddTrack = async (track: Track) => {
        try {
            setIsSaving(true);
            await addTracksToPlaylist_Action(playlist.id, [track.id]);
            // Refresh page to get new items with their unique item IDs
            router.refresh();
        } catch (error) {
            console.error('Failed to add:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to check if track is already in playlist
    const isInPlaylist = (trackId: string) => items.some(item => item.track_id === trackId);

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[calc(100vh-12rem)]">
            {/* Left: Draggable List */}
            <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/dashboard/playlists/${playlist.id}`} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">{playlist.name}</h1>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Editor Modu</p>
                        </div>
                    </div>
                    {isSaving && (
                        <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                            <Loader2 size={12} className="animate-spin" />
                            Syncing...
                        </div>
                    )}
                </div>

                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-[auto_48px_1fr_auto_auto] gap-4 px-8 py-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-white/5">
                        <div className="w-6"></div>
                        <div className="text-center">#</div>
                        <div>Title</div>
                        <div className="text-right px-4"><Clock size={12} /></div>
                        <div className="w-8"></div>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="playlist-tracks">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="divide-y divide-white/5"
                                >
                                    {items.length === 0 && (
                                        <div className="p-20 text-center space-y-4">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                                                <Music size={32} />
                                            </div>
                                            <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest italic">Playlist is empty. Add tracks from the right panel.</p>
                                        </div>
                                    )}
                                    {items.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`grid grid-cols-[auto_48px_1fr_auto_auto] gap-4 px-8 py-4 items-center transition-colors group ${snapshot.isDragging ? 'bg-indigo-500/10 border-y border-indigo-500/20 z-50 shadow-2xl backdrop-blur-md' : 'hover:bg-white/[0.03]'
                                                        }`}
                                                >
                                                    <div {...provided.dragHandleProps} className="text-zinc-700 hover:text-zinc-400 p-1 cursor-grab active:cursor-grabbing">
                                                        <GripVertical size={18} />
                                                    </div>
                                                    <div className="text-center font-mono text-[10px] text-zinc-600 font-black">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-zinc-900 rounded relative overflow-hidden shrink-0 border border-white/5">
                                                            {item.track?.cover_image_url ? (
                                                                <Image src={item.track.cover_image_url} alt="" fill className="object-cover" />
                                                            ) : (
                                                                <div className="absolute inset-0 flex items-center justify-center"><Music size={16} className="text-zinc-800" /></div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-white truncate uppercase italic">{item.track?.title}</p>
                                                            <p className="text-[10px] text-zinc-500 truncate font-black uppercase tracking-tight">{item.track?.artist}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right px-4 text-[10px] text-zinc-500 font-mono font-black">
                                                        {item.track ? `${Math.floor(item.track.duration_sec / 60)}:${(item.track.duration_sec % 60).toString().padStart(2, '0')}` : '--:--'}
                                                    </div>
                                                    <div className="w-8 flex justify-end">
                                                        <button
                                                            onClick={() => handleRemove(item.id)}
                                                            className="p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>

            {/* Right: Search Panel */}
            <div className="w-full lg:w-[400px] space-y-6">
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 px-2 flex items-center gap-3">
                        <Sparkles size={14} className="text-indigo-500" />
                        Music Supply
                    </h3>
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find tracks to add..."
                            className="w-full bg-[#111] border border-white/5 rounded-3xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-indigo-500/30 transition-all shadow-xl"
                        />
                    </div>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            {debouncedQuery.length > 0 ? `Results for "${debouncedQuery}"` : 'Library Suggestions'}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-white/5 custom-scrollbar">
                        {isSearching ? (
                            <div className="p-12 text-center">
                                <Loader2 className="animate-spin text-zinc-700 mx-auto" size={24} />
                            </div>
                        ) : (
                            (searchResults.length > 0 ? searchResults : allTracks.slice(0, 10)).map(track => {
                                const added = isInPlaylist(track.id);
                                return (
                                    <div key={track.id} className="p-4 hover:bg-white/[0.02] transition-colors group flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-900 rounded-xl relative overflow-hidden shrink-0 border border-white/5">
                                            {track.cover_image_url ? (
                                                <Image src={track.cover_image_url} alt="" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center"><Music size={18} className="text-zinc-800" /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-white uppercase truncate italic">{track.title}</p>
                                            <p className="text-[10px] text-zinc-500 truncate font-black uppercase tracking-tight">{track.artist}</p>
                                        </div>
                                        <button
                                            onClick={() => !added && handleAddTrack(track)}
                                            disabled={added || isSaving}
                                            className={`p-3 rounded-2xl transition-all ${added
                                                ? 'bg-green-500/10 text-green-500'
                                                : 'bg-white/5 text-zinc-500 hover:bg-indigo-500 hover:text-white'
                                                }`}
                                        >
                                            {added ? <Check size={18} /> : <Plus size={18} />}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                        {searchQuery.length > 0 && searchResults.length === 0 && !isSearching && (
                            <div className="p-12 text-center text-zinc-700 text-[10px] font-black uppercase tracking-widest italic">
                                No tracks found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
