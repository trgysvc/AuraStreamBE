
import { createClient } from '@/lib/db/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getPlaylists_Action } from '@/app/actions/playlist';
import { Plus, ListMusic, Music } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function PlaylistsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Playlists' });
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    const playlists = profile?.tenant_id ? await getPlaylists_Action(profile.tenant_id) : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-white/5 pb-8">
                <div className="space-y-4">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">{t('title')}</h1>
                    <p className="text-zinc-500 font-medium">{t('subtitle')}</p>
                </div>
                <Link
                    href="/dashboard/playlists/new"
                    className="px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl flex items-center gap-3"
                >
                    <Plus size={16} />
                    {t('create')}
                </Link>
            </div>

            {/* Playlists Grid */}
            {playlists.length === 0 ? (
                <div className="bg-[#111] border border-white/5 rounded-3xl p-20 text-center space-y-10">
                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <ListMusic size={64} className="text-zinc-600" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">{t('empty.title')}</h3>
                        <p className="text-zinc-500 max-w-md mx-auto font-medium leading-relaxed">
                            {t('empty.desc')}
                        </p>
                    </div>
                    <div className="pt-2">
                        <Link
                            href="/dashboard/playlists/new"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl"
                        >
                            <Plus size={16} />
                            {t('create')}
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {playlists.map((playlist: any) => (
                        <Link
                            key={playlist.id}
                            href={`/dashboard/playlists/${playlist.id}`}
                            className="bg-[#111] border border-white/5 rounded-3xl p-6 space-y-6 hover:border-white/10 transition-colors group block"
                        >
                            <div className="aspect-square bg-zinc-900 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                                {/* Placeholder for playlist cover (could use 4 album arts) */}
                                <Music size={48} className="text-zinc-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                                <div className="absolute bottom-4 left-4">
                                    <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white">
                                        {t('items.tracks', { count: playlist.items?.[0]?.count || 0 })}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-white text-lg truncate group-hover:text-indigo-400 transition-colors">{playlist.name}</h3>
                                <p className="text-xs text-zinc-500 line-clamp-2 min-h-[2.5em]">{playlist.description || t('items.no_description')}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
