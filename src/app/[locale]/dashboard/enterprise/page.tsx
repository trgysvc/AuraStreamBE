import { createClient } from '@/lib/db/server';
import {
    Building2,
    Users,
    Zap,
    ArrowUpRight,
    Activity,
    LayoutDashboard
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { VenueActionRow } from '@/components/dashboard/VenueActionRow';

async function getEnterpriseData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch profile to get tenant_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, tenant:tenants(*)')
        .eq('id', user.id)
        .single();

    if (!profile) return { profile: null, venues: [], members: [], stats: null };
    if (!profile.tenant_id) return { profile, venues: [], members: [], stats: null };

    // Parallel fetching for enterprise data
    const [venuesRes, profilesRes, devicesRes] = await Promise.all([
        supabase.from('venues').select('*').eq('tenant_id', profile.tenant_id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('tenant_id', profile.tenant_id).order('created_at', { ascending: false }),
        (supabase.from('devices') as any).select('*').eq('tenant_id', profile.tenant_id)
    ]);

    const venues = venuesRes.data || [];
    const members = profilesRes.data || [];
    const devices = devicesRes.data || [];

    return {
        profile,
        venues,
        members,
        stats: {
            activeVenues: venues.length,
            totalStaff: members.length,
            connectedDevices: devices.length,
            onlineDevices: (devices as any[]).filter(d => {
                if (!d.last_heartbeat) return false;
                const lastSeen = new Date(d.last_heartbeat).getTime();
                return (Date.now() - lastSeen) < (5 * 60 * 1000); // Online if seen in last 5 mins
            }).length
        }
    };
}

export default async function EnterpriseDashboard() {
    const data = await getEnterpriseData();
    if (!data) return null;

    const { profile, venues, members, stats } = data;
    const tenantName = (profile as any)?.tenant?.display_name || 'Enterprise';

    return (
        <div className="space-y-12 pb-20 p-8 pt-16 animate-in fade-in duration-700">
            {/* 1. Command Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white text-glow">
                            {tenantName} <span className="text-indigo-500">Fleet</span>
                        </h1>
                        <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest italic">
                            HQ Control
                        </span>
                    </div>
                    <p className="text-zinc-500 font-medium text-lg">Central nervous system for your brand ecosystem.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/enterprise/venues"
                        className="px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                        <Building2 size={14} /> Add Branch
                    </Link>
                </div>
            </div>

            {/* 2. Operations Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Active Branches"
                    value={stats?.activeVenues.toString() || '0'}
                    sub="Operational Hubs"
                    icon={Building2}
                    color="text-indigo-500"
                    href="/dashboard/enterprise/venues"
                />
                <MetricCard
                    title="Global Personnel"
                    value={stats?.totalStaff.toString() || '0'}
                    sub="Authorized Staff"
                    icon={Users}
                    color="text-pink-500"
                    href="/dashboard/enterprise/staff"
                />
                <MetricCard
                    title="Smart Devices"
                    value={stats?.connectedDevices.toString() || '0'}
                    sub={`${stats?.onlineDevices || 0} Synced Now`}
                    icon={Zap}
                    color="text-amber-500"
                    href="/dashboard/devices"
                />
                <MetricCard
                    title="System Pulse"
                    value="99.9%"
                    sub="Ecosystem Uptime"
                    icon={Activity}
                    color="text-green-500"
                    href="/dashboard/enterprise"
                />
            </div>

            {/* 3. Quick Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Branches Preview */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600">Recent Branches</h3>
                        <Link href="/dashboard/enterprise/venues" className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors">Manage All</Link>
                    </div>
                    <div className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Branch Name</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Location</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {venues.slice(0, 5).map((venue) => (
                                    <tr key={venue.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <p className="text-sm font-bold text-white uppercase italic">{(venue as any).business_name || (venue as any).name}</p>
                                        </td>
                                        <td className="p-6 text-xs font-medium text-zinc-400">
                                            {venue.city || 'N/A'}
                                        </td>
                                        <td className="p-6 text-right">
                                            <Link href={`/dashboard/venue?id=${venue.id}`} className="p-2 text-zinc-600 hover:text-indigo-400 transition-colors inline-block">
                                                <ArrowUpRight size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {venues.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-20 text-center text-zinc-700 font-black uppercase tracking-widest italic text-xs">No branches registered</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Staff Preview */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600">Management Team</h3>
                        <Link href="/dashboard/enterprise/staff" className="text-[10px] font-black text-pink-400 hover:text-white transition-colors">Authorized Personnel</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {members.slice(0, 4).map((member) => (
                            <div key={member.id} className="flex items-center gap-4 p-5 bg-[#1E1E22] rounded-3xl border border-white/5 group hover:border-white/10 transition-all">
                                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400 border border-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                    <Users size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-white uppercase truncate italic">{member.full_name || 'Staff Member'}</p>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter truncate">{member.role || 'Personnel'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, sub, icon: Icon, color, href }: any) {
    return (
        <Link href={href} className="bg-[#1E1E22] p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden shadow-2xl">
            <div className={`absolute top-0 right-0 p-8 opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500 scale-125 group-hover:scale-150 group-hover:rotate-12 ${color}`}>
                <Icon size={120} strokeWidth={1} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6 group-hover:text-zinc-400 transition-colors font-bold">{title}</p>
            <div className="space-y-1 relative z-10">
                <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none">{value}</h3>
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{sub}</p>
            </div>
        </Link>
    );
}
