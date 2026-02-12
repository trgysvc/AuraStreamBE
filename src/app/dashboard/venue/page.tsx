'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronDown, Sliders, Play, Plus, Download, MoreHorizontal, Video, ChevronRight, Activity, Music, Sparkles as LucideSparkles, X, Wand2 } from 'lucide-react';
import TrackRow from '@/components/dashboard/TrackRow';
import { createClient } from '@/lib/db/client';
import { searchClient } from '@/lib/search/client';

const PlaylistCard = ({ title, tracks, color, image }: { title: string, tracks: string, color: string, image?: string }) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-square rounded-sm overflow-hidden mb-3">
            {image ? (
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                    style={{ backgroundImage: `url(${image})` }} 
                />
            ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${color} transition-transform duration-500 group-hover:scale-110`} />
            )}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <h4 className="text-[14px] font-bold text-white truncate">{title}</h4>
        <p className="text-[12px] text-zinc-500 font-medium">{tracks}</p>
    </div>
);

export default function VenueDashboardPage() {
    const [activeSubTab, setActiveSubTab] = useState('search');
    const [searchType, setSearchType] = useState('Music');
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [query, setQuery] = useState('');
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [bpmRange, setBpmRange] = useState([60, 180]);
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

    const supabase = useMemo(() => createClient(), []);
    const meiliIndex = useMemo(() => searchClient.index('tracks'), []);

    const performSearch = useCallback(async (searchQuery: string, currentBpm: number[], currentMoods: string[]) => {
        setLoading(true);
        try {
            const filterArray = [];
            
            if (currentBpm) {
                filterArray.push(`bpm >= ${currentBpm[0]} AND bpm <= ${currentBpm[1]}`);
            }
            if (currentMoods.length > 0) {
                const moodFilter = currentMoods.map((m: string) => `mood_tags = "${m}"`).join(' OR ');
                filterArray.push(`(${moodFilter})`);
            }

            if (!searchQuery.trim() && filterArray.length === 0) {
                const { data, error } = await supabase
                    .from('tracks')
                    .select('*')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                setTracks(data.map(formatTrack));
            } else {
                const results = await meiliIndex.search(searchQuery, {
                    limit: 30,
                    filter: filterArray.length > 0 ? filterArray.join(' AND ') : undefined
                });
                setTracks(results.hits.map(formatTrack));
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }, [supabase, meiliIndex]);

    // Fixed: Debounced effect with stable dependencies
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query, bpmRange, selectedMoods);
        }, 400);
        return () => clearTimeout(timer);
    }, [query, bpmRange, selectedMoods, performSearch]);

    const handleSimilar = (id: string) => {
        const targetTrack = tracks.find(t => t.id === id);
        if (!targetTrack) return;
        setQuery(targetTrack.tags[0] || targetTrack.title);
        setShowFilters(false);
    };

    function formatTrack(t: any) {
        return {
            id: t.id,
            title: t.title,
            artist: t.artist,
            duration: t.duration_sec ? `${Math.floor(t.duration_sec / 60)}:${(t.duration_sec % 60).toString().padStart(2, '0')}` : "3:00",
            bpm: t.bpm || 120,
            tags: t.mood_tags?.length ? t.mood_tags : [t.genre || "Music", "General"],
            image: t.cover_image_url
        };
    }

    const moods = ['Happy', 'Melancholic', 'Energetic', 'Dark', 'Cinematic', 'Chill', 'Aggressive', 'Hopeful'];

    const playlists = [
        { title: "Picked for you", tracks: "Sizin için seçtiklerimiz", color: "bg-[#FF5533]" },
        { title: "Now Trending", tracks: "35 tracks", color: "bg-[#FF77AA]" },
        { title: "Epidemic Essentials", tracks: "24 playlists", color: "bg-[#AAAAAA]" },
        { title: "Creator's Picks", tracks: "117 playlists", color: "bg-[#4499FF]" },
        { title: "Championships", tracks: "35 tracks", color: "bg-[#FFCC44]" },
        { title: "Sports & Action", tracks: "8 playlists", color: "bg-[#9966FF]" },
    ];

    return (
        <div className="flex flex-col gap-12 pb-20 max-w-[1600px] mx-auto">
            {/* Header & Search */}
            <div className="space-y-10">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setActiveSubTab('search')}
                        className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all shadow-lg ${activeSubTab === 'search' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white bg-white/5'}`}
                    >
                        Search
                    </button>
                    <button 
                        onClick={() => setActiveSubTab('assistant')}
                        className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all shadow-lg ${activeSubTab === 'assistant' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white bg-white/5'}`}
                    >
                        Assistant
                    </button>
                </div>

                <div className="flex items-stretch bg-[#1E1E22] rounded-lg overflow-visible relative z-[100] h-16 border border-white/5 shadow-2xl">
                    <div className="relative h-full flex items-center border-r border-white/5">
                        <button 
                            type="button"
                            onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
                            className="px-8 h-full flex items-center gap-3 hover:bg-white/5 transition-colors group min-w-[180px]"
                        >
                            <span className="text-[14px] font-bold text-white">{searchType}</span>
                            <ChevronDown size={18} className={`text-zinc-500 group-hover:text-white transition-all ${isSearchDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isSearchDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-[110]" onClick={() => setIsSearchDropdownOpen(false)} />
                                <div className="absolute top-full left-0 mt-2 w-56 bg-[#1E1E22] border border-white/10 rounded-xl shadow-2xl z-[120] py-2 overflow-hidden">
                                    {['Music', 'Sound Effects'].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => { setSearchType(option); setIsSearchDropdownOpen(false); }}
                                            className="w-full text-left px-5 py-3 text-[14px] font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex-1 flex items-center px-8 h-full relative">
                        <Search size={20} className="absolute left-8 text-zinc-600" />
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={activeSubTab === 'assistant' ? "Explain the vibe you want..." : "Search by mood, genre, energy..."}
                            className="w-full bg-transparent text-white focus:outline-none text-[16px] h-full pl-10 placeholder-zinc-700"
                        />
                    </div>
                    <div className="bg-white/5 text-zinc-600 px-10 flex items-center justify-center opacity-40 border-l border-white/5">
                        <Music size={24} />
                    </div>
                </div>
            </div>

            <div className="flex gap-10 items-start">
                <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white">
                                {query ? `Aura Results for "${query}"` : 'Recommended tracks'}
                            </h2>
                            <p className="text-[14px] text-zinc-500 mt-1 font-medium">
                                {loading ? 'Aura is analyzing...' : `Discovering ${tracks.length} unique sounds.`}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${showFilters ? 'bg-white text-black border-white' : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:text-white hover:bg-zinc-800'}`}
                            >
                                <Sliders size={14} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-white/5 bg-zinc-900/5 rounded-3xl overflow-hidden min-h-[500px]">
                        {loading && tracks.length === 0 ? (
                            <div className="py-40 flex flex-col items-center justify-center space-y-6 opacity-30">
                                <div className="h-10 w-10 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                                <p className="text-[11px] font-black uppercase tracking-[0.3em]">Processing Aura Query</p>
                            </div>
                        ) : tracks.length > 0 ? (
                            tracks.map((track) => (
                                <TrackRow key={track.id} {...track} onSimilar={handleSimilar} />
                            ))
                        ) : (
                            <div className="py-40 text-center flex flex-col items-center space-y-4 opacity-40">
                                <LucideSparkles size={64} strokeWidth={1} />
                                <p className="text-xl font-bold">No matches found</p>
                            </div>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className="w-80 space-y-10 animate-in slide-in-from-right duration-500 sticky top-24">
                        <div className="p-8 rounded-3xl bg-[#1E1E22] border border-white/5 space-y-10 shadow-2xl">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Tempo (BPM)</h3>
                                    <span className="text-white text-xs font-bold">{bpmRange[0]} - {bpmRange[1]}</span>
                                </div>
                                <input 
                                    type="range" min="60" max="180" step="5"
                                    value={bpmRange[1]}
                                    onChange={(e) => setBpmRange([bpmRange[0], parseInt(e.target.value)])}
                                    className="w-full accent-white opacity-70 hover:opacity-100 transition-opacity"
                                />
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Mood / Vibe</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {moods.map(mood => (
                                        <button 
                                            key={mood}
                                            onClick={() => setSelectedMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood])}
                                            className={`px-4 py-3 rounded-xl text-[12px] font-bold transition-all border ${selectedMoods.includes(mood) ? 'bg-white text-black border-white shadow-xl scale-105' : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            {mood}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={() => { setBpmRange([60, 180]); setSelectedMoods([]); setQuery(''); }}
                                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-white/5"
                            >
                                Reset All
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-8 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black tracking-tight text-white">Featured playlists</h2>
                    <button className="text-[11px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em]">View all</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {playlists.map((playlist, i) => (
                        <PlaylistCard key={i} {...playlist} />
                    ))}
                </div>
            </div>
        </div>
    );
}
