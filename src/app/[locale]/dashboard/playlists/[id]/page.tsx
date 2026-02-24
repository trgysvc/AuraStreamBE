
import { createClient } from '@/lib/db/server';
import { redirect } from 'next/navigation';
import { getPlaylistDetails_Action } from '@/app/actions/playlist';
import { Play, Clock, MoreVertical, Trash2, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function PlaylistDetailPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { playlist, items } = await getPlaylistDetails_Action(id);

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
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Playlist</p>
                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">{playlist.name}</h1>
                        <p className="text-zinc-400 font-medium max-w-xl">{playlist.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="h-14 w-14 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20">
                            <Play fill="currentColor" className="ml-1" />
                        </button>
                        <Link
                            href={`/dashboard/playlists/${id}/edit`}
                            className="px-6 py-4 rounded-full border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 text-indigo-400"
                        >
                            <Sparkles size={14} />
                            Open Editor
                        </Link>
                        <button className="h-14 w-14 rounded-full border border-white/10 hover:bg-white/5 flex items-center justify-center transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tracks List */}
            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-8 py-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <div className="w-8 text-center">#</div>
                    <div>Title</div>
                    <div className="text-right px-4"><Clock size={14} /></div>
                    <div className="w-8"></div>
                </div>

                {items.length === 0 ? (
                    <div className="p-16 text-center space-y-4">
                        <p className="text-zinc-500">This playlist is empty.</p>
                        <Link href="/dashboard/music" className="inline-flex items-center gap-2 text-indigo-400 hover:text-white transition-colors font-bold uppercase text-xs tracking-wider">
                            <Plus size={14} /> Add Tracks from Library
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {items.map((item: any, index: number) => (
                            <div key={item.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-8 py-4 hover:bg-white/5 transition-colors group items-center">
                                <div className="w-8 text-center text-zinc-500 font-mono text-xs">{index + 1}</div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-800 rounded mx-auto shrink-0 relative overflow-hidden">
                                        {item.track?.cover_image_url && (
                                            <Image
                                                src={item.track.cover_image_url}
                                                alt={item.track.title}
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white truncate">{item.track?.title}</p>
                                        <p className="text-xs text-zinc-500 truncate">{item.track?.artist}</p>
                                    </div>
                                </div>
                                <div className="text-right px-4 text-xs text-zinc-500 font-mono">
                                    {Math.floor(item.track?.duration_sec / 60)}:{(item.track?.duration_sec % 60).toString().padStart(2, '0')}
                                </div>
                                <div className="w-8 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-zinc-500 hover:text-red-500 p-2">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
