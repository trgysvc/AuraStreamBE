
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/db/client';
import { createPlaylist_Action } from '@/app/actions/playlist';
import { Save, ChevronLeft, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function CreatePlaylistPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [tenantId, setTenantId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            const { data: profile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', user.id)
                .single();

            if (profile) setTenantId(profile.tenant_id);
        };
        fetchUser();
    }, [supabase, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !tenantId) return;

        setLoading(true);
        try {
            await createPlaylist_Action({
                tenantId,
                userId: user.id,
                name: formData.name,
                description: formData.description
            });
            router.push('/dashboard/playlists');
        } catch (error) {
            console.error('Failed to create playlist:', error);
            alert('Failed to create playlist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/playlists" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                    <ChevronLeft size={20} className="text-zinc-400" />
                </Link>
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">New Playlist</h1>
                    <p className="text-zinc-500 font-medium">Create a new collection.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Playlist Name</label>
                    <input
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Morning Vibes"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500 transition-all font-bold"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Description (Optional)</label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="What's the vibe?"
                        rows={4}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !formData.name}
                        className="px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Create Playlist
                    </button>
                </div>
            </form>
        </div>
    );
}
