import { createClient } from '@/lib/db/server';
import { 
    Sparkles, 
    Music, 
    Zap, 
    ShieldCheck,
    Download,
    ArrowRight,
    Play,
    Settings,
    Crown
} from 'lucide-react';
import Link from 'next/link';
import { EnergyCurve } from '@/lib/logic/EnergyCurve';
import { SmartWeatherCard } from '@/components/feature/venue/SmartWeatherCard';
import { WeatherService } from '@/lib/services/weather';

async function getAuraHomeData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Parallel fetching for speed
    const [profileRes, venueRes, licenseRes, trackRes, requestRes] = await Promise.all([
        supabase.from('profiles').select('*, tenants(*)').eq('id', user.id).single(),
        supabase.from('venues').select('*').eq('owner_id', user.id).limit(1),
        supabase.from('licenses').select('*, tracks(title, cover_image_url)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('tracks').select('*').eq('status', 'active').order('popularity_score', { ascending: false }).limit(4),
        supabase.from('custom_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(2)
    ]);

    const weather = await WeatherService.getCurrentWeather();
    const currentTuning = EnergyCurve.getCurrentTuning();

    return {
        profile: profileRes.data,
        venue: venueRes.data?.[0],
        latestLicenses: licenseRes.data || [],
        topTracks: trackRes.data || [],
        myRequests: requestRes.data || [],
        weather,
        currentTuning,
        time: new Date().getHours()
    };
}

export default async function AuraHomePage() {
    const data = await getAuraHomeData();
    if (!data) return null;

    const { profile, venue, latestLicenses, topTracks, myRequests, currentTuning, time } = data;
    
    const greeting = time < 12 ? 'Good Morning' : time < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="space-y-8 md:space-y-12 pb-24 md:pb-20 animate-in fade-in duration-1000">
            {/* 1. Architecture Welcome Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-b border-white/5 pb-8 md:pb-12">
                <div className="space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                        <h1 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter text-white text-glow leading-tight">
                            {greeting}, <span className="text-indigo-500">{profile?.full_name?.split(' ')[0] || 'Architect'}</span>
                        </h1>
                        {profile?.subscription_tier !== 'free' && (
                            <span className="w-fit bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest md:mt-4">
                                {profile?.subscription_tier} Member
                            </span>
                        )}
                    </div>
                    <p className="text-zinc-500 font-medium text-sm md:text-xl">The Sonaraura ecosystem is fully operational.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-between md:justify-start gap-4 shadow-2xl backdrop-blur-xl">
                        <div className="flex flex-col items-start md:items-end">
                            <span className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Aura Tuning</span>
                            <span className="text-sm md:text-lg font-black text-white italic leading-none">{currentTuning.toUpperCase()}</span>
                        </div>
                        <div className="h-8 w-8 md:h-10 md:w-10 bg-indigo-600/20 rounded-lg md:rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <Zap size={16} className="md:w-5 md:h-5" fill="currentColor" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                {/* 2. Venue Intelligence (B2B Hub) */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between px-2 md:px-0">
                        <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600">Venue Intelligence</h3>
                        <Link href="/dashboard/venue" className="text-[9px] md:text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2 group">
                            Open Venue <ArrowRight size={10} className="md:w-3 md:h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Weather & Vibe Card - NOW DYNAMIC */}
                        <SmartWeatherCard />

                        {/* Active Rule Card */}
                        <div className="bg-[#1E1E22] p-6 md:p-8 rounded-2xl md:rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
                                <Music size={120} className="md:w-[200px] md:h-[200px]" />
                            </div>
                            <div className="space-y-4 md:space-y-6 relative z-10 h-full flex flex-col">
                                <p className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Smart Flow Status</p>
                                {venue ? (
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 md:h-14 md:w-14 bg-green-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-green-500 border border-green-500/20 shadow-inner">
                                                <ShieldCheck size={24} className="md:w-7 md:h-7" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-lg md:text-2xl font-black text-white italic uppercase truncate">{venue.business_name}</h4>
                                                <p className="text-[10px] md:text-xs font-bold text-green-500 uppercase tracking-tighter">System Protected</p>
                                            </div>
                                        </div>
                                        <div className="pt-3 md:pt-4 border-t border-white/5">
                                            <p className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase mb-1 md:mb-2">Next Transition</p>
                                            <p className="text-[12px] md:text-sm font-bold text-zinc-300 italic">Smart Schedule Active</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                                        <p className="text-[12px] md:text-sm font-bold text-zinc-500 italic">No venue registered.</p>
                                        <Link href="/dashboard/venue" className="text-[10px] md:text-xs font-black text-white underline tracking-widest">REGISTER BUSINESS</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Store Highlights */}
                    <div className="bg-[#111] p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-white/5 shadow-2xl space-y-6 md:space-y-8">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Popular Harmonics</h4>
                            <Link href="/store" className="text-[8px] md:text-[9px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">Enter Store</Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {topTracks.map((track) => (
                                <div key={track.id} className="space-y-3 md:space-y-4 group cursor-pointer">
                                    <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-800">
                                        {track.cover_image_url ? (
                                            <img src={track.cover_image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl md:text-2xl">🎵</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Play size={20} className="text-white fill-current md:w-6 md:h-6" />
                                        </div>
                                    </div>
                                    <div className="space-y-0.5 px-0.5 md:px-1">
                                        <p className="text-[10px] md:text-[11px] font-black text-white truncate uppercase italic">{track.title}</p>
                                        <p className="text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase truncate">{track.artist}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Creative Reach (Creator Sidebar) */}
                <div className="lg:col-span-4 space-y-6 md:space-y-8">
                    <div className="space-y-4 md:space-y-6">
                        <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 px-2 md:px-0">Creative Assets</h3>
                        <div className="bg-[#1E1E22] rounded-2xl md:rounded-[3rem] border border-white/5 p-6 md:p-8 space-y-6 md:space-y-8 shadow-2xl">
                            <div className="space-y-4 md:space-y-6">
                                <p className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest border-l-2 border-indigo-500 pl-3 md:pl-4">Recently Licensed</p>
                                {latestLicenses.length > 0 ? latestLicenses.map((license: any) => (
                                    <div key={license.id} className="flex items-center gap-3 md:gap-4 group cursor-default">
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-zinc-800 border border-white/5 overflow-hidden flex-shrink-0">
                                            {license.tracks?.cover_image_url && <img src={license.tracks.cover_image_url} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h5 className="text-[10px] md:text-[11px] font-black text-white uppercase italic truncate">{license.tracks?.title}</h5>
                                            <p className="text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase truncate">Project: {license.project_name}</p>
                                        </div>
                                        <button className="text-zinc-700 hover:text-indigo-400 transition-colors">
                                            <Download size={14} className="md:w-4 md:h-4" />
                                        </button>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-zinc-700 italic font-medium">No licenses registered yet.</p>
                                )}
                            </div>

                            <div className="pt-6 md:pt-8 border-t border-white/5 space-y-4 md:space-y-6">
                                <p className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest border-l-2 border-pink-500 pl-3 md:pl-4">Account Health</p>
                                <div className="space-y-3 md:space-y-4">
                                    <ReachItem icon={ShieldCheck} label="Content ID Whitelist" status="Sync Active" color="text-green-500" />
                                    <ReachItem icon={Zap} label="Frequency Access" status="Full (528Hz)" color="text-indigo-500" />
                                    <ReachItem icon={Crown} label="Elite Support" status="Dedicated" color="text-amber-500" />
                                </div>
                            </div>

                            <Link href="/account" className="block w-full py-4 md:py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-[2rem] text-center text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all mt-6 md:mt-8">
                                <div className="flex items-center justify-center gap-2">
                                    <Settings size={12} className="md:w-3.5 md:h-3.5" /> Global Settings
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Custom Order Status */}
                    {myRequests.length > 0 && (
                        <div className="space-y-4 md:space-y-6 px-2 md:px-0">
                             <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600">Active Requests</h3>
                             <div className="bg-[#1E1E22] rounded-2xl md:rounded-[3rem] border border-white/5 p-6 md:p-8 space-y-4 md:space-y-6 shadow-2xl">
                                {myRequests.map((req: any) => (
                                    <div key={req.id} className="flex items-center justify-between group">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] md:text-[11px] font-black text-white uppercase italic truncate max-w-[120px] md:max-w-[150px]">{req.specs?.project_name || 'Custom Track'}</p>
                                            <p className="text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase">{req.status}</p>
                                        </div>
                                        <div className={`px-2 md:px-3 py-1 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest ${
                                            req.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-indigo-500/10 text-indigo-400'
                                        }`}>
                                            {req.status === 'review' ? 'Action Required' : req.status}
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {/* Premium Callout */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 space-y-4 md:space-y-6 shadow-2xl relative overflow-hidden group cursor-pointer mx-2 md:mx-0">
                        <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                            <Sparkles size={120} className="md:w-40 md:h-40" />
                        </div>
                        <h4 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Need <br/> Something <br/> Unique?</h4>
                        <p className="text-[11px] md:text-xs text-white/70 font-medium leading-relaxed max-w-[200px]">Commission a custom AI track tailored for your brand.</p>
                        <Link href="/dashboard/request" className="inline-flex items-center gap-2 text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest bg-black/20 hover:bg-black/40 px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all">
                            Music on Request <ArrowRight size={10} className="md:w-3 md:h-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReachItem({ icon: Icon, label, status, color }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Icon size={14} className="text-zinc-700" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{label}</span>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{status}</span>
        </div>
    );
}
