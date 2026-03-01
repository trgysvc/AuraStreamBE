'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { Search, ChevronDown, Sliders, Music, Sparkles as LucideSparkles, Play, Plus, Filter, ListMusic, Layers, Check, X, Wand2, Activity, MapPin, Wind, Zap, RefreshCw } from 'lucide-react';
import TrackRow from '@/components/dashboard/TrackRow';
import { getVenueTracks_Action, getCurationCounts_Action } from '@/app/actions/venue';
import { logSearchQuery_Action } from '@/app/actions/elite-analytics';
import { ScheduleManager } from '@/components/feature/venue/ScheduleManager';
import { SmartFlowProvider, useSmartFlow } from '@/context/SmartFlowContext';
import { usePlayer } from '@/context/PlayerContext';
import { createClient } from '@/lib/db/client';
import { useTranslations } from 'next-intl';
import { SimilarityModal } from '@/components/dashboard/SimilarityModal';

const PlaylistCard = ({ title, tracks, color, image, onClick }: { title: string, tracks: string, color: string, image?: string, onClick?: () => void }) => (
    <div className="group cursor-pointer" onClick={onClick}>
        <div className="relative aspect-square rounded-md overflow-hidden mb-1.5 md:mb-2 border border-white/5">
            {image ? (
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${image})` }}
                />
            ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${color} transition-transform duration-500 group-hover:scale-110`} />
            )}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300 border border-white/20">
                    <Play className="text-white fill-current" size={16} />
                </div>
            </div>
        </div>
        <h4 className="text-[10px] md:text-[12px] font-bold text-white truncate group-hover:text-indigo-400 transition-colors tracking-tight">{title}</h4>
        <p className="text-[8px] md:text-[10px] text-zinc-500 font-medium">{tracks}</p>
    </div>
);

function VenueDashboardContent() {
    const t = useTranslations('VenueDashboard');
    const { activeRule } = useSmartFlow();
    const { playTrack } = usePlayer();
    const [activeSubTab, setActiveSubTab] = useState<'search' | 'assistant' | 'flow'>('search');
    const [searchType, setSearchType] = useState('Music');
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [query, setQuery] = useState('');
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [curationCounts, setCurationCounts] = useState<Record<string, number>>({});

    // Similarity Engine Modal State
    const [isSimilarityModalOpen, setIsSimilarityModalOpen] = useState(false);
    const [similarityReferenceTrack, setSimilarityReferenceTrack] = useState<any>(null);

    const handleFindSimilar = useCallback((trackId: string) => {
        const track = tracks.find(t => t.id === trackId);
        if (track) {
            setSimilarityReferenceTrack(track);
            setIsSimilarityModalOpen(true);
        }
    }, [tracks]);

    useEffect(() => {
        const fetchUserAndCounts = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const counts = await getCurationCounts_Action({ userId: user.id });
                setCurationCounts(counts);
            } else {
                const counts = await getCurationCounts_Action();
                setCurationCounts(counts);
            }
        };
        fetchUserAndCounts();
    }, []);

    // Taxonomy Filters State
    const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [bpmRange, setBpmRange] = useState<[number, number]>([60, 180]);

    const performSearch = useCallback(async (
        searchQuery: string,
        venues: string[],
        vibes: string[],
        genres: string[],
        bpm: [number, number]
    ) => {
        setLoading(true);
        const startTime = Date.now();
        try {
            let combinedMoods = activeRule?.moods || [];
            let currentGenres = [...genres];

            if (activeRule) {
                if (activeRule.genres) currentGenres = [...new Set([...currentGenres, ...activeRule.genres])];
            }

            const data = await getVenueTracks_Action({
                query: searchQuery === "Liked Songs" ? undefined : searchQuery,
                bpmRange: activeRule ? undefined : bpm,
                venues: venues.length > 0 ? venues : undefined,
                vibes: vibes.length > 0 ? vibes : undefined,
                genres: currentGenres.length > 0 ? currentGenres : undefined,
                moods: combinedMoods.length > 0 ? combinedMoods : undefined,
                onlyLikedBy: searchQuery === "Liked Songs" ? (userId || undefined) : undefined,
                userId: userId || undefined
            });

            // Log search for analytics (Aura Tailor & Infrastructure ROI)
            if (searchQuery || venues.length > 0 || vibes.length > 0 || currentGenres.length > 0) {
                logSearchQuery_Action(
                    searchQuery,
                    { venues, vibes, genres, bpm, rule_active: !!activeRule },
                    data.length,
                    Date.now() - startTime
                );
            }

            setTracks(data.map(t => {
                const totalSeconds = (t.duration && t.duration > 10000) ? t.duration / 1000 : (t.duration || 0);
                const displayDuration = totalSeconds > 0
                    ? `${Math.floor(totalSeconds / 60)}:${Math.round(totalSeconds % 60).toString().padStart(2, '0')}`
                    : "0:00";

                return {
                    id: t.id,
                    title: t.title,
                    artist: t.artist,
                    duration: displayDuration,
                    rawDurationMs: t.duration || 0,
                    bpm: t.bpm || 120,
                    tags: t.tags?.length ? t.tags : [t.genre || "Music", "General"],
                    image: t.coverImage,
                    lyrics: t.lyrics,
                    audioSrc: t.src,
                    src: t.src,
                    metadata: t.metadata
                };
            }));

        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }, [activeRule, userId]);

    const isFirstMount = useRef(true);

    useEffect(() => {
        if (isFirstMount.current) {
            performSearch('', [], [], [], [60, 180]);
            isFirstMount.current = false;
        } else {
            const timer = setTimeout(() => {
                performSearch(query, selectedVenues, selectedVibes, selectedGenres, bpmRange);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [query, selectedVenues, selectedVibes, selectedGenres, bpmRange, performSearch]);

    const handleTrackPlay = (track: any) => {
        playTrack(track, tracks); // Pass current view list for auto-play
    };

    const toggleTag = (list: string[], setList: (l: string[]) => void, tag: string) => {
        setList(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag]);
    };

    const formatCount = (count: number | undefined, singular: string = "track", plural: string = "tracks") => {
        if (count === undefined) return "Loading...";
        return `${count} ${count === 1 ? singular : plural}`;
    };

    const playlists = [
        { title: "Recommended tracks", tracks: "Aura AI", color: "bg-[#FF5533]", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=800" },
        { title: "Trending in Venues", tracks: "Popular", color: "bg-[#FF77AA]", image: "https://images.unsplash.com/photo-1514525253344-f856335d7d67?q=80&w=800" },
        { title: "Can's Essentials", tracks: formatCount(curationCounts["Can's Essentials"], "playlist", "playlists"), color: "bg-[#AAAAAA]", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800" },
        { title: "Creator's Picks", tracks: formatCount(curationCounts["Creator's Picks"], "playlist", "playlists"), color: "bg-[#4499FF]", image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800" },
        { title: "Liked Songs", tracks: formatCount(curationCounts["Liked Songs"]), color: "bg-pink-600", image: "https://images.unsplash.com/photo-1544690411-b752fa399f9c?q=80&w=800" },
        { title: "Championships", tracks: formatCount(curationCounts["Championships"]), vibe: "Epic", color: "bg-[#FFCC44]", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800" },
        { title: "Sports & Action", tracks: formatCount(curationCounts["Sports & Action"], "playlist", "playlists"), vibe: "Workout", color: "bg-[#9966FF]", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800" },
        { title: "Valentine's Day", tracks: formatCount(curationCounts["Valentine's Day"]), vibe: "Romantic", color: "bg-[#FF99CC]", image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800" },
        { title: "Morning Coffee", tracks: formatCount(curationCounts["Morning Coffee"]), vibe: "Relaxing", color: "bg-[#D2B48C]", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800" },
        { title: "Deep Focus", tracks: formatCount(curationCounts["Deep Focus"]), vibe: "Focus", color: "bg-[#2F4F4F]", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800" },
        { title: "Late Night Jazz", tracks: formatCount(curationCounts["Late Night Jazz"]), genre: "Jazz", color: "bg-[#4B0082]", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800" },
        { title: "Golden Hour", tracks: formatCount(curationCounts["Golden Hour"]), vibe: "Dreamy", color: "bg-[#FF8C00]", image: "https://images.unsplash.com/photo-1470252649358-9c9e6c739946?q=80&w=800" },
        { title: "Techno Bunker", tracks: formatCount(curationCounts["Techno Bunker"]), vibe: "Dark", color: "bg-[#000000]", image: "https://images.unsplash.com/photo-1574433232643-49f0f6cc0d00?q=80&w=800" },
        { title: "Aura Classics", tracks: formatCount(curationCounts["Aura Classics"]), genre: "Legacy", color: "bg-[#DAA520]", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800" },
        { title: "Global Beats", tracks: formatCount(curationCounts["Global Beats"]), genre: "World", color: "bg-[#228B22]", image: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?q=80&w=800" },
        { title: "Cinematic Vibe", tracks: formatCount(curationCounts["Cinematic Vibe"]), genre: "Cinematic", color: "bg-[#800000]", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800" }
    ];

    const vibesList = [
        { title: 'Chill', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800', color: 'bg-blue-500' },
        { title: 'Dreamy', image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=800', color: 'bg-purple-500' },
        { title: 'Epic', image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=800', color: 'bg-red-500' },
        { title: 'Focus', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800', color: 'bg-teal-500' },
        { title: 'Happy', image: 'https://images.unsplash.com/photo-1500835595351-263d8137b6a9?q=80&w=800', color: 'bg-yellow-500' },
        { title: 'Romantic', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800', color: 'bg-pink-500' },
        { title: 'Relaxing', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=800', color: 'bg-indigo-500' },
        { title: 'Suspense', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800', color: 'bg-zinc-800' },
        { title: 'Euphoric', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=800', color: 'bg-orange-500' },
        { title: 'Melancholic', image: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=800', color: 'bg-blue-900' },
        { title: 'Mysterious', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800', color: 'bg-violet-950' },
        { title: 'Peaceful', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800', color: 'bg-emerald-500' },
        { title: 'Workout', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800', color: 'bg-orange-600' },
        { title: 'Smooth', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800', color: 'bg-amber-500' },
        { title: 'Dark', image: 'https://images.unsplash.com/photo-1514525253344-f856335d7d67?q=80&w=800', color: 'bg-black' },
        { title: 'Quirky', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800', color: 'bg-lime-500' }
    ];

    const VENUE_SECTORS = [
        { name: 'Hospitality', tags: ['Hotel Lobby', 'Lounge & Bar', 'Rooftop / Terrace'] },
        { name: 'F&B', tags: ['Coffee Shop', 'Fine Dining', 'Bistro & Brasserie'] },
        { name: 'Retail', tags: ['Luxury Boutique', 'Streetwear Store'] },
        { name: 'Wellness', tags: ['Spa & Massage', 'Yoga & Pilates'] },
        { name: 'Work', tags: ['Coworking Space', 'Corporate Office'] }
    ];

    const VIBE_TAGS = ['Chill', 'Dark', 'Dreamy', 'Epic', 'Euphoric', 'Focus', 'Happy', 'Hopeful'];
    const GENRE_TAGS = ['Ambient', 'Cinematic', 'Electronic', 'Jazz', 'Lounge', 'Pop'];

    return (
        <div className="flex flex-col gap-8 md:gap-12 pb-24 md:pb-20 max-w-[1600px] mx-auto">
            {/* 1. Header & Navigation */}
            <div className="space-y-6 md:space-y-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                        {['search', 'assistant', 'flow'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveSubTab(tab as any); setSelectedPlaylist(null); }}
                                className={`flex-1 sm:flex-initial px-4 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-[13px] font-black uppercase tracking-widest transition-all shadow-lg border ${activeSubTab === tab
                                    ? 'bg-white text-black border-white scale-105'
                                    : 'text-zinc-500 hover:text-white bg-white/5 border-transparent hover:bg-white/10'
                                    }`}
                            >
                                {tab === 'flow' ? t('tabs.flow') : t(`tabs.${tab}`)}
                            </button>
                        ))}
                    </div>

                    {activeRule && (
                        <div className="px-4 md:px-6 py-1.5 md:py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full flex items-center gap-2 md:gap-3 animate-pulse">
                            <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">
                                {t('results.flow_active', { name: activeRule.name })}
                            </span>
                        </div>
                    )}
                </div>

                {activeSubTab !== 'flow' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-stretch bg-[#1E1E22] rounded-xl md:rounded-md overflow-visible relative z-30 h-12 md:h-14 border border-white/5 shadow-2xl animate-in fade-in duration-500">
                            <div className="relative h-full flex items-center border-r border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
                                    className="px-4 md:px-8 h-full flex items-center gap-2 md:gap-3 hover:bg-white/5 transition-colors group min-w-[120px] md:min-w-[180px]"
                                >
                                    <span className="text-[12px] md:text-[14px] font-bold text-white">{searchType === 'Music' ? t('search.music') : t('search.sfx')}</span>
                                    <ChevronDown size={14} className={`text-zinc-500 group-hover:text-white transition-all ${isSearchDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isSearchDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsSearchDropdownOpen(false)} />
                                        <div className="absolute top-full left-0 mt-2 w-48 md:w-56 bg-[#1E1E22] border border-white/10 rounded-xl shadow-2xl z-50 py-1 md:py-2 overflow-hidden">
                                            {['Music', 'Sound Effects'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => { setSearchType(option); setIsSearchDropdownOpen(false); }}
                                                    className="w-full text-left px-4 py-2.5 md:px-5 md:py-3 text-[11px] md:text-[13px] font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors first:rounded-t-md last:rounded-b-md"
                                                >
                                                    {option === 'Music' ? t('search.music') : t('search.sfx')}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex-1 flex items-center px-4 md:px-8 h-full relative">
                                <Search size={16} className="absolute left-4 md:left-8 text-zinc-600" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setQuery(val);

                                        // Prefix parsing logic
                                        if (val.toLowerCase().startsWith('v:') || val.toLowerCase().startsWith('vibe:')) {
                                            const tag = val.split(':')[1]?.trim();
                                            if (tag && VIBE_TAGS.includes(tag)) {
                                                setSelectedVibes(prev => [...new Set([...prev, tag])]);
                                                setQuery('');
                                            }
                                        } else if (val.toLowerCase().startsWith('g:') || val.toLowerCase().startsWith('genre:')) {
                                            const tag = val.split(':')[1]?.trim();
                                            if (tag && GENRE_TAGS.includes(tag)) {
                                                setSelectedGenres(prev => [...new Set([...prev, tag])]);
                                                setQuery('');
                                            }
                                        } else if (val.toLowerCase().startsWith('vn:') || val.toLowerCase().startsWith('venue:')) {
                                            const tag = val.split(':')[1]?.trim();
                                            const allVenueTags = VENUE_SECTORS.flatMap(s => s.tags);
                                            if (tag && allVenueTags.includes(tag)) {
                                                setSelectedVenues(prev => [...new Set([...prev, tag])]);
                                                setQuery('');
                                            }
                                        }
                                    }}
                                    placeholder={activeSubTab === 'assistant' ? t('search.placeholder_assistant') : t('search.placeholder_search')}
                                    className="w-full bg-transparent text-white focus:outline-none text-[13px] md:text-[16px] h-full pl-6 md:pl-10 placeholder-zinc-700 font-bold"
                                />

                                {/* Omnibar Suggestions */}
                                {query.length > 0 && activeSubTab !== 'assistant' && (
                                    <div className="absolute top-full left-0 right-0 mt-4 bg-[#1E1E22]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-2">
                                        <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5 mb-2">{t('search.suggestions')}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {VIBE_TAGS.filter(v => v.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map(v => (
                                                <button key={v} onClick={() => { setSelectedVibes(prev => [...new Set([...prev, v])]); setQuery(''); }} className="px-3 py-1.5 rounded-lg bg-pink-600/10 border border-pink-500/20 text-pink-400 text-[11px] font-bold hover:bg-pink-600 hover:text-white transition-all">{t('search.vibe_prefix')}{v}</button>
                                            ))}
                                            {GENRE_TAGS.filter(g => g.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map(g => (
                                                <button key={g} onClick={() => { setSelectedGenres(prev => [...new Set([...prev, g])]); setQuery(''); }} className="px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition-all">{t('search.genre_prefix')}{g}</button>
                                            ))}
                                            {VENUE_SECTORS.flatMap(s => s.tags).filter(venueTag => venueTag.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map(venueTag => (
                                                <button key={venueTag} onClick={() => { setSelectedVenues(prev => [...new Set([...prev, venueTag])]); setQuery(''); }} className="px-3 py-1.5 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold hover:bg-emerald-600 hover:text-white transition-all">{t('search.venue_prefix')}{venueTag}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:flex bg-white/5 text-zinc-600 px-6 md:px-10 items-center justify-center opacity-40 border-l border-white/5">
                                <Music size={20} />
                            </div>
                        </div>

                        {/* Active Pill Display */}
                        {(selectedVibes.length > 0 || selectedGenres.length > 0 || selectedVenues.length > 0) && (
                            <div className="flex flex-wrap gap-2 px-2">
                                {selectedVenues.map(t => (
                                    <button key={t} onClick={() => toggleTag(selectedVenues, setSelectedVenues, t)} className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-white/80 transition-all">
                                        {t} <X size={10} />
                                    </button>
                                ))}
                                {selectedVibes.map(v => (
                                    <button key={v} onClick={() => toggleTag(selectedVibes, setSelectedVibes, v)} className="px-3 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-pink-500 transition-all">
                                        {v} <X size={10} />
                                    </button>
                                ))}
                                {selectedGenres.map(g => (
                                    <button key={g} onClick={() => toggleTag(selectedGenres, setSelectedGenres, g)} className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-indigo-500 transition-all">
                                        {g} <X size={10} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Logic */}
            {activeSubTab === 'flow' ? (
                <ScheduleManager />
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 md:gap-10 items-start">
                    {/* LEFT SIDEBAR: ADVANCED TAXONOMY */}
                    {showFilters && (
                        <aside className="w-full lg:w-72 space-y-8 md:space-y-12 animate-in slide-in-from-left duration-700 lg:sticky lg:top-24 pb-20 p-6 md:p-8 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl">
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 ml-1 mb-2">
                                    <MapPin size={12} className="text-zinc-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">{t('filters.segments')}</h3>
                                </div>
                                {VENUE_SECTORS.map(s => (
                                    <div key={s.name} className="space-y-3">
                                        <p className="text-[8px] font-bold text-zinc-600 uppercase ml-1 tracking-widest">{s.name}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {s.tags.map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => toggleTag(selectedVenues, setSelectedVenues, t)}
                                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${selectedVenues.includes(t)
                                                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105'
                                                        : 'bg-black/40 text-zinc-500 border-white/5 hover:border-white/10 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 ml-1 mb-2">
                                    <Zap size={12} className="text-pink-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">{t('filters.vibes')}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {VIBE_TAGS.map(v => (
                                        <button
                                            key={v}
                                            onClick={() => toggleTag(selectedVibes, setSelectedVibes, v)}
                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${selectedVibes.includes(v)
                                                ? 'bg-pink-600 text-white border-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.3)] scale-105'
                                                : 'bg-black/40 text-zinc-500 border-white/5 hover:border-white/10 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 ml-1 mb-2">
                                    <Activity size={12} className="text-indigo-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">{t('filters.genres')}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {GENRE_TAGS.map(g => (
                                        <button
                                            key={g}
                                            onClick={() => toggleTag(selectedGenres, setSelectedGenres, g)}
                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${selectedGenres.includes(g)
                                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] scale-105'
                                                : 'bg-black/40 text-zinc-500 border-white/5 hover:border-white/10 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 rounded-[2rem] bg-indigo-500/[0.03] border border-white/5 space-y-6 shadow-inner">
                                <div className="flex items-center justify-between ml-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">{t('filters.tempo')}</h3>
                                    <span className="text-[10px] font-black text-indigo-400">{bpmRange[1]}</span>
                                </div>
                                <div className="px-1">
                                    <input
                                        type="range"
                                        min="60"
                                        max="180"
                                        value={bpmRange[1]}
                                        onChange={(e) => setBpmRange([bpmRange[0], parseInt(e.target.value)])}
                                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-indigo-400 transition-all [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                    />
                                </div>
                                <button
                                    onClick={() => { setSelectedVenues([]); setSelectedVibes([]); setSelectedGenres([]); setBpmRange([60, 180]); setQuery(''); }}
                                    className="w-full py-4 rounded-2xl bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
                                >
                                    <RefreshCw size={12} />
                                    {t('filters.reset')}
                                </button>
                            </div>
                        </aside>
                    )}

                    <div className="flex-1 space-y-12">
                        {/* 2. Track List Area (Top 5 Pieces) */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">
                                        {query ? t('results.aura_results_for', { query }) : (selectedPlaylist ? selectedPlaylist : t('results.discovery_flow'))}
                                    </h2>
                                    {(activeRule || selectedVenues.length > 0 || selectedVibes.length > 0) && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">
                                                {t('results.intelligence_layer')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    disabled={true}
                                    className={`flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border opacity-20 cursor-not-allowed bg-zinc-900/50 text-zinc-500 border-white/5`}
                                >
                                    <Sliders size={14} /> {t('filters.advanced')}
                                </button>
                            </div>

                            <div className="divide-y divide-white/5 bg-zinc-900/5 rounded-[2.5rem] overflow-hidden min-h-[400px]">
                                {loading && tracks.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center space-y-6 opacity-30">
                                        <div className="h-10 w-10 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                                    </div>
                                ) : tracks.length > 0 ? (
                                    tracks.slice(0, 10).map((track) => (
                                        <TrackRow key={track.id} {...track} lyrics={track.lyrics} allTracks={tracks} onSimilar={handleFindSimilar} />
                                    ))
                                ) : (
                                    <div className="py-20 text-center flex flex-col items-center space-y-4 opacity-40">
                                        <LucideSparkles size={64} strokeWidth={1} />
                                        <p className="text-xl font-bold uppercase italic tracking-tighter">{t('results.no_assets')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Premium Curation Section (8 boxes) */}
                        <div className="space-y-6 md:space-y-8 pt-8 border-t border-white/5">
                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase italic">{t('sections.premium_curation')}</h2>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
                                {playlists.map((playlist: any, i) => (
                                    <PlaylistCard
                                        key={i}
                                        {...playlist}
                                        onClick={() => {
                                            setSelectedPlaylist(playlist.title);
                                            // Reset all filters before applying new curation search
                                            setSelectedVibes([]);
                                            setSelectedGenres([]);
                                            setSelectedVenues([]);

                                            if (playlist.vibe) {
                                                setSelectedVibes([playlist.vibe]);
                                                setQuery('');
                                            } else if (playlist.genre) {
                                                setSelectedGenres([playlist.genre]);
                                                setQuery('');
                                            } else {
                                                setQuery(playlist.title === "Recommended tracks" ? "" : playlist.title);
                                            }
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 4. Music on Request Promotion Banner */}
                        <div className="pt-8">
                            <div className="bg-[#D9E1EB] rounded-3xl md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row items-stretch border border-white/5 group/banner">
                                <div className="flex-1 p-8 md:p-16 flex flex-col justify-center space-y-4 md:space-y-6">
                                    <h2 className="text-3xl md:text-5xl font-serif text-[#111111] font-black uppercase tracking-tighter italic leading-tight max-w-md">{t('promo.title')}</h2>
                                    <p className="text-[13px] md:text-[15px] text-zinc-800 max-w-sm font-medium">{t('promo.desc')}</p>
                                    <div>
                                        <Link
                                            href="/dashboard/request"
                                            className="inline-block bg-black text-white px-8 py-3 md:px-10 md:py-4 font-bold text-xs md:text-[13px] hover:bg-zinc-900 transition-all active:scale-95 uppercase tracking-[0.2em] shadow-2xl"
                                        >
                                            {t('promo.button')}
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex-1 relative min-h-[200px] md:min-h-[400px] overflow-hidden group/studio">
                                    <div
                                        className="absolute inset-0 bg-cover bg-[center_bottom_30%] transition-transform duration-[2000ms] group-hover/studio:scale-110"
                                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1600)' }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover/studio:bg-black/10 transition-colors duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#D9E1EB]/30" />
                                </div>
                            </div>
                        </div>

                        {/* 5. Trending in Venues List */}
                        <div className="space-y-8 pt-12 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">{t('sections.trending')}</h2>
                                <button
                                    onClick={() => performSearch(query, selectedVenues, selectedVibes, selectedGenres, bpmRange)}
                                    className="text-[11px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group"
                                >
                                    {loading && <RefreshCw size={12} className="animate-spin" />}
                                    {t('sections.explore_more')}
                                </button>
                            </div>

                            <div className="divide-y divide-white/5 bg-zinc-900/5 rounded-[2.5rem] overflow-hidden min-h-[400px]">
                                {tracks.length > 5 ? (
                                    tracks.slice(5, 15).map((track) => (
                                        <TrackRow key={track.id} {...track} lyrics={track.lyrics} allTracks={tracks} onSimilar={handleFindSimilar} />
                                    ))
                                ) : (
                                    <div className="py-20 text-center flex items-center justify-center text-zinc-700 font-black uppercase tracking-widest text-[10px]">
                                        {loading ? (
                                            <RefreshCw className="animate-spin text-zinc-500" size={24} />
                                        ) : (
                                            t('results.discovering')
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 6. Premium Vibes Section (8 Boxes) */}
                        <div className="space-y-6 md:space-y-8 pt-12 border-t border-white/5">
                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase italic text-glow-indigo">{t('sections.premium_vibes')}</h2>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
                                {vibesList.map((vibe, i) => (
                                    <PlaylistCard
                                        key={i}
                                        title={vibe.title}
                                        tracks={formatCount(curationCounts[vibe.title])}
                                        color={vibe.color}
                                        image={vibe.image}
                                        onClick={() => {
                                            setSelectedVibes([vibe.title]);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Smart Similarity Engine Overlay */}
            <SimilarityModal
                isOpen={isSimilarityModalOpen}
                onClose={() => {
                    setIsSimilarityModalOpen(false);
                    setSimilarityReferenceTrack(null);
                }}
                referenceTrack={similarityReferenceTrack}
                allTracks={tracks}
            />
        </div>
    );
}

export default function VenueDashboardPage() {
    return (
        <SmartFlowProvider venueId="default-venue">
            <VenueDashboardContent />
        </SmartFlowProvider>
    );
}
