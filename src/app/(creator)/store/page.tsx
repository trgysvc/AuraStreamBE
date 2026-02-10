'use client';

import React, { useState, useEffect } from 'react';
import { getStoreTracks_Action, StoreTrack } from '@/app/actions/store';
import { TrackRow } from '@/components/feature/store/TrackRow';
import { Search, Flame, Cloud, Zap, Cpu, Waves, Sparkles } from 'lucide-react';

const MOODS = [
    { id: 'cinematic', name: 'Cinematic', icon: <Sparkles />, color: 'from-amber-500/20 to-orange-500/20', img: '🎬' },
    { id: 'ambient', name: 'Ambient', icon: <Cloud />, color: 'from-blue-500/20 to-cyan-500/20', img: '☁️' },
    { id: 'cyberpunk', name: 'Cyberpunk', icon: <Zap />, color: 'from-violet-500/20 to-purple-500/20', img: '⚡' },
    { id: 'meditation', name: 'Zen', icon: <Waves />, color: 'from-emerald-500/20 to-teal-500/20', img: '🧘' },
    { id: 'energy', name: 'Epic', icon: <Flame />, color: 'from-red-500/20 to-orange-500/20', img: '🔥' },
];

export default function CreatorStore() {
    const [tracks, setTracks] = useState<StoreTrack[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracks = async () => {
            setLoading(true);
            const data = await getStoreTracks_Action();
            setTracks(data);
            setLoading(false);
        };
        fetchTracks();
    }, []);

    return (
        <div className="relative min-h-screen bg-zinc-950 pb-32 overflow-hidden">
            {/* 1. Aurora Background Hero */}
            <div className="relative h-[45vh] w-full flex flex-col items-center justify-center px-6 border-b border-white/5">
                <div className="aurora-bg" />
                
                <div className="relative z-10 text-center max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                        TELL YOUR STORY WITH <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">AURA</span>
                    </h1>
                    
                    {/* Glass Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-violet-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl">
                            <Search className="ml-4 text-zinc-500" />
                            <input 
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="What kind of story are you telling today?"
                                className="w-full bg-transparent px-4 py-4 text-white focus:outline-none placeholder:text-zinc-600"
                            />
                            <button className="bg-white text-black font-bold px-6 py-3 rounded-xl mr-1 hover:bg-violet-500 hover:text-white transition-all">
                                SEARCH
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 relative z-10">
                {/* 2. Visual Mood Grid (Instagram Discover Style) */}
                <section className="mb-16">
                    <h3 className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-bold mb-6">Discover by Vibe</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {MOODS.map((mood) => (
                            <div 
                                key={mood.id}
                                className={`
                                    mood-card relative aspect-square rounded-2xl border border-white/5 cursor-pointer 
                                    bg-gradient-to-br ${mood.color} flex flex-col items-center justify-center
                                `}
                            >
                                <div className="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">{mood.img}</div>
                                <span className="text-sm font-bold text-white uppercase tracking-wider">{mood.name}</span>
                                <div className="absolute top-3 right-3 text-white/20">{mood.icon}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. The Track Feed (Spotify Style) */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-bold">Latest Harmonics</h3>
                        <div className="flex gap-4 text-[10px] font-bold text-zinc-500">
                            <span className="hover:text-white cursor-pointer transition-colors">POPULAR</span>
                            <span className="text-white border-b border-white">NEWEST</span>
                            <span className="hover:text-white cursor-pointer transition-colors">AI-CURATED</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {tracks.map((track) => (
                                <TrackRow key={track.id} track={track} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
