'use client';

import React, { useEffect, useState } from 'react';
import {
    PlayCircle,
    SkipForward,
    ThumbsUp,
    SearchX,
    TrendingUp,
    Music2,
    Zap,
    RefreshCw
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { getMusicTelemetry_Action } from '@/app/actions/telemetry-music';

export function MusicTelemetry() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchMusicData = async () => {
        setLoading(true);
        try {
            const res = await getMusicTelemetry_Action();
            setData(res);
        } catch (err) {
            console.error('Music Telemetry Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMusicData();
        const interval = setInterval(fetchMusicData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) {
        return (
            <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="animate-spin text-pink-500" size={30} />
                <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Filtering Sonic Frequencies...</p>
            </div>
        );
    }

    const { kpis, genrePopularity, highlySkippedTracks, engagementTrends } = data || {
        kpis: { totalStreams24h: 0, skipRate: '0', topGenre: 'None', zeroResultSearches24h: 0 },
        genrePopularity: [],
        highlySkippedTracks: [],
        engagementTrends: []
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MusicKPICard
                    title="Total Streams (24h)"
                    value={kpis.totalStreams24h}
                    icon={PlayCircle}
                    color="text-indigo-500"
                    trend={`Live`}
                />
                <MusicKPICard
                    title="Average Skip Rate"
                    value={`${kpis.skipRate}%`}
                    icon={SkipForward}
                    color="text-pink-500"
                    trend={parseFloat(kpis.skipRate) > 25 ? 'High' : 'Normal'}
                />
                <MusicKPICard
                    title="Top Mood/Genre"
                    value={kpis.topGenre}
                    icon={TrendingUp}
                    color="text-emerald-500"
                    sub="Category Dominance"
                />
                <MusicKPICard
                    title="Zero-Result Searches"
                    value={kpis.zeroResultSearches24h}
                    icon={SearchX}
                    color="text-amber-500"
                    trend={kpis.zeroResultSearches24h > 0 ? 'Review Needed' : 'Healthy'}
                />
            </div>

            {/* Middle Row: Genre Chart & Skip Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Genre BarChart */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Genre Distribution</h3>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Global Playback Popularity</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {loading && <RefreshCw size={10} className="animate-spin text-zinc-600" />}
                            <Music2 size={18} className="text-zinc-700" />
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={genrePopularity} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    stroke="#444"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                                />
                                <Bar
                                    dataKey="plays"
                                    fill="#6366f1"
                                    radius={[0, 10, 10, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skip Analytics Table */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Most Skipped Tracks</h3>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Potential Content Mismatches</p>
                        </div>
                        <Zap size={18} className="text-pink-500/50" />
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {highlySkippedTracks.length > 0 ? highlySkippedTracks.map((track: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white/20 rounded-2xl border border-white/5 group hover:border-pink-500/30 transition-all">
                                <div className="space-y-1 truncate flex-1">
                                    <p className="text-xs font-bold text-white italic truncate">{track.name}</p>
                                    <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest">{track.artist}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-sm font-black text-pink-500 italic leading-none">{track.rate}</p>
                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">{track.count} SKIPS</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center py-20">No skips detected in 24h</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: 7-Day Engagement Chart */}
            <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">7-Day Playback Engagement</h3>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Streams vs. Retention vs. Conversion</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <LegendItem color="bg-indigo-500" label="Streams" />
                        <LegendItem color="bg-pink-500" label="Skips" />
                        <LegendItem color="bg-emerald-500" label="Favorites" />
                    </div>
                </div>

                <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={engagementTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                            <XAxis
                                dataKey="day"
                                stroke="#444"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#444"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="streams"
                                stroke="#6366f1"
                                strokeWidth={4}
                                dot={{ fill: '#6366f1', r: 4 }}
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="skips"
                                stroke="#ec4899"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="faves"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ fill: '#10b981', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function MusicKPICard({ title, value, icon: Icon, color, trend, sub }: any) {
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
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${trend === 'Live' || trend.startsWith('+') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                trend === 'High' || trend.startsWith('-') ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
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

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
        </div>
    );
}
