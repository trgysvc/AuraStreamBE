import { createClient } from '@/lib/db/server';
import { Card } from '@/components/shared/Card';
import { 
    Activity, 
    Music, 
    Users, 
    ShieldAlert, 
    HardDrive, 
    BarChart3, 
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

async function getAdminData() {
    const supabase = createClient();

    const [
        { count: pendingTracks },
        { count: totalUsers },
        { count: activeVenues },
        { count: openDisputes }
    ] = await Promise.all([
        supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'pending_qc'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('venues').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    return {
        stats: {
            pendingTracks: pendingTracks || 0,
            totalUsers: totalUsers || 0,
            activeVenues: activeVenues || 0,
            openDisputes: openDisputes || 0
        }
    };
}

export default async function AdminDashboard() {
    const { stats } = await getAdminData();

    return (
        <div className="space-y-10 pb-20">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Admin Factory</h1>
                    <p className="text-zinc-500 font-medium mt-1">Unified Command Center for Sonaraura Operations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">System Online</span>
                    </div>
                </div>
            </div>

            {/* 2. Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Queue (QC)" 
                    value={stats.pendingTracks.toString()} 
                    sub="Tracks waiting" 
                    icon={Clock}
                    color="text-yellow-500"
                    href="/admin/qc"
                />
                <MetricCard 
                    title="Active Venues" 
                    value={stats.activeVenues.toString()} 
                    sub="Verified partners" 
                    icon={Activity}
                    color="text-indigo-500"
                    href="/admin/venues"
                />
                <MetricCard 
                    title="Open Disputes" 
                    value={stats.openDisputes.toString()} 
                    sub="Action required" 
                    icon={ShieldAlert}
                    color="text-rose-500"
                    href="/admin/disputes"
                />
                <MetricCard 
                    title="Total Ecosystem" 
                    value={stats.totalUsers.toString()} 
                    sub="Profiles registered" 
                    icon={Users}
                    color="text-zinc-400"
                    href="/admin/users"
                />
            </div>

            {/* 3. Operational Hubs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Content Factory */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Operational Hubs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <HubLink 
                            title="Production QC" 
                            desc="Review and normalize AI generated tracks." 
                            icon={Music} 
                            href="/admin/qc"
                        />
                        <HubLink 
                            title="Bulk Upload" 
                            desc="Ingest external catalogs into the S3 factory." 
                            icon={HardDrive} 
                            href="/admin/upload"
                        />
                        <HubLink 
                            title="Venue Management" 
                            desc="Verify and manage B2B commercial licenses." 
                            icon={ShieldAlert} 
                            href="/admin/venues"
                        />
                        <HubLink 
                            title="System Health" 
                            desc="Monitor AWS SQS, Lambda and API status." 
                            icon={Activity} 
                            href="/admin/health"
                        />
                    </div>
                </div>

                {/* System Alerts / Logs */}
                <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Live Notifications</h3>
                    <div className="bg-[#1E1E22] rounded-3xl border border-white/5 p-6 space-y-4">
                        <LogItem type="success" msg="Model extraction completed for ID: 49x8" time="2m ago" />
                        <LogItem type="warning" msg="S3 Bucket near storage threshold" time="1h ago" />
                        <LogItem type="error" msg="Signed URL generation failed for track_77" time="3h ago" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, sub, icon: Icon, color, href }: any) {
    return (
        <Link href={href} className="bg-[#1E1E22] p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={80} strokeWidth={1} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">{title}</p>
            <div className="space-y-1">
                <h3 className="text-4xl font-black text-white">{value}</h3>
                <p className="text-xs font-medium text-zinc-600">{sub}</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-all">
                MANAGE <ArrowUpRight size={12} />
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

function LogItem({ type, msg, time }: any) {
    const icons = {
        success: <CheckCircle2 size={14} className="text-green-500" />,
        warning: <AlertCircle size={14} className="text-yellow-500" />,
        error: <AlertCircle size={14} className="text-rose-500" />,
    };

    return (
        <div className="flex items-start gap-3 py-1">
            <div className="mt-0.5">{icons[type as keyof typeof icons]}</div>
            <div className="flex-1 space-y-0.5">
                <p className="text-[11px] font-bold text-zinc-300 leading-tight">{msg}</p>
                <p className="text-[9px] font-medium text-zinc-600">{time}</p>
            </div>
        </div>
    );
}
