import { Link } from '@/i18n/navigation';
import { Search, ArrowRight, Menu, X, Play, Building2, Users, Zap, Activity } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MainHeader } from '@/components/layout/MainHeader';
import { createClient } from '@/lib/db/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'HomePage' });

    return {
        title: t('hero.title'),
        description: t('hero.subtitle'),
    };
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'HomePage' });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-white selection:text-black">
            {/* Header */}
            <MainHeader initialUser={user} />

            {/* Hero Section */}
            <section className="relative h-[80vh] md:h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2600&auto=format&fit=crop)' }}
                    />
                </div>

                <div className="relative z-20 max-w-4xl w-full text-center space-y-6 md:space-y-8">
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                        {t('hero.title')}
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-200 font-light max-w-2xl mx-auto">
                        {t('hero.subtitle')}
                    </p>

                    {/* Search Bar - Epidemic Style */}
                    <div className="max-w-2xl mx-auto relative group mt-8 text-left">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-14 pr-12 md:pr-32 py-4 md:py-5 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 text-base md:text-lg shadow-2xl"
                            placeholder={t('hero.search_placeholder')}
                        />
                        <button className="hidden md:block absolute right-2 top-2 bottom-2 bg-black text-white px-8 rounded-full font-bold hover:bg-zinc-800 transition-colors">
                            {t('hero.search_button')}
                        </button>
                    </div>
                </div>
            </section>

            {/* "Music for every story" Section */}
            <section className="py-20 md:py-32 px-6 md:px-12 bg-[#1a1a1a] overflow-hidden">
                <div className="max-w-[1400px] mx-auto space-y-10 md:space-y-14">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="space-y-3">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic leading-[0.95]">
                                {t.rich('sections.categories.title', {
                                    br: () => <br />
                                })}
                            </h2>
                            <p className="text-sm md:text-base text-zinc-400">{t('sections.categories.subtitle')}</p>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 md:gap-5 pb-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                        {[
                            {
                                title: 'YouTube',
                                subtitle: 'Vlogs & Features',
                                img: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1600',
                            },
                            {
                                title: 'Twitch',
                                subtitle: 'Live & Gaming',
                                img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600',
                            },
                            {
                                title: 'Social',
                                subtitle: 'Reels & Stories',
                                img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1600',
                            },
                            {
                                title: 'Brand',
                                subtitle: 'Commercials & Ads',
                                img: 'https://images.unsplash.com/photo-1559136555-9303dff16302?q=80&w=1600',
                            }
                        ].map((item, i) => (
                            <div key={i} className={`min-w-[220px] lg:min-w-0 flex-shrink-0 group cursor-pointer ${i % 2 !== 0 ? 'mt-8 lg:mt-0' : ''}`}>
                                <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${item.img})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                    <div className="absolute bottom-5 left-5 right-5">
                                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-white/70 mb-1">{item.subtitle}</p>
                                        <h3 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight leading-none">{item.title}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 1. Find Similar Section (Yellow) */}
            <section className="py-20 md:py-32 px-6 bg-[#F7D348] text-black overflow-hidden">
                <div className="max-w-[1400px] mx-auto text-center space-y-8 md:space-y-12">
                    <div>
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-4">{t('sections.find_similar.badge')}</p>
                        <h2 className="text-4xl md:text-7xl font-bold tracking-tight leading-[1.1] md:leading-none mb-6">
                            {t.rich('sections.find_similar.title', {
                                br: () => <br className="md:hidden" />
                            })}
                        </h2>
                        <p className="text-base md:text-xl max-w-2xl mx-auto opacity-80">
                            {t('sections.find_similar.description')}
                        </p>
                    </div>

                    {/* High-Fidelity Smart Similarity Mock UI Element */}
                    <div className="relative w-full max-w-[668px] mx-auto aspect-[4/3] md:aspect-[16/10] bg-[#0a0a0a] border border-[#27272a] rounded-2xl md:rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col text-left transform md:rotate-1 hover:rotate-0 hover:scale-[1.02] transition-transform duration-700 scale-[0.85] md:scale-100 transform-origin-top">
                        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between bg-black/40 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" /><path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" /><path d="M10 2v2" /><path d="M7 8H3" /><path d="M21 16h-4" /><path d="M11 3H9" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-base md:text-xl font-black uppercase italic tracking-widest text-white leading-none">Smart Similarity</h3>
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-1">Audio Acoustics Matching Engine</p>
                                </div>
                            </div>
                            <X size={16} className="text-zinc-500" />
                        </div>

                        <div className="p-4 flex-1 flex flex-col gap-4 bg-[#111] overflow-hidden">
                            {/* Reference Track Panel Mock */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 relative overflow-hidden shrink-0">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" /><path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" /><path d="M10 2v2" /><path d="M7 8H3" /><path d="M21 16h-4" /><path d="M11 3H9" /></svg>
                                </div>
                                <div className="relative z-10 flex items-center gap-3 md:gap-4">
                                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-400 border border-white/10 shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                                        <div className="w-6 h-6 rounded-full bg-white/50 blur-md absolute" />
                                    </div>
                                    <div className="flex-1 truncate">
                                        <div className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-0.5 md:mb-1">Reference Source</div>
                                        <h4 className="text-sm md:text-lg font-black tracking-tight text-white uppercase italic leading-none truncate">Soulful Strides</h4>
                                        <p className="text-[9px] md:text-[10px] text-zinc-400 font-medium mt-1 truncate">Sonaraura Studio</p>
                                    </div>
                                </div>

                                {/* Waveform Engine Mock */}
                                <div className="relative w-full h-10 md:h-14 bg-black/40 rounded-lg md:rounded-xl mt-1 overflow-hidden flex items-center px-1">
                                    {/* Fake Waveform Bars */}
                                    <div className="absolute inset-0 flex items-center justify-between px-1 gap-[2px] opacity-40">
                                        {Array.from({ length: 150 }).map((_, i) => {
                                            const h = Math.random() * 80 + 10;
                                            return <div key={i} className="flex-1 bg-white rounded-full" style={{ height: `${h}%` }} />
                                        })}
                                    </div>
                                    {/* Yellow Selection Overlay */}
                                    <div className="absolute top-0 bottom-0 left-[25%] w-[12%] bg-yellow-400/35 border-x border-yellow-400 mix-blend-screen shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 md:w-1 bg-yellow-400/50 cursor-col-resize shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                        <div className="absolute right-0 top-0 bottom-0 w-0.5 md:w-1 bg-yellow-400/50 cursor-col-resize shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-500">Drag yellow loop</span>
                                    <span className="text-[8px] md:text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">0:55 - 1:10</span>
                                </div>
                            </div>

                            {/* Acoustic Matches List Mock */}
                            <div className="flex-1 flex flex-col space-y-2 relative min-h-0">
                                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white mb-1 md:mb-2 shrink-0">Acoustic Matches</h4>

                                {[
                                    { match: '92%', title: 'Dancing Under Feint...', artist: 'sayonaramuse', time: '1:45', highlightLeft: '75%', highlightWidth: '8%' },
                                    { match: '91%', title: 'A Veiled Spotlight', artist: 'sayonaramuse', time: '0:27', highlightLeft: '45%', highlightWidth: '10%' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-xl transition-all group shrink-0">
                                        <div className="w-8 text-center font-black text-[10px] md:text-xs text-zinc-500">{item.match}</div>
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-800 rounded-lg overflow-hidden shrink-0 relative bg-gradient-to-br from-orange-400/20 to-purple-500/20">
                                            <div className="absolute inset-0 bg-black/20" />
                                        </div>
                                        <div className="w-24 md:w-32 shrink-0 truncate">
                                            <h5 className="text-[9px] md:text-[11px] font-bold text-white truncate">{item.title}</h5>
                                            <p className="text-[8px] md:text-[9px] text-zinc-500 truncate">{item.artist}</p>
                                        </div>
                                        <div className="flex-1 hidden md:block px-2">
                                            <div className="relative w-full h-6 bg-black/40 rounded flex items-center px-0.5 overflow-hidden">
                                                {/* Mini Waveform */}
                                                <div className="absolute inset-0 flex items-center justify-between px-0.5 gap-[1px] opacity-20">
                                                    {Array.from({ length: 50 }).map((_, j) => {
                                                        const h = Math.random() * 80 + 10;
                                                        return <div key={j} className="flex-1 bg-white rounded" style={{ height: `${h}%` }} />
                                                    })}
                                                </div>
                                                {/* Highlight Box */}
                                                <div className="absolute top-0 bottom-0 bg-yellow-400/40 border-x border-yellow-500/50 mix-blend-screen" style={{ left: item.highlightLeft, width: item.highlightWidth }} />
                                            </div>
                                        </div>
                                        <div className="w-8 text-right font-black text-[8px] md:text-[10px] text-zinc-500">{item.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Sonaraura Venue / Business Section */}
            <section className="py-20 md:py-32 px-6 bg-[#E8EDF2] text-black overflow-hidden border-b border-black/5">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
                    <div className="flex-1 text-center md:text-left space-y-8 md:space-y-10">
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-zinc-500">{t('sections.venue.badge')}</p>
                        <h2 className="text-4xl md:text-[5rem] font-black tracking-tight leading-[0.9]">
                            {t.rich('sections.venue.title', {
                                br: () => <br />
                            })}
                        </h2>
                        <p className="text-base md:text-2xl font-medium opacity-70 leading-relaxed max-w-xl">
                            {t('sections.venue.description')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 md:gap-6 pt-4">
                            <Link href="/pricing" className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-full font-bold text-base md:text-lg hover:scale-105 transition-transform shadow-2xl uppercase tracking-wider">
                                {t('sections.venue.cta_business')}
                            </Link>
                            <button className="flex items-center justify-center gap-3 font-bold border-b-2 border-black/20 pb-1 hover:border-black transition-all uppercase text-xs tracking-widest">
                                {t('sections.venue.cta_enterprise')} <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative group w-full scale-[0.85] sm:scale-90 md:scale-100 origin-center md:origin-right">
                        {/* Background Glow */}
                        <div className="w-full aspect-video md:aspect-[16/10] bg-indigo-500/10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[100px]" />

                        {/* Enterprise Fleet HQ Mockup Container */}
                        <div className="relative w-full aspect-[4/3] md:aspect-[16/10] bg-[#0a0a0a] rounded-xl border border-white/[0.05] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col font-sans transition-transform duration-700 hover:scale-[1.02]">

                            {/* Header Section */}
                            <div className="p-4 md:p-6 pb-4 border-b border-white/[0.05]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl md:text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                                                Enterprise <span className="text-indigo-500">Fleet</span>
                                            </h3>
                                            <span className="text-[7px] md:text-[9px] font-black italic tracking-widest text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">HQ Control</span>
                                        </div>
                                        <p className="text-[10px] md:text-xs text-zinc-500 font-medium">Central nervous system for your brand ecosystem.</p>
                                    </div>
                                    <button className="bg-white text-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-200 transition-colors">
                                        <Building2 size={12} className="hidden md:block" /> Add Branch
                                    </button>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="p-4 md:p-6 flex-1 flex flex-col gap-4 md:gap-6 bg-[#0f0f0f]">

                                {/* 4 Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                    {/* Active Branches */}
                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl md:rounded-2xl p-3 md:p-4 relative overflow-hidden group">
                                        <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Building2 size={64} className="text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Active Branches</p>
                                            <h4 className="text-3xl md:text-4xl font-black italic text-white tracking-tighter leading-none mb-1">0</h4>
                                            <p className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Operational Hubs</p>
                                        </div>
                                    </div>
                                    {/* Global Personnel */}
                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl md:rounded-2xl p-3 md:p-4 relative overflow-hidden group">
                                        <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Users size={64} className="text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Global Personnel</p>
                                            <h4 className="text-3xl md:text-4xl font-black italic text-white tracking-tighter leading-none mb-1">0</h4>
                                            <p className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Authorized Staff</p>
                                        </div>
                                    </div>
                                    {/* Smart Devices */}
                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl md:rounded-2xl p-3 md:p-4 relative overflow-hidden group hidden md:block">
                                        <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Zap size={64} className="text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Smart Devices</p>
                                            <h4 className="text-3xl md:text-4xl font-black italic text-white tracking-tighter leading-none mb-1">0</h4>
                                            <p className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">0 Synced Now</p>
                                        </div>
                                    </div>
                                    {/* System Pulse */}
                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl md:rounded-2xl p-3 md:p-4 relative overflow-hidden group">
                                        <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Activity size={64} className="text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">System Pulse</p>
                                            <h4 className="text-3xl md:text-4xl font-black italic text-white tracking-tighter leading-none mb-1">99.9%</h4>
                                            <p className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Ecosystem Uptime</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Tables Area */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-2">
                                    {/* Recent Branches */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <h5 className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Recent Branches</h5>
                                            <span className="text-[9px] font-bold text-indigo-400 cursor-pointer hover:underline">Manage All</span>
                                        </div>
                                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden h-32 md:h-40 flex flex-col">
                                            <div className="grid grid-cols-3 gap-2 py-2.5 px-4 bg-white/[0.02] border-b border-white/[0.05] text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                                                <div>Branch Name</div>
                                                <div>Location</div>
                                                <div className="text-right">Action</div>
                                            </div>
                                            <div className="flex-1 flex items-center justify-center">
                                                <p className="text-[10px] md:text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em] italic">No Branches Registered</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Management Team */}
                                    <div className="space-y-3 hidden md:block">
                                        <div className="flex justify-between items-end">
                                            <h5 className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Management Team</h5>
                                            <span className="text-[9px] font-bold text-pink-500 cursor-pointer hover:underline">Authorized Personnel</span>
                                        </div>
                                        <div className="bg-transparent h-32 md:h-40" />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* 3. Categories Grid (Dark) */}
            < section className="py-20 md:py-32 px-6 bg-[#111] text-white" >
                <div className="max-w-[1400px] mx-auto space-y-12 md:space-y-16">
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-center md:text-left leading-tight">
                        {t.rich('sections.all_sound.title', {
                            br: () => <br className="md:hidden" />
                        })}
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { name: t('sections.categories_list.ads'), img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800' },
                            { name: t('sections.categories_list.vlogs'), img: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800' },
                            { name: t('sections.categories_list.cinematic'), img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800' },
                            { name: t('sections.categories_list.travel'), img: 'https://images.unsplash.com/photo-1500835595351-263d8137b6a9?w=800' },
                            { name: t('sections.categories_list.gaming'), img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800' },
                            { name: t('sections.categories_list.tech'), img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800' },
                            { name: t('sections.categories_list.nature'), img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800' },
                            { name: t('sections.categories_list.abstract'), img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800' }
                        ].map((cat, i) => (
                            <div key={i} className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-zinc-900">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${cat.img})` }}
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <span className="text-xl font-bold tracking-tight">{cat.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* 4. Aura Tailor / Custom Music (Studio Background) */}
            < section className="relative py-48 px-6 overflow-hidden" >
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2600)' }}
                />
                <div className="absolute inset-0 bg-black/40" />

                <div className="relative z-10 max-w-[1400px] mx-auto">
                    <div className="max-w-xl bg-[#E996B8] p-12 md:p-16 rounded-sm shadow-2xl space-y-6 text-black">
                        <p className="text-xs font-bold uppercase tracking-[0.2em]">{t('sections.tailor.badge')}</p>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                            {t('sections.tailor.title')}
                        </h2>
                        <p className="text-black/70 text-sm leading-relaxed">
                            {t('sections.tailor.description')}
                        </p>
                        <Link
                            href="/dashboard/request"
                            className="inline-flex items-center gap-2 font-bold border-b-2 border-black pb-1 group mt-4 text-black"
                        >
                            {t('sections.tailor.cta')} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section >

            {/* 5. Value Highlight (Pink) */}
            < section className="py-20 md:py-32 px-6 bg-[#E996B8] text-black" >
                <div className="max-w-[1400px] mx-auto text-center space-y-10 md:space-y-12">
                    <h2 className="text-5xl md:text-[8rem] font-bold tracking-tight leading-[0.9] mb-8 md:mb-12">
                        {t.rich('sections.value.title', {
                            br: () => <br />
                        })}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 text-left max-w-5xl mx-auto pt-10 md:pt-12 border-t border-black/10">
                        <div className="space-y-3">
                            <h3 className="text-xl md:text-2xl font-bold italic">{t('sections.value.tuning.title')}</h3>
                            <p className="text-sm md:text-base opacity-70">{t('sections.value.tuning.description')}</p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl md:text-2xl font-bold italic">{t('sections.value.fingerprint.title')}</h3>
                            <p className="text-sm md:text-base opacity-70">{t('sections.value.fingerprint.description')}</p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl md:text-2xl font-bold italic">{t('sections.value.license.title')}</h3>
                            <p className="text-sm md:text-base opacity-70">{t('sections.value.license.description')}</p>
                        </div>
                    </div>
                    <Link href="/signup" className="inline-block w-full sm:w-auto mt-8 md:mt-12 px-12 py-5 bg-black text-white rounded-full font-bold text-lg md:text-xl hover:scale-105 transition-transform shadow-xl uppercase tracking-widest">
                        {t('sections.value.cta_signup')}
                    </Link>
                </div>
            </section >

            <Footer />
        </div >
    );
}
