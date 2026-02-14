'use client';

import React, { useEffect, useState } from 'react';
import { 
    Activity, 
    BarChart3, 
    Globe, 
    Search, 
    SkipForward, 
    Zap, 
    Clock, 
    MousePointer2,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { getTelemetryData_Action } from '@/app/actions/admin-telemetry';

export default function TelemetryReportPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getTelemetryData_Action();
            setData(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="animate-spin text-indigo-500" size={40} />
                <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-xs">Syncing Factory Telemetry...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">System Telemetry</h1>
                    <p className="text-zinc-500 font-medium mt-1">Real-time signal monitoring and AI adaptation logs.</p>
                </div>
                <button 
                    onClick={fetchData}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Force Refresh
                </button>
            </div>

            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Aura Pulse" 
                    value={`${data?.summary.totalPlays || 0}`} 
                    sub="Active Playbacks" 
                    icon={Activity} 
                    color="text-indigo-500" 
                />
                <StatCard 
                    title="Mood Matcher" 
                    value={`${data?.summary.skipRate || 0}%`} 
                    sub="Skip Rate (Mismatch)" 
                    icon={SkipForward} 
                    color="text-pink-500" 
                />
                <StatCard 
                    title="Molecular Focus" 
                    value={`${data?.summary.tuningStats['432hz'] || 0}`} 
                    sub="432Hz Healing Cycles" 
                    icon={Zap} 
                    color="text-amber-500" 
                />
                <StatCard 
                    title="Geo Distribution" 
                    value={`${Object.keys(data?.summary.regionStats || {}).length}`} 
                    sub="Active Regions" 
                    icon={Globe} 
                    color="text-blue-500" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2. Recent Playback Stream */}
                <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 p-8 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2">
                        <BarChart3 size={14} /> Playback Telemetry
                    </h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                        {data?.playbackSessions.map((session: any) => (
                            <div key={session.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-white italic truncate w-48">{session.tracks?.title || 'Unknown Track'}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black uppercase text-zinc-600 px-1.5 py-0.5 bg-white/5 rounded">{session.region}</span>
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${session.tuning_used === '440hz' ? 'bg-zinc-800 text-zinc-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                            {session.tuning_used}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-black text-zinc-400">{session.duration_listened}s</p>
                                    {session.skipped && (
                                        <div className="flex items-center gap-1 justify-end">
                                            <AlertCircle size={8} className="text-pink-500" />
                                            <span className="text-[8px] font-black text-pink-500 uppercase">Skipped</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Search Intelligence & UI Logs */}
                <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 p-8 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2">
                        <Search size={14} /> Search Intelligence
                    </h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                        {data?.searchLogs.map((log: any) => (
                            <div key={log.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-zinc-200 uppercase italic">
                                        {log.query_text.startsWith('UI_INTERACTION') ? (
                                            <span className="text-amber-500 flex items-center gap-1"><MousePointer2 size={10} /> {log.query_text.replace('UI_INTERACTION: ', '')}</span>
                                        ) : (
                                            log.query_text
                                        )}
                                    </p>
                                    <span className="text-[8px] font-black text-zinc-700">{new Date(log.created_at).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {log.latency_ms > 0 && <span className="text-[8px] font-bold text-zinc-500">Latency: {log.latency_ms}ms</span>}
                                    {log.result_count === 0 && !log.query_text.includes('UI') && (
                                        <span className="text-[8px] font-black text-orange-500 uppercase">Aura Tailor Opp</span>
                                    )}
                                    {log.filters_used?.region && (
                                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{log.filters_used.region}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, sub, icon: Icon, color }: any) {
    return (
        <div className="bg-[#1E1E22] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-2xl">
            <div className={`absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-500 ${color}`}>
                <Icon size={100} strokeWidth={1} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6">{title}</p>
            <div className="space-y-1 relative z-10">
                <h3 className="text-4xl font-black text-white italic tracking-tighter">{value}</h3>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{sub}</p>
            </div>
        </div>
    );
}
