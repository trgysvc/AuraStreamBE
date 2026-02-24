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
    AlertCircle,
    LayoutDashboard,
    Music2,
    Compass
} from 'lucide-react';
import { getTelemetryData_Action } from '@/app/actions/admin-telemetry';
import { SystemTelemetry } from './components/SystemTelemetry';
import { MusicTelemetry } from './components/MusicTelemetry';
import { VenueAnalytics } from './components/VenueAnalytics';
import { RoadMap } from './components/RoadMap';

export default function TelemetryReportPage() {
    const [activeTab, setActiveTab] = useState<'system' | 'music' | 'venue' | 'roadmap'>('system');
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
        if (activeTab === 'music' && !data) {
            fetchData();
        }
    }, [activeTab]);

    const TabButton = ({ id, label, icon: Icon }: { id: 'system' | 'music' | 'venue' | 'roadmap', label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-500 border-2 ${activeTab === id
                ? 'bg-indigo-500/10 border-indigo-500/40 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10 hover:text-zinc-300'
                }`}
        >
            <Icon size={18} className={activeTab === id ? 'text-indigo-500' : 'text-zinc-600'} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 space-y-12 pb-20 animate-in fade-in duration-1000">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                            <Activity size={20} strokeWidth={3} />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Telemetri Dashboard</h1>
                    </div>
                    <p className="text-zinc-500 font-medium uppercase tracking-widest text-[9px] ml-1">Command Center Signal Monitoring & Protocol Logs</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Force Sync
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-4 p-2 bg-black/40 rounded-[2.5rem] border border-white/5 inline-flex">
                <TabButton id="system" label="1. System Telemetry" icon={LayoutDashboard} />
                <TabButton id="music" label="2. Music Telemetry" icon={Music2} />
                <TabButton id="venue" label="3. Venue Analytics" icon={Globe} />
                <TabButton id="roadmap" label="4. Road Map" icon={Compass} />
            </div>

            {/* Dynamic Content */}
            <div className="mt-12">
                {activeTab === 'system' && <SystemTelemetry />}
                {activeTab === 'music' && <MusicTelemetry />}
                {activeTab === 'venue' && <VenueAnalytics />}
                {activeTab === 'roadmap' && <RoadMap />}
            </div>
        </div>
    );
}

function MusicTelemetryView({ data, loading }: any) {
    if (loading && !data) {
        return (
            <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="animate-spin text-indigo-500" size={30} />
                <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Filtering Sonic Frequencies...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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
                <div className="bg-[#111] rounded-[2.5rem] border border-white/5 p-8 space-y-6 shadow-2xl">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2">
                        <BarChart3 size={14} /> Playback Stream
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
                <div className="bg-[#111] rounded-[2.5rem] border border-white/5 p-8 space-y-6 shadow-2xl">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2">
                        <Search size={14} /> Intelligence Logs
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
        <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-2xl">
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
