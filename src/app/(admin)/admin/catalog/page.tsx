import { createClient } from '@/lib/db/server';
import { Search, Filter, Layers, ListMusic, Plus } from 'lucide-react';
import { CatalogTrackRow } from '@/components/dashboard/CatalogTrackRow';

async function getCatalogTracks() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch Catalog Error:', error);
        return [];
    }
    return data;
}

export default async function CatalogMgmtPage() {
    const tracks = await getCatalogTracks();

    return (
        <div className="space-y-12 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Catalog Management</h1>
                    <p className="text-zinc-500 font-medium mt-1 text-[15px]">The Master Repository: Controlling the global audio flow.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find by title, ID or artist..."
                            className="bg-[#1E1E22] border border-white/5 rounded-full pl-12 pr-6 py-3.5 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all w-80 placeholder:text-zinc-700"
                        />
                    </div>
                    <button className="h-12 w-12 flex items-center justify-center bg-white/5 border border-white/5 rounded-full text-zinc-400 hover:text-white transition-all">
                        <Filter size={20} />
                    </button>
                    <button className="flex items-center gap-2 px-8 h-12 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-xl">
                        <Plus size={16} strokeWidth={3} /> Add Track
                    </button>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1E1E22] p-6 rounded-2xl border border-white/5 flex items-center gap-6">
                    <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500"><ListMusic size={24} /></div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase">Total Assets</p>
                        <p className="text-2xl font-black text-white">{tracks.length}</p>
                    </div>
                </div>
                <div className="bg-[#1E1E22] p-6 rounded-2xl border border-white/5 flex items-center gap-6">
                    <div className="h-12 w-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-500"><Layers size={24} /></div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase">Genres Managed</p>
                        <p className="text-2xl font-black text-white">{new Set(tracks.map(t => t.genre)).size}</p>
                    </div>
                </div>
                <div className="bg-[#1E1E22] p-6 rounded-2xl border border-white/5 flex items-center gap-6">
                    <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500"><Plus size={24} /></div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase">New This Week</p>
                        <p className="text-2xl font-black text-white">+{tracks.filter(t => new Date(t.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length}</p>
                    </div>
                </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in duration-700">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            <th className="p-8">Audio Asset</th>
                            <th className="p-8">Technical Mapping</th>
                            <th className="p-8">Vibe Profile</th>
                            <th className="p-8">Engagement</th>
                            <th className="p-8 text-right">Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {tracks.map((track) => (
                            <CatalogTrackRow key={track.id} track={track} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
