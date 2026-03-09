
import { createClient } from '@/lib/db/server';
import { redirect } from 'next/navigation';
import { getPlaylistDetails_Action } from '@/app/actions/playlist';
import { Play, Clock, MoreVertical, Trash2, Plus, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import PlaylistHeaderControls from '@/components/dashboard/PlaylistHeaderControls';
import PlaylistClientView from '@/components/dashboard/PlaylistClientView';

export default async function PlaylistDetailPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { playlist, items } = await getPlaylistDetails_Action(id);

    // Calculate total duration
    const totalSeconds = items.reduce((acc, item) => acc + (item.track?.duration_sec || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let durationString = '';
    if (hours > 0) {
        durationString += `${hours}h `;
    }
    durationString += `${minutes}m`;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 items-end">
                <div className="w-64 h-64 bg-zinc-900 rounded-3xl shrink-0 shadow-2xl relative overflow-hidden group">
                    {/* Placeholder cover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl font-black text-white/10 uppercase italic">PL</span>
                    </div>
                </div>

                <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                            <p>Playlist</p>
                            <span>•</span>
                            <div className="flex items-center gap-1.5">
                                <Clock size={12} className="text-zinc-400" />
                                <span>{durationString}</span>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">{playlist.name}</h1>
                        <p className="text-zinc-400 font-medium max-w-xl">{playlist.description}</p>
                    </div>

                    <PlaylistHeaderControls playlistId={id} />
                </div>
            </div>

            {/* Tracks List */}
            <PlaylistClientView playlistId={id} items={items} />
        </div>
    );
}
