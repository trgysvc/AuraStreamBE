import { createClient } from '@/lib/db/server';
import { Building2, Users } from 'lucide-react';
import { VenueActionRow } from '@/components/dashboard/VenueActionRow';
import { CreatorActionCard } from '@/components/dashboard/CreatorActionCard';

async function getUsersAndVenues() {
    const supabase = createClient();

    const [
        { data: profiles },
        { data: venues }
    ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('venues').select('*, profiles(email)').order('created_at', { ascending: false }).limit(20)
    ]);

    return { profiles: profiles || [], venues: venues || [] };
}

export default async function UserIntelligencePage() {
    const { profiles, venues } = await getUsersAndVenues();

    return (
        <div className="space-y-12 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">User Intelligence</h1>
                    <p className="text-zinc-500 font-medium mt-1">Holistic view of creators and commercial partners.</p>
                </div>
            </div>

            {/* Venues Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-1">
                    <Building2 size={18} className="text-indigo-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Commercial Venues</h3>
                </div>
                <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Business Name</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">City / Country</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {venues.map((venue) => (
                                <VenueActionRow key={venue.id} venue={venue} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Users Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-1">
                    <Users size={18} className="text-pink-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Global Creators</h3>
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
