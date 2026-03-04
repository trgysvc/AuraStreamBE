'use client';

import React, { useEffect, useState } from 'react';
import {
    Users,
    Clock,
    AlertTriangle,
    CreditCard,
    TrendingUp,
    Store,
    Calendar,
    RefreshCw,
    ShieldCheck
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { getVenueTelemetry_Action } from '@/app/actions/telemetry-venue';

export function VenueAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const fetchVenueData = async () => {
        setLoading(true);
        try {
            const res = await getVenueTelemetry_Action();
            setData(res);
        } catch (err) {
            console.error('Venue Analytics Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 200);
        fetchVenueData();
        const interval = setInterval(fetchVenueData, 120000); // Refresh every 2 mins
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    if (loading && !data) {
        return (
            <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="animate-spin text-emerald-500" size={30} />
                <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Analyzing Venue Ecosystem...</p>
            </div>
        );
    }

    const { kpis, peakHours, topPowerUsers, churnWatchlist } = data || {
        kpis: { activeVenues24h: 0, avgDailyPlaytimeHours: '0', atRiskCount: 0, activeSubs: 0 },
        peakHours: [],
        topPowerUsers: [],
        churnWatchlist: []
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <VenueKPICard
                    title="Active Venues Today"
                    value={kpis.activeVenues24h}
                    icon={Store}
                    color="text-emerald-500"
                    trend="Live"
                />
                <VenueKPICard
                    title="Avg Daily Playtime"
                    value={`${kpis.avgDailyPlaytimeHours}h`}
                    icon={Clock}
                    color="text-indigo-500"
                    trend="Per Venue"
                />
                <VenueKPICard
                    title="At-Risk Clients"
                    value={kpis.atRiskCount}
                    icon={AlertTriangle}
                    color="text-rose-500"
                    trend={kpis.atRiskCount > 0 ? 'Warning' : 'Healthy'}
                />
                <VenueKPICard
                    title="Active Subscriptions"
                    value={kpis.activeSubs}
                    icon={ShieldCheck}
                    color="text-amber-500"
                    sub="Valid Licenses"
                />
            </div>

            {/* Middle Row: Peak Hours & Power Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Peak Operating Hours Chart */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Peak Operating Hours</h3>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Global Activity Volume Distribution</p>
                        </div>
                        <Calendar size={18} className="text-zinc-700" />
                    </div>

                    <div className="h-[300px] w-full">
                        {mounted && (
                            <ResponsiveContainer width="100%" height={300} debounce={1}>
                                <BarChart data={peakHours}>
                                    <XAxis
                                        dataKey="hour"
                                        stroke="#444"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                                    />
                                    <Bar
                                        dataKey="volume"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {peakHours.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={parseInt(entry.hour) >= 18 || parseInt(entry.hour) <= 2 ? '#ec4899' : '#10b981'} opacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Top Power Users Table */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Top Power Users</h3>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Highest Playtime / Last 7 Days</p>
                        </div>
                        <TrendingUp size={18} className="text-emerald-500/50" />
                    </div>

                    <div className="space-y-4">
                        {topPowerUsers.length > 0 ? topPowerUsers.map((venue: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white/20 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                                <div className="space-y-1 truncate flex-1">
                                    <p className="text-xs font-bold text-white italic truncate">{venue.name}</p>
                                    <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest leading-none">Global Partner</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-sm font-black text-emerald-500 italic leading-none">{venue.hours}h</p>
                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">TOTAL TIME</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">No activity data found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Churn Risk Watchlist */}
            <div className="bg-[#111] border border-rose-500/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <AlertTriangle size={40} className="text-rose-500/10 animate-pulse" />
                </div>

                <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-rose-500/50">Churn Risk Watchlist</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Venues inactive in the last 48-72 hours</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {churnWatchlist.length > 0 ? churnWatchlist.map((client: any, idx: number) => (
                        <div key={idx} className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl space-y-4 relative group hover:bg-rose-500/10 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                                    <Store size={16} />
                                </div>
                                <span className="text-[9px] font-black text-rose-500 uppercase px-2 py-0.5 bg-rose-500/10 rounded-full border border-rose-500/20">
                                    {client.status}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-white italic">{client.name}</h4>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Last Active: {client.lastPlayed}</p>
                            </div>
                            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white group-hover:bg-rose-500 group-hover:border-rose-500 transition-all">
                                Action Needed
                            </button>
                        </div>
                    )) : (
                        <div className="col-span-full py-12 text-center bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Safe Ecosystem: No churn risk detected</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function VenueKPICard({ title, value, icon: Icon, color, trend, sub }: any) {
    return (
        <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 transition-all hover:bg-[#161618] group relative overflow-hidden shadow-xl">
            <div className={`absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-700 ${color}`}>
                <Icon size={120} strokeWidth={1} />
            </div>

            <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${color}`}>
                        <Icon size={20} />
                    </div>
                    {trend && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${trend === 'Live' || trend === 'Healthy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                            trend === 'Warning' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
                            }`}>
                            {trend}
                        </span>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{title}</p>
                    <h4 className="text-3xl font-black text-white italic tracking-tighter">{value}</h4>
                    {sub && <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{sub}</p>}
                </div>
            </div>
        </div>
    );
}
