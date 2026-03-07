'use client';

import { useState } from 'react';
import { Play, Sparkles, MoreVertical, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { deletePlaylist_Action } from '@/app/actions/playlist';
import { useRouter } from 'next/navigation';

interface Props {
    playlistId: string;
}

export default function PlaylistHeaderControls({ playlistId }: Props) {
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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
                    className="h-14 w-14 rounded-full border border-white/10 hover:bg-white/5 flex items-center justify-center transition-colors"
                >
                    <MoreVertical size={20} />
                </button>

                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 transition-colors text-left text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                            >
                                <Trash2 size={16} />
                                {isDeleting ? 'Deleting...' : 'Delete Playlist'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
