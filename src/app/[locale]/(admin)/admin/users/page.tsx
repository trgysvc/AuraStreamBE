import { createAdminClient } from '@/lib/db/admin-client';
import { Building2, Users, AlertTriangle, Factory } from 'lucide-react';
import { TenantActionRow } from '@/components/admin/TenantActionRow';
import { CreatorActionCard } from '@/components/dashboard/CreatorActionCard';

async function getAdminFactoryData() {
    const supabase = createAdminClient();

    // Fetch Institutions (Tenants) and All Members (Profiles)
    try {
        const [profilesRes, tenantsRes] = await Promise.all([
            supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(1000),
            supabase.from('tenants').select('*').order('created_at', { ascending: false }).limit(200)
        ]);

        return {
            profiles: profilesRes.data || [],
            tenants: tenantsRes.data || [],
            error: profilesRes.error?.message || tenantsRes.error?.message || null
        };
    } catch (e: any) {
        return { profiles: [], tenants: [], error: e.message };
    }
}

export default async function AdminFactoryPage() {
    const { profiles, tenants, error } = await getAdminFactoryData();

    return (
        <div className="space-y-12 pb-20 p-8 pt-16 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Factory size={18} />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Admin Factory</h1>
                    </div>
                    <p className="text-zinc-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Super-admin operations center: Institutions and Global Personnel.</p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-[2rem] flex items-center gap-4 text-rose-500">
                    <AlertTriangle size={20} />
                    <p className="text-xs font-bold uppercase tracking-widest">System Warning: {error}</p>
                </div>
            )}

            {/* Institutions Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-1">
                    <Building2 size={18} className="text-indigo-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Institutions / Kurumlar ({tenants.length})</h3>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Organization</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Plan & Status</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Digital Presence</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tenants.length > 0 ? tenants.map((tenant) => (
                                <TenantActionRow key={tenant.id} tenant={tenant} />
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-32 text-center text-zinc-700 font-black uppercase tracking-widest italic text-xs">No active organizations detected</td>
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
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Global Personnel / Üyeler ({profiles.length})</h3>
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
