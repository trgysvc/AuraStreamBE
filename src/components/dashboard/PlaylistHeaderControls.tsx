'use client';

import { useState } from 'react';
import { Play, Sparkles, MoreVertical, Trash2, Edit2, X, Save, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { deletePlaylist_Action, updatePlaylist_Action } from '@/app/actions/playlist';
import { useRouter } from 'next/navigation';

interface Props {
    playlistId: string;
    initialName?: string;
    initialDescription?: string | null;
}

export default function PlaylistHeaderControls({ playlistId, initialName, initialDescription }: Props) {
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(initialName || '');
    const [editDesc, setEditDesc] = useState(initialDescription || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            await deletePlaylist_Action(playlistId);
            router.push('/dashboard/playlists');
        } catch (error) {
            console.error('Failed to delete playlist:', error);
            setIsDeleting(false);
            alert('Failed to delete playlist');
        }
    };

    const handleUpdate = async () => {
        if (!editName.trim()) return;

        setIsUpdating(true);
        try {
            await updatePlaylist_Action(playlistId, {
                name: editName,
                description: editDesc
            });
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error('Failed to update playlist:', error);
            alert('Failed to update playlist');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex items-center gap-4 relative">
            <button className="h-14 w-14 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20">
                <Play fill="currentColor" className="ml-1" />
            </button>
            <Link
                href={`/dashboard/playlists/${playlistId}/edit`}
                className="px-6 py-4 rounded-full border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 text-indigo-400"
            >
                <Sparkles size={14} />
                Open Editor
            </Link>

            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="h-14 w-14 rounded-full border border-white/10 hover:bg-white/5 flex items-center justify-center transition-colors px-0"
                >
                    <MoreVertical size={20} />
                </button>

                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-4 text-white hover:bg-white/5 transition-colors text-left text-[10px] font-black uppercase tracking-widest border-b border-white/5"
                            >
                                <Edit2 size={16} className="text-zinc-400" />
                                Rename Playlist
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-500/10 transition-colors text-left text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                                <Trash2 size={16} />
                                {isDeleting ? 'Deleting...' : 'Delete Playlist'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Edit Modal / Overlay */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
                    <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Edit Playlist</h3>
                            <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">New Name</label>
                                <input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Description</label>
                                <textarea
                                    value={editDesc}
                                    onChange={e => setEditDesc(e.target.value)}
                                    rows={3}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 px-8 py-4 border border-white/10 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all text-zinc-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating || !editName.trim()}
                                className="flex-1 px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
