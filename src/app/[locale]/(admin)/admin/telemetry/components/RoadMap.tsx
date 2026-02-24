'use client';

import React, { useEffect, useState } from 'react';
import {
    Compass,
    Skull,
    Trash2,
    SearchX,
    Zap,
    PieChart as PieIcon,
    TrendingDown,
    Activity,
    RefreshCw,
    AlertCircle,
    Target
} from 'lucide-react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { getRoadmapTelemetry_Action } from '@/app/actions/telemetry-roadmap';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

export function RoadMap() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const fetchRoadmapData = async () => {
        setLoading(true);
        try {
            const res = await getRoadmapTelemetry_Action();
            setData(res);
        } catch (err) {
            console.error('Roadmap Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 200);
        fetchRoadmapData();
        const interval = setInterval(fetchRoadmapData, 300000); // 5 mins
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    if (loading && !data) {
        return (
            <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="animate-spin text-indigo-500" size={30} />
                <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Processing AI Production Compass...</p>
            </div>
        );
    }

    const { contentHealth, aiRadar, salesDev } = data || {
        contentHealth: { toxicTracks: [], globalBlacklist: [], deadCatalog: [] },
        aiRadar: { zeroSearches: [], scatterData: [], genreGap: [] },
        salesDev: { venueSegmentData: [], stability: '0 Hours' }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Zone A: Content Pruning & Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ContentWidget
                    title="Toxic Track Index"
                    icon={Skull}
                    color="text-rose-500"
                    items={contentHealth.toxicTracks}
                    format="skipRate"
                    sub="High Skip Rate < 15s"
                />
                <ContentWidget
                    title="Global Blacklist"
                    icon={AlertCircle}
                    color="text-amber-500"
                    items={contentHealth.globalBlacklist}
                    format="count"
                    sub="Explicitly Blocked by Venues"
                />
                <ContentWidget
                    title="Dead Catalog"
                    icon={Trash2}
                    color="text-zinc-500"
                    items={contentHealth.deadCatalog}
                    format="age"
                    sub="No plays in 60+ days"
                />
            </div>

            {/* Zone B: AI Production Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* BPM/Energy Stickiness Scatter */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Stickiness Factor</h3>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">BPM vs. Energy vs. Duration Correlation</p>
                        </div>
                        <Target size={18} className="text-indigo-500/50" />
                    </div>

                    <div className="h-[350px] w-full">
                        {mounted && (
                            <ResponsiveContainer width="100%" height={350} debounce={1}>
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                    <XAxis type="number" dataKey="bpm" name="BPM" stroke="#444" fontSize={10} unit="bpm" />
                                    <YAxis type="number" dataKey="duration" name="Duration" stroke="#444" fontSize={10} unit="s" />
                                    <ZAxis type="number" dataKey="energy" range={[50, 400]} name="Energy" />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }} />
                                    <Scatter name="Tracks" data={aiRadar.scatterData} fill="#6366f1" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* AI Generation Feed (Zero-Result Searches) */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl overflow-hidden relative">
                    <div className="absolute -right-20 -top-20 opacity-[0.05] text-indigo-500">
                        <SearchX size={300} strokeWidth={1} />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">AI Production Intent</h3>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Live Zero-Result Search Feed</p>
                        </div>
                        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">Production Queue</span>
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                        {aiRadar.zeroSearches.length > 0 ? aiRadar.zeroSearches.map((log: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
                                <p className="text-xs font-bold text-white italic">"{log.query_text}"</p>
                                <span className="text-[8px] font-black text-zinc-600 uppercase">{new Date(log.created_at).toLocaleTimeString()}</span>
                            </div>
                        )) : (
                            <p className="text-[10px] text-zinc-500 font-bold uppercase text-center py-20">No zero-result searches today</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Zone C: Sales & Business Dev */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Consumption by Venue Type */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Segment Consumption</h3>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Usage Distribution by Venue Industry</p>
                        </div>
                        <PieIcon size={18} className="text-emerald-500/50" />
                    </div>

                    <div className="h-[300px] w-full flex items-center">
                        {mounted && (
                            <ResponsiveContainer width="100%" height={300} debounce={1}>
                                <PieChart>
                                    <Pie
                                        data={salesDev.venueSegmentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {salesDev.venueSegmentData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }} />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Platform Stability KPI */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-10 shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.02]">
                        <Activity size={400} />
                    </div>
                    <div className="p-6 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20">
                        <Activity size={48} className="text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-6xl font-black text-white italic tracking-tighter">{salesDev.stability}</h4>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Average Daily Session Length / Venue</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-white/5">
                        <Zap size={12} className="text-amber-500" />
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Platform Core Integrity: High</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContentWidget({ title, icon: Icon, color, items, format, sub }: any) {
    return (
        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 ${color}`}>
                <Icon size={120} strokeWidth={1} />
            </div>

            <div className="space-y-2 relative z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">{title}</h3>
                <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{sub}</p>
            </div>

            <div className="space-y-3 relative z-10">
                {items.length > 0 ? items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group/item hover:border-white/10 transition-all">
                        <div className="truncate flex-1">
                            <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{item.artist}</p>
                        </div>
                        <div className="text-right ml-3">
                            <span className={`text-[10px] font-black ${color} italic`}>
                                {item[format]}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="py-10 text-center">
                        <span className="text-[9px] font-bold text-zinc-700 uppercase italic">Safe Ecosystem</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
        </div>
    );
}
