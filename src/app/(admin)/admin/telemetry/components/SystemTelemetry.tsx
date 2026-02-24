'use client';

import React, { useEffect, useState } from 'react';
import {
    Cpu,
    Activity,
    CheckCircle2,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { getSystemTelemetry_Action } from '@/app/actions/admin-telemetry';

export function SystemTelemetry() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchSystemData = async () => {
        setLoading(true);
        try {
            const res = await getSystemTelemetry_Action();
            setData(res);
        } catch (err) {
            console.error('System Telemetry Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemData();
        const interval = setInterval(fetchSystemData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) {
        return (
            <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="animate-spin text-cyan-500" size={30} />
                <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Real-time Pipeline...</p>
            </div>
        );
    }

    const { kpis, timeSeries } = data || {
        kpis: { workerLoad: 68, pendingQueue: 0, successfulToday: 0, criticalErrors: 0 },
        timeSeries: []
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Active Worker Load"
                    value={`${kpis.workerLoad}%`}
                    icon={Cpu}
                    color="text-cyan-500"
                    trend="Stable"
                />
                <KPICard
                    title="Pending Queue"
                    value={kpis.pendingQueue}
                    icon={Activity}
                    color="text-amber-500"
                    trend={kpis.pendingQueue > 50 ? 'High' : 'Normal'}
                />
                <KPICard
                    title="Successful Today"
                    value={kpis.successfulToday}
                    icon={CheckCircle2}
                    color="text-emerald-500"
                    trend={`+${kpis.successfulToday}`}
                />
                <KPICard
                    title="Critical Errors"
                    value={kpis.criticalErrors}
                    icon={AlertTriangle}
                    color="text-rose-500"
                    trend={kpis.criticalErrors > 0 ? 'Warning' : 'Healthy'}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Processing Speed Chart */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Processing Speed</h3>
                            <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest leading-none">Throughput / Last 24h</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {loading && <RefreshCw size={10} className="animate-spin text-zinc-600" />}
                            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                                <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">Live Stream</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeSeries}>
                                <defs>
                                    <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#444"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#444"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                                    itemStyle={{ color: '#06b6d4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="processed"
                                    stroke="#06b6d4"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSpeed)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Error Rate Chart */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">System Error Rate</h3>
                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest leading-none">Detection / Last 24h</p>
                        </div>
                        <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Global Scan</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#444"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#444"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                                    itemStyle={{ color: '#f43f5e' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="errors"
                                    stroke="#f43f5e"
                                    strokeWidth={3}
                                    dot={{ fill: '#f43f5e', r: 4 }}
                                    activeDot={{ r: 6, stroke: '#f43f5e', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, trend }: any) {
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
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${trend === 'Warning' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                            trend === 'High' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        }`}>
                        {trend}
                    </span>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{title}</p>
                    <h4 className="text-3xl font-black text-white italic tracking-tighter">{value}</h4>
                </div>
            </div>
        </div>
    );
}
