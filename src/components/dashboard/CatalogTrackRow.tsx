'use client';

import { useState, useMemo } from 'react';
import {
    Music,
    Edit3,
    BarChart3,
    Trash2,
    Check,
    X,
    Activity,
    Wind,
    Loader2,
    Building2,
    Layers,
    Sparkles,
    Settings2,
    Search,
    Wand2
} from 'lucide-react';
import { updateTrackMetadata_Action, deleteTrack_Action } from '@/app/actions/catalog';

// --- Taxonomy Constants ---
const THEMES = ['Cinematic', 'Corporate', 'Vlog', 'Fashion', 'Sci-Fi', 'Travel'];
const CHARACTERS = ['Acoustic', 'Synthetic', 'Percussive', 'Minimal', 'Orchestral'];
const VIBES = ['Angry', 'Busy & Frantic', 'Chill', 'Dark', 'Dreamy', 'Epic', 'Euphoric', 'Focus', 'Happy', 'Hopeful', 'Laid Back', 'Melancholic', 'Mysterious', 'Peaceful', 'Quirky', 'Relaxing', 'Romantic', 'Sad', 'Scary', 'Sentimental', 'Sexy', 'Smooth', 'Sneaking', 'Suspense', 'Weird', 'Workout'];
const VENUE_TAGS = ['Hotel Lobby', 'Lounge & Bar', 'Rooftop / Terrace', 'Airport / Lounge', 'Coffee Shop', 'Fine Dining', 'Bistro & Brasserie', 'Cocktail Bar', 'Fast Casual', 'Luxury Boutique', 'Streetwear Store', 'Shopping Mall', 'Showroom / Gallery', 'Spa & Massage', 'Yoga & Pilates', 'Gym & CrossFit', 'Hair Salon / Barber', 'Coworking Space', 'Corporate Office'];

const ALL_GENRES = [
    "Abstract Hip Hop", "Acoustic", "Solo Guitar", "Solo Piano", "Acoustic Rock", "Afoxê", "Ambient", "ASMR", "Binaural Beats", "Drone", "Meditation", "Ambient Americana", "Ambient Dub", "Ambient Noise Wall", "Ambient Pop", "Bachata", "Ballad", "Bassline", "Batida", "Batucada", "Beats", "Bhajan", "Black Metal", "Blues", "Acoustic Blues", "African Blues", "Blues Rock", "Classic Blues", "Country Blues", "Delta Blues", "Modern Blues", "Brass & Marching Band", "Bagpipes", "Military & Historical", "Oompah", "Breakbeat", "2-step", "Big Beat", "Drum And Bass", "Dubstep", "Future Garage", "Jungle", "Liquid Drum And Bass", "Techstep", "UK Garage", "Bubblegum Pop", "Children's Music", "Lullabies", "Choral Symphony", "Cinematic", "Action", "Adventure", "Beautiful", "Build", "Chase", "Crime Scene", "Drama", "Filmi", "Horror", "Main Title", "Mystery", "Nostalgia", "Pulses", "Strange & Weird", "Supernatural", "Suspense", "Tragedy", "Circus & Funfair", "Amusement Park", "City Pop", "Classic Rock", "Classical", "Choral", "Classical Crossover", "Contemporary Classical", "Indian Classical", "Orchestral", "Orchestral Hybrid", "Small Ensemble", "Solo Instrumental", "String Ensemble", "Waltz", "Classical Period", "Comedy", "Bloopers", "Cartoons", "Sneaky", "Vaudeville", "Comedy Rock", "Complextro", "Conscious Hip Hop", "Contemporary Gospel", "Corporate", "Country", "Americana", "Bluegrass", "Contemporary Country", "Country Pop", "Country Rock", "Traditional Country", "Western", "Country Folk", "Country Rap", "Cumbia Mexicana", "Cumbia Norteña Mexicana", "Cumbia Pop", "Dance", "Dancefloor Drum And Bass", "Dark Ambient", "Dark Cabaret", "Decade", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s", "Dembow", "Disco", "Boogie", "Nu Disco", "Dixieland", "Downtempo", "Balearic Beat", "Chillout", "Chillstep", "Chillwave", "Trip Hop", "Easy Listening", "Lounge", "Electro Latino", "Electro-funk", "Electroacoustic", "Electronic", "Bit Music", "Dark Wave", "EDM", "Electro", "Electro Swing", "Eurodance", "Footwork", "Future Bass", "Hardstyle", "IDM", "Indietronica", "Jersey Club", "Melodic Techno", "Midtempo Bass", "Minimal Techno", "Psytrance", "Synthwave", "Techno", "Trance", "Trap EDM", "Vaporwave", "Electronica", "Euro-trance", "Experimental", "Experimental Electronic", "Experimental Hip Hop", "Fanfares", "Ceremonial & Olympic", "Folk", "Alternative Folk", "Celtic", "Contemporary Folk", "Folk Pop", "Indie Folk", "Irish Folk", "Klezmer", "Polka", "Folktronica", "Forró", "Funk", "Afro-funk", "Funk Rock", "Synth Funk", "Garage House", "Gqom", "Hands Up", "Hard Trap", "Hardcore Hip Hop", "Hardcore Punk", "Hindustani Classical", "Hip Hop", "Alternative Hip Hop", "Boom Bap", "Bounce", "Detroit Trap", "Drift Phonk", "Drill", "East Coast Hip Hop", "Grime", "Lo-fi Hip Hop", "Old School Hip Hop", "Trap", "West Coast Hip Hop", "Hip Hop Soul", "Horrorcore", "House", "Afro House", "Amapiano", "Ambient House", "Bass House", "Big Room House", "Deep House", "Electro House", "Funky House", "Future Funk", "Future House", "Lo-fi House", "Microhouse", "Organic House", "Progressive House", "Slap House", "Soft House", "Tech House", "Tribal House", "Tropical House", "Huapango", "Hybrid Trap", "Indian Pop", "Indie Surf", "Industrial Metal", "J-pop", "J-rock", "Japanese Classical", "Jazz", "Acid Jazz", "Bebop", "Big Band", "Classic Jazz", "Contemporary Jazz", "Cool Jazz", "Dark Jazz", "Jazz Fusion", "Jazz-funk", "Latin Jazz", "Ragtime", "Smooth Jazz", "Swing", "Jazz Blues", "Jazz Pop", "Korean Ballad", "Korean Classical", "Latin", "Bolero", "Bossa Nova", "Calypso", "Chachachá", "Corrido", "Corrido Tumbado", "Cumbia", "Flamenco", "Funk Carioca", "Guaracha EDM", "Latin Pop", "Mambo", "Mariachi", "Merengue", "Reggaeton", "Rumba", "Salsa", "Samba", "Son Cubano", "Tango", "Latin Ballad", "Latin House", "Latin Rock", "Lo-fi", "Marching Band", "Mbalax", "Medieval", "Metal", "Heavy Metal", "Thrash Metal", "Metalcore", "Min'yō", "Modern Classical", "Nature Sounds", "Neoclassical Dark Wave", "Neoclassical New Age", "Norteño", "Nu Jazz", "Nu Metal", "Opera", "Phonk", "Pop", "Afrobeats", "Alternative Pop", "Bedroom Pop", "Contemporary Christian", "Dance-pop", "Dream Pop", "Electropop", "Europop", "Hyperpop", "Indie Pop", "K-pop", "Pop Rock", "Schlager", "Synth-pop", "Teen Pop", "Pop Soul", "Post-classical", "Praise & Worship", "Progressive Breaks", "Progressive Electronic", "Psychedelic", "Psychedelic Pop", "Psychedelic Soul", "Punk", "Pop Punk", "Punk Rock", "R&B", "Contemporary R&B", "Motown", "Ranchera", "Reggae", "Dancehall", "Dub", "Ska", "Regional Mexicano", "Religious Music", "Modern Hymns", "Rock", "Alternative Rock", "Arena Rock", "Electronic Rock", "Folk Rock", "Garage Rock", "Grunge", "Hard Rock", "Indie Rock", "Post-rock", "Psychedelic Rock", "Rock And Roll", "Rockabilly", "Roots Rock", "Soft Rock", "Surf Rock", "Romantic Classical", "Sambass", "Screamo", "Shoegaze", "Singer-songwriter", "Slack-key Guitar", "Smooth Soul", "Son Jarocho", "Soul", "Gospel", "Neo Soul", "Soul Blues", "Southeast Asian Classical", "Southern Hip Hop", "Southern Rock", "Space Age Pop", "Space Ambient", "Birthdays", "Christmas", "Drinking Songs", "Funerals", "Weddings", "Speed Garage", "Speed House", "Stoner Rock", "Sunshine Pop", "Swing Revival", "Symphonic Poem", "Techno Bass", "Trap Metal", "UK Drill", "UK Funky", "Vocal Trance", "African Continent", "Brazil", "Britain", "Cuba", "Greece", "India", "Ireland", "Japan", "Korea", "Mexico", "Middle East", "Puerto Rico", "Scandinavian", "Spain", "The Balkans", "Usa", "World", "World Fusion"
];

const SimpleTooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
    return (
        <div className="group/tooltip relative flex items-center justify-center">
            {children}
            <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:block whitespace-nowrap rounded bg-zinc-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-2xl border border-white/10 z-[100]">
                {text}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
            </div>
        </div>
    );
};

export function CatalogTrackRow({ track }: { track: any }) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showTagEditor, setShowTagEditor] = useState(false);
    const [showLyricsEditor, setShowLyricsEditor] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [genreSearch, setGenreSearch] = useState('');

    const formatDuration = (seconds: number | undefined) => {
        if (!seconds || isNaN(seconds)) return '--:--';
        // If the number is huge (e.g. > 10000), it's likely milliseconds
        const totalSeconds = seconds > 10000 ? seconds / 1000 : seconds;
        const m = Math.floor(totalSeconds / 60);
        const s = Math.round(totalSeconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Core Edit State
    const [editData, setEditData] = useState({
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        bpm: track.bpm,
        key: track.key,
        popularity_score: track.popularity_score || 0
    });

    // Taxonomy State
    const [localTags, setLocalTags] = useState({
        theme: track.theme || [],
        character: track.character || [],
        vibe_tags: track.vibe_tags || [],
        venue_tags: track.venue_tags || [],
        genre: track.genre || 'Ambient'
    });

    const [localLyrics, setLocalLyrics] = useState(track.lyrics || '');

    const filteredGenres = useMemo(() => {
        if (!genreSearch) return ALL_GENRES.slice(0, 20); // Show top 20 by default
        return ALL_GENRES.filter(g => g.toLowerCase().includes(genreSearch.toLowerCase())).slice(0, 30);
    }, [genreSearch]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateTrackMetadata_Action(track.id, editData);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            alert('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTaxonomy = async () => {
        setLoading(true);
        try {
            await updateTrackMetadata_Action(track.id, localTags);
            setShowTagEditor(false);
        } catch (e) {
            console.error(e);
            alert('Tagging failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLyrics = async () => {
        setLoading(true);
        try {
            await updateTrackMetadata_Action(track.id, { lyrics: localLyrics });
            setShowLyricsEditor(false);
        } catch (e) {
            console.error(e);
            alert('Lyrics update failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (category: keyof typeof localTags, tag: string) => {
        if (category === 'genre') {
            setLocalTags(prev => ({ ...prev, genre: tag }));
            return;
        }

        const currentArr = localTags[category] as string[];
        setLocalTags(prev => ({
            ...prev,
            [category]: currentArr.includes(tag)
                ? currentArr.filter((t: string) => t !== tag)
                : [...currentArr, tag]
        }));
    };

    const handleDeleteConfirm = async () => {
        setLoading(true);
        try {
            await deleteTrack_Action(track.id);
            setShowDeleteConfirm(false);
        } catch (e) {
            console.error(e);
            alert('Delete failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <tr className={`hover:bg-white/[0.02] transition-colors group ${loading && !showTagEditor && !showLyricsEditor ? 'opacity-50 pointer-events-none' : ''} relative`}>
            {/* Asset Primary Info */}
            <td className="p-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-zinc-800 rounded-lg flex items-center justify-center relative overflow-hidden shadow-xl">
                        {track.cover_image_url ? (
                            <img src={track.cover_image_url} className="w-full h-full object-cover" alt={track.title} />
                        ) : (
                            <Music size={18} className="text-zinc-600" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        {isEditing ? (
                            <input
                                value={editData.title}
                                onChange={e => setEditData({ ...editData, title: e.target.value })}
                                className="bg-black border border-white/10 rounded px-2 py-1 text-sm text-white w-full"
                            />
                        ) : (
                            <p className="text-sm font-bold text-white truncate uppercase italic">{track.title}</p>
                        )}
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{track.artist}</p>
                    </div>
                </div>
            </td>

            {/* Duration */}
            <td className="p-6">
                <div className="text-[11px] font-black text-white/70 font-mono">
                    {formatDuration(track.duration_sec)}
                </div>
                <div className="text-[8px] font-bold text-zinc-600 uppercase mt-1 tracking-widest">
                    Seconds: {Math.round(track.duration_sec || 0)}
                </div>
            </td>

            {/* Attributes (Technical) */}
            <td className="p-6">
                <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2 items-center">
                        <span className="text-[9px] font-black text-zinc-600 uppercase">Genre:</span>
                        {isEditing ? (
                            <input
                                value={editData.genre}
                                onChange={e => setEditData({ ...editData, genre: e.target.value })}
                                className="bg-black border border-white/10 rounded px-2 py-0.5 text-[9px] text-white w-20"
                            />
                        ) : (
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[9px] font-black uppercase">{track.genre}</span>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <div className="flex gap-1 items-center">
                            <Activity size={10} className="text-zinc-600" />
                            <span className="text-[9px] font-black text-white uppercase">{track.bpm} BPM</span>
                        </div>
                        <div className="flex gap-1 items-center">
                            <Wind size={10} className="text-zinc-600" />
                            <span className="text-[9px] font-black text-white uppercase">{track.key}</span>
                        </div>
                    </div>
                </div>
            </td>

            {/* Vibe & Taxonomy Summary */}
            <td className="p-6">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {track.venue_tags?.slice(0, 1).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-[4px] text-[8px] font-black uppercase">
                            {tag}
                        </span>
                    ))}
                    {track.vibe_tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-pink-500/10 text-pink-400 rounded-[4px] text-[8px] font-black uppercase italic">
                            #{tag}
                        </span>
                    ))}
                </div>
            </td>

            {/* Popularity / Score */}
            <td className="p-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-zinc-600 uppercase">Aura Score</span>
                        <span className="text-[9px] font-bold text-zinc-400">{Math.round((track.popularity_score || 0) * 100)}%</span>
                    </div>
                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500"
                            style={{ width: `${(track.popularity_score || 0) * 100}%` }}
                        />
                    </div>
                </div>
            </td>

            {/* Quick Actions */}
            <td className="p-6 text-right relative">
                <div className="flex items-center justify-end gap-1">
                    {isEditing ? (
                        <>
                            <SimpleTooltip text="Save Changes">
                                <button onClick={handleSave} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg">
                                    <Check size={16} />
                                </button>
                            </SimpleTooltip>
                            <SimpleTooltip text="Cancel">
                                <button onClick={() => setIsEditing(false)} className="p-2 text-zinc-500 hover:bg-white/5 rounded-lg">
                                    <X size={16} />
                                </button>
                            </SimpleTooltip>
                        </>
                    ) : (
                        <>
                            <SimpleTooltip text="Edit Core Meta">
                                <button onClick={() => setIsEditing(true)} className="p-2 text-zinc-400 hover:text-white transition-colors">
                                    <Edit3 size={16} />
                                </button>
                            </SimpleTooltip>
                            <SimpleTooltip text="Advanced Tagging (Venue, Vibe, Character)">
                                <button
                                    onClick={() => setShowTagEditor(true)}
                                    className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-lg transition-all"
                                >
                                    <Settings2 size={16} />
                                </button>
                            </SimpleTooltip>
                            <SimpleTooltip text="Manage Lyrics">
                                <button
                                    onClick={() => setShowLyricsEditor(!showLyricsEditor)}
                                    className={`p-2 transition-colors ${showLyricsEditor ? 'text-pink-500 bg-white/5 rounded-lg' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    <Music size={16} />
                                </button>
                            </SimpleTooltip>
                            <SimpleTooltip text="Delete Asset">
                                <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </SimpleTooltip>
                        </>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 text-left">
                        <div className="bg-[#1E1E22] w-full max-w-md rounded-[2rem] border border-rose-500/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8 border-b border-white/5 flex flex-col items-center text-center gap-4">
                                <div className="h-16 w-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-2">
                                    <Trash2 size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase italic">Delete Asset</h3>
                                    <p className="text-zinc-400 text-sm mt-2 leading-relaxed">This action cannot be undone. Are you sure you want to permanently delete <strong className="text-white">{track.title}</strong>?</p>
                                </div>
                            </div>
                            <div className="p-6 bg-white/[0.01] flex gap-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-4 text-zinc-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors bg-white/5 rounded-xl hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} strokeWidth={3} />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Advanced Tag Editor Modal --- */}
                {showTagEditor && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 text-left">
                        <div className="bg-[#1E1E22] w-full max-w-5xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                            <div className="p-10 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase italic leading-none">Sonic Taxonomy</h3>
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Deep Metadata Tagging for Aura AI Intelligence</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-2 px-6 py-3 bg-indigo-500/20 text-indigo-400 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">
                                        <Wand2 size={14} /> Aura Suggest
                                    </button>
                                    <button onClick={() => setShowTagEditor(false)} className="text-zinc-500 hover:text-white transition-colors">
                                        <X size={32} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                                {/* Genre Section (Searchable) */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1 italic">Primary Genre</h4>
                                        <div className="relative">
                                            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                            <input
                                                placeholder="Search all genres..."
                                                value={genreSearch}
                                                onChange={e => setGenreSearch(e.target.value)}
                                                className="bg-black border border-white/5 rounded-full pl-8 pr-4 py-2 text-[10px] font-bold text-white focus:outline-none focus:border-indigo-500 w-64"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {filteredGenres.map(g => (
                                            <button
                                                key={g}
                                                onClick={() => toggleTag('genre', g)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${localTags.genre === g ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-black text-zinc-500 border-white/5 hover:border-white/10'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Theme & Character */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <TagSection
                                        title="Theme / Context"
                                        tags={THEMES}
                                        selected={localTags.theme}
                                        onToggle={(t: string) => toggleTag('theme', t)}
                                        colorClass="bg-blue-600 border-blue-500"
                                    />
                                    <TagSection
                                        title="Sonic Character"
                                        tags={CHARACTERS}
                                        selected={localTags.character}
                                        onToggle={(t: string) => toggleTag('character', t)}
                                        colorClass="bg-purple-600 border-purple-500"
                                    />
                                </div>

                                {/* Venue Targets */}
                                <TagSection
                                    title="Target Venue Segments"
                                    tags={VENUE_TAGS}
                                    selected={localTags.venue_tags}
                                    onToggle={(t: string) => toggleTag('venue_tags', t)}
                                    colorClass="bg-green-600 border-green-500"
                                />

                                {/* Vibes */}
                                <TagSection
                                    title="Aura Vibes"
                                    tags={VIBES}
                                    selected={localTags.vibe_tags}
                                    onToggle={(t: string) => toggleTag('vibe_tags', t)}
                                    colorClass="bg-pink-600 border-pink-500"
                                />
                            </div>

                            <div className="p-10 border-t border-white/5 bg-white/[0.01] flex justify-end gap-4">
                                <button
                                    onClick={() => setShowTagEditor(false)}
                                    className="px-8 py-4 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSaveTaxonomy}
                                    disabled={loading}
                                    className="px-12 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                                    Commit Taxonomy
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lyrics Editor Popover */}
                {showLyricsEditor && (
                    <div className="absolute right-0 top-full mt-2 w-96 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl z-[150] p-6 space-y-6 animate-in zoom-in-95 duration-200 text-left">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="space-y-1">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Edit Lyrics</h5>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">{track.title}</p>
                            </div>
                            <button onClick={() => setShowLyricsEditor(false)} className="text-zinc-600 hover:text-white"><X size={16} /></button>
                        </div>
                        <textarea
                            value={localLyrics}
                            onChange={e => setLocalLyrics(e.target.value)}
                            placeholder="Paste or type lyrics here..."
                            rows={10}
                            className="w-full bg-black border border-white/5 rounded-xl p-4 text-xs font-medium text-zinc-300 focus:outline-none focus:border-pink-500 transition-all resize-none custom-scrollbar"
                        />
                        <button
                            onClick={handleSaveLyrics}
                            disabled={loading}
                            className="w-full py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                            Sync Lyrics
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}

function TagSection({ title, tags, selected, onToggle, colorClass }: any) {
    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 italic">{title}</h4>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                    <button
                        key={tag}
                        onClick={() => onToggle(tag)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${selected.includes(tag) ? `${colorClass} text-white shadow-lg scale-105` : 'bg-black text-zinc-600 border-white/5 hover:border-white/10 hover:text-zinc-400'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
}
