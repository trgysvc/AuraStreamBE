'use client';

import { useState } from 'react';
import TrackRow from '@/components/dashboard/TrackRow';
import { Search, ChevronDown, Sliders } from 'lucide-react';

export default function DashboardPage() {
    const tracks = [
        { title: "Neon Nights", artist: "Synthwave Boy", duration: "3:45", bpm: 120, tags: ["Electronic", "Retro"] },
        { title: "Mountain Peak", artist: "Nature Sounds", duration: "4:12", bpm: 85, tags: ["Ambient", "Chill"] },
        { title: "City Hustle", artist: "Urban Beats", duration: "2:50", bpm: 95, tags: ["Hip Hop", "Energetic"] },
        { title: "Deep Focus", artist: "Brainwaves", duration: "5:30", bpm: 60, tags: ["Study", "Focus"] },
        { title: "Summer Vibes", artist: "Pop Star", duration: "3:15", bpm: 128, tags: ["Pop", "Happy"] },
        { title: "Dark Matter", artist: "Space Explorer", duration: "4:05", bpm: 140, tags: ["Cinematic", "Sci-Fi"] },
        { title: "Acoustic Morning", artist: "Guitar Hero", duration: "3:20", bpm: 100, tags: ["Acoustic", "Folk"] },
        { title: "Night Drive", artist: "Nightcrawler", duration: "3:55", bpm: 110, tags: ["Synthwave", "Driving"] },
    ];

    return (
        <div className="space-y-8">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Browse Catalog</h1>
                    <p className="text-gray-400">Find the perfect sound for your next project.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search tracks, artists, or albums..."
                        className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-transparent focus:border-white/20 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-0 transition-colors"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-white/10">
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-sm font-medium transition-colors">
                    <Sliders size={16} />
                    Filters
                </button>
                <div className="h-6 w-px bg-white/10 mx-2" />
                {['Mood', 'Genre', 'Vocals', 'Length', 'BPM'].map((filter) => (
                    <button key={filter} className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-white/5 rounded-full text-sm transition-colors border border-white/10">
                        {filter}
                        <ChevronDown size={14} className="text-gray-500" />
                    </button>
                ))}
            </div>

            {/* Track List Header */}
            <div className="hidden md:flex items-center px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="w-10"></div> {/* Play button space */}
                <div className="flex-1">Title / Artist</div>
                <div className="flex-1">Waveform</div>
                <div className="w-64 flex justify-end gap-16 pr-12">
                    <span>Tags</span>
                    <span>BPM</span>
                    <span>Time</span>
                </div>
                <div className="w-24">Actions</div>
            </div>

            {/* Tracks */}
            <div className="space-y-1">
                {tracks.map((track, i) => (
                    <TrackRow key={i} {...track} />
                ))}
            </div>
        </div>
    );
}
