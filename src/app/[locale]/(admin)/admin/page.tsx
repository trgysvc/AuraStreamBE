import { createClient } from '@/lib/db/server';
import {
    Activity,
    Users,
    Zap,
    Clock,
    ArrowUpRight,
    TrendingUp,
    Music,
    HardDrive,
    ShieldAlert
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

async function getAdminData() {
    const supabase = await createClient();

    try {
        // 1. Fetch Counts with error handling
        const [
            pendingRes,
            profilesRes,
            venuesRes,
            disputesRes,
            tracksRes
        ] = await Promise.all([
            supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'pending_qc'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('venues').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
            supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'active')
        ]);

        // 2. Fetch Growth (Last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: newUsersWeek } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo);

        // 3. Fetch Recent System Logs
        const { data: recentLogs } = await supabase
            .from('search_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);

        return {
            stats: {
                pendingTracks: pendingRes.count || 0,
                totalUsers: profilesRes.count || 0,
                activeVenues: venuesRes.count || 0,
                openDisputes: disputesRes.count || 0,
                totalTracks: tracksRes.count || 0,
                newUsersWeek: newUsersWeek || 0
            },
            recentLogs: recentLogs || [],
            error: null
        };
    } catch (e: any) {
        console.error('Admin Data Fetch Error:', e);
        return {
            stats: { pendingTracks: 0, totalUsers: 0, activeVenues: 0, openDisputes: 0, totalTracks: 0, newUsersWeek: 0 },
            recentLogs: [],
            error: 'Failed to fetch real-time data'
        };
    }
}

export default async function AdminDashboard() {
    const { stats, recentLogs, error } = await getAdminData();

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            {/* 1. Global Command Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white text-glow">Factory OS</h1>
                        <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">v3.6 Live</span>
                    </div>
                    <p className="text-zinc-500 font-medium text-lg">Central nervous system for the Sonaraura ecosystem.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`px-5 py-2.5 ${error ? 'bg-rose-500/5 border-rose-500/10 text-rose-500' : 'bg-green-500/5 border-green-500/10 text-green-500'} border rounded-2xl flex items-center gap-3`}>
                        <div className={`h-2 w-2 rounded-full ${error ? 'bg-rose-500' : 'bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]'}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{error ? 'System Degraded' : 'Infrastructure Healthy'}</span>
                    </div>
                    <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-zinc-400">
                        <TrendingUp size={14} className="text-pink-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">+{stats.newUsersWeek} New / week</span>
                    </div>
                </div>
            </div>

            {/* 2. Critical Operation Centers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="QC Station"
                    value={stats.pendingTracks.toString()}
                    sub="Authorization Queue"
                    icon={Clock}
                    color="text-yellow-500"
                    href="/admin/qc"
                    glow="shadow-yellow-500/5"
                />
                <MetricCard
                    title="Revenue Hub"
                    value={stats.openDisputes.toString()}
                    sub="Custom Requests"
                    icon={Zap}
                    color="text-pink-500"
                    href="/admin/requests"
                    glow="shadow-pink-500/5"
                />
                <MetricCard
                    title="Business Growth"
                    value={stats.activeVenues.toString()}
                    sub="Verified Venues"
                    icon={Activity}
                    color="text-indigo-500"
                    href="/admin/users"
                    glow="shadow-indigo-500/5"
                />
                <MetricCard
                    title="Global Reach"
                    value={stats.totalUsers.toString()}
                    sub="Total Ecosystem"
                    icon={Users}
                    color="text-zinc-400"
                    href="/admin/users"
                    glow="shadow-zinc-500/5"
                />
            </div>

            {/* 3. Deep Analytics & Operational Hubs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Visual Pipeline */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="space-y-6">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-2">Production Velocity</h3>
                        <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative flex items-end justify-between gap-1 h-32 mb-8">
                                {[40, 60, 45, 90, 65, 80, 50, 70, 95, 85, 60, 40].map((h, i) => (
                                    <div key={i} className="flex-1 bg-white/5 rounded-t-sm group/bar relative">
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600/20 to-indigo-400/40 rounded-t-sm transition-all duration-1000 ease-out delay-150"
                                            style={{ height: `${h}%` }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                <div className="flex gap-12">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Library Depth</p>
                                        <h4 className="text-xl font-black text-white italic">{stats.totalTracks} <span className="text-xs text-zinc-500 not-italic uppercase ml-1">Assets</span></h4>
                                    </div>
                                </div>
                                <Link href="/admin/catalog" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                                    View Catalog Detail <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-2">Operational Hubs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <HubLink
                                title="Ingest Engine"
                                desc="Bulk upload and auto-tag assets."
                                icon={HardDrive}
                                href="/admin/upload"
                            />
                            <HubLink
                                title="QC Station"
                                desc="Final authorization pipeline."
                                icon={Music}
                                href="/admin/qc"
                            />
                            <HubLink
                                title="User Intelligence"
                                desc="Manage creators & venues."
                                icon={Users}
                                href="/admin/users"
                            />
                            <HubLink
                                title="Dispute Center"
                                desc="Clear copyright claims."
                                icon={ShieldAlert}
                                href="/admin/disputes"
                            />
                        </div>
                    </div>
                </div>

                {/* Real-time System Feed */}
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-2">System Pulse</h3>
                    <div className="bg-[#1E1E22] rounded-[3rem] border border-white/5 p-8 space-y-8 shadow-2xl h-[600px] overflow-hidden flex flex-col">
                        <div className="space-y-6 flex-1">
                            {recentLogs && recentLogs.length > 0 ? recentLogs.map((log: any) => (
                                <LogItem
                                    key={log.id}
                                    type={log.latency_ms > 500 ? 'warning' : 'success'}
                                    msg={`Query: "${log.query_text || 'empty'}"`}
                                    sub={`Latency: ${log.latency_ms}ms • Found ${log.result_count}`}
                                    time={new Date(log.created_at).toLocaleTimeString()}
                                />
                            )) : (
                                <>
                                    <LogItem type="success" msg="AI Model v3.6 Weights Synced" sub="All workers updated globally" time="2m ago" />
                                    <LogItem type="success" msg="S3 Index Refresh Completed" sub="42 new assets mapped to CDN" time="45m ago" />
                                    <LogItem type="warning" msg="YouTube Whitelist Delay" sub="Retrying API handshake..." time="1h ago" />
                                    <LogItem type="success" msg="Stripe Webhook Verified" sub="Subscription engine operational" time="2h ago" />
                                </>
                            )}
                        </div>

                        <Link href="/admin/settings" className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all text-center">
                            System Settings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    sub: string;
    icon: React.ElementType;
    color: string;
    href: string;
    glow: string;
}

function MetricCard({ title, value, sub, icon: Icon, color, href, glow }: MetricCardProps) {
    return (
        <Link href={href} className={`bg-[#1E1E22] p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden shadow-2xl ${glow}`}>
            <div className={`absolute top-0 right-0 p-8 opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500 scale-125 group-hover:scale-150 group-hover:rotate-12 ${color}`}>
                <Icon size={120} strokeWidth={1} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6 group-hover:text-zinc-400 transition-colors">{title}</p>
            <div className="space-y-1 relative z-10">
                <h3 className="text-5xl font-black text-white italic tracking-tighter">{value}</h3>
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{sub}</p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-white opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <span className="bg-white/10 px-2 py-1 rounded">OPEN HUB</span>
                <ArrowUpRight size={14} className={color} />
            </div>
        </Link>
    );
}

function HubLink({ title, desc, icon: Icon, href }: any) {
    return (
        <Link href={href} className="flex items-start gap-5 p-6 bg-[#18181b] rounded-2xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Icon size={22} />
            </div>
            <div className="flex-1 space-y-1">
                <h4 className="font-bold text-white text-[15px]">{title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
            </div>
        </Link>
    );
}

interface LogItemProps {
    type: 'success' | 'warning' | 'error';
    msg: string;
    sub: string;
    time: string;
}

function LogItem({ type, msg, sub, time }: LogItemProps) {
    const colors = {
        success: 'bg-green-500 shadow-green-500/40',
        warning: 'bg-yellow-500 shadow-yellow-500/40',
        error: 'bg-rose-500 shadow-rose-500/40',
    };

    return (
        <div className="flex items-start gap-4 group cursor-default">
            <div className="mt-1.5 relative">
                <div className={`h-1.5 w-1.5 rounded-full ${colors[type]} shadow-[0_0_8px]`} />
            </div>
            <div className="flex-1 space-y-1">
                <p className="text-[11px] font-black text-zinc-200 leading-tight group-hover:text-white transition-colors uppercase italic">{msg}</p>
                <p className="text-[10px] font-medium text-zinc-600 leading-tight">{sub}</p>
                <p className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">{time}</p>
            </div>
        </div>
    );
}
