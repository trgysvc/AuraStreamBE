import { createClient } from '@/lib/db/server';
import {
    Building2,
    Plus,
    Search,
    MapPin,
    ArrowRight,
    Settings2,
    Trash2
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

async function getVenuesData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) return { venues: [] };

    const { data: venues } = await supabase
        .from('venues')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

    return { venues: venues || [], tenantId: profile.tenant_id };
}

export default async function BranchManagementPage() {
    const data = await getVenuesData();
    if (!data) return null;

    const { venues, tenantId } = data;

    return (
        <div className="space-y-12 pb-20 p-8 pt-16 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white text-glow">
                        Branch <span className="text-indigo-500">Inventory</span>
                    </h1>
                    <p className="text-zinc-500 font-medium text-lg">Manage your commercial physical presence.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Find a branch..."
                            className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-64 transition-all"
                        />
                    </div>
                    <button
                        className="px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-xl"
                    >
                        <Plus size={14} strokeWidth={3} /> New Branch
                    </button>
                </div>
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {venues.map((venue) => (
                    <div key={venue.id} className="bg-[#1E1E22] group rounded-[2.5rem] border border-white/5 p-8 hover:border-white/10 transition-all relative overflow-hidden flex flex-col justify-between min-h-[320px]">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                            <Building2 size={160} />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-start justify-between">
                                <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-indigo-500 group-hover:text-white transition-all border border-white/5">
                                    <Building2 size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2.5 text-zinc-600 hover:text-white transition-colors hover:bg-white/5 rounded-xl">
                                        <Settings2 size={18} />
                                    </button>
                                    <button className="p-2.5 text-zinc-600 hover:text-rose-500 transition-colors hover:bg-rose-500/10 rounded-xl">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight truncate">
                                    {venue.business_name}
                                </h3>
                                <div className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                                    <MapPin size={12} className="text-indigo-500" />
                                    {venue.city || 'Standard Office'} • {venue.country || 'Global'}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(venue as any).mood_tags?.slice(0, 3).map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest text-zinc-500 border border-white/5">
                                        {tag}
                                    </span>
                                ))}
                                {!(venue as any).mood_tags?.length && <span className="text-[9px] text-zinc-700 italic">No vibe assigned</span>}
                            </div>
                        </div>

                        <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{venue.verification_status || 'Active'}</span>
                            </div>
                            <Link
                                href={`/dashboard/venue?id=${venue.id}`}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-indigo-400 transition-colors"
                            >
                                Control Panel <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Create Trigger */}
                <button className="bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 min-h-[320px] hover:bg-white/[0.07] transition-all group">
                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:bg-indigo-500 transition-all border border-white/5">
                        <Plus size={32} strokeWidth={1} />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="font-black text-xs uppercase tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors">Register New Hub</p>
                        <p className="text-[10px] text-zinc-700 font-medium">Expand your fleet footprint</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
