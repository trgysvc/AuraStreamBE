import { createClient } from '@/lib/db/server';
import { Building2, Users, AlertTriangle } from 'lucide-react';
import { VenueActionRow } from '@/components/dashboard/VenueActionRow';
import { CreatorActionCard } from '@/components/dashboard/CreatorActionCard';

async function getUsersAndVenues() {
    const supabase = await createClient();

    // Fetch data with direct fallback to ensure list is never empty if DB exists
    try {
        const [profilesRes, venuesRes] = await Promise.all([
            supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
            supabase.from('venues').select('*').order('created_at', { ascending: false }).limit(100)
        ]);

        return {
            profiles: profilesRes.data || [],
            venues: venuesRes.data || [],
            error: profilesRes.error?.message || venuesRes.error?.message || null
        };
    } catch (e: any) {
        return { profiles: [], venues: [], error: e.message };
    }
}

export default async function UserIntelligencePage() {
    const { profiles, venues, error } = await getUsersAndVenues();

    return (
        <div className="space-y-12 pb-20 p-8 pt-16 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Intelligence Center</h1>
                    <p className="text-zinc-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Super-admin overview of all active harmonics.</p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-[2rem] flex items-center gap-4 text-rose-500">
                    <AlertTriangle size={20} />
                    <p className="text-xs font-bold uppercase tracking-widest">Protocol Breach: {error}</p>
                </div>
            )}

            {/* Venues Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-1">
                    <Building2 size={18} className="text-indigo-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Fleet Branches ({venues.length})</h3>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Brand / Name</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Location</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {venues.length > 0 ? venues.map((venue) => (
                                <VenueActionRow key={venue.id} venue={venue} />
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-32 text-center text-zinc-700 font-black uppercase tracking-widest italic text-xs">No active branches detected</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Users Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-1">
                    <Users size={18} className="text-pink-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Global Personnel ({profiles.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {profiles.map((profile) => (
                        <CreatorActionCard key={profile.id} profile={profile} />
                    ))}
                </div>
            </div>
        </div>
    );
}
