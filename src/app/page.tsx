import Link from 'next/link';
import { Search, ArrowRight, Menu, X } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { createClient } from '@/lib/db/server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-white selection:text-black">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-black/90 backdrop-blur-sm transition-all duration-300 border-b border-white/10">
                <div className="flex items-center gap-8">
                    {/* Logo Area */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-8 w-8 bg-white text-black rounded flex items-center justify-center font-bold">S</div>
                        <span className="text-xl font-black italic tracking-widest text-white">
                            SONAR<span className="font-light text-zinc-300">AURA</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-gray-300">
                        <Link href="/music" className="hover:text-white transition-colors">Music</Link>
                        <Link href="/sound-effects" className="hover:text-white transition-colors">Sound Effects</Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                        <Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    {!user ? (
                        <>
                            <Link href="/login" className="hidden sm:block text-sm font-bold hover:text-gray-300 transition-colors">
                                Log in
                            </Link>
                            <Link href="/signup" className="h-10 px-6 flex items-center justify-center rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors">
                                Start free trial
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard" className="hidden sm:block text-sm font-bold hover:text-gray-300 transition-colors">
                                Dashboard
                            </Link>
                            <Link href="/account" className="h-10 px-6 flex items-center justify-center rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors">
                                Account
                            </Link>
                        </>
                    )}
                    <button className="lg:hidden text-white">
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-[85vh] flex flex-col items-center justify-center px-4 overflow-hidden pt-20">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/50 z-10" />
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2600&auto=format&fit=crop)' }}
                    />
                </div>

                <div className="relative z-20 max-w-4xl w-full text-center space-y-8">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                        Soundtrack your content
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto">
                        Royalty-free music and sound effects for every story.
                    </p>

                    {/* Search Bar - Epidemic Style */}
                    <div className="max-w-2xl mx-auto relative group mt-8 text-left">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-14 pr-32 py-5 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 text-lg shadow-2xl"
                            placeholder="Try 'Cinematic', 'Vlog', or 'Happy'..."
                        />
                        <button className="absolute right-2 top-2 bottom-2 bg-black text-white px-8 rounded-full font-bold hover:bg-zinc-800 transition-colors">
                            Search
                        </button>
                    </div>

                    <div className="pt-6">
                        <p className="text-sm text-gray-300 mb-4 font-medium uppercase tracking-wider">Trusted by</p>
                        <div className="flex justify-center gap-8 opacity-70 grayscale">
                            <div className="h-8 w-24 bg-white/20 rounded"></div>
                            <div className="h-8 w-24 bg-white/20 rounded"></div>
                            <div className="h-8 w-24 bg-white/20 rounded"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* "Music for every story" Section - Redesigned for Premium Look */}
            <section className="py-32 px-6 md:px-12 bg-[#111111]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic">
                                Music for <br />every story.
                            </h2>
                            <p className="text-xl text-zinc-500 font-medium">Find the perfect track for any platform.</p>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] hover:opacity-70 transition-all text-white border-b-2 border-white pb-1">
                            Browse catalog <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: 'YouTube', subtitle: 'vlogs & features', img: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1600' },
                            { title: 'Twitch', subtitle: 'live & gaming', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600' },
                            { title: 'Social', subtitle: 'reels & stories', img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1600' },
                            { title: 'Brand', subtitle: 'commercials & ads', img: 'https://images.unsplash.com/photo-1559136555-9303dff16302?q=80&w=1600' }
                        ].map((item, i) => (
                            <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-sm cursor-pointer">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${item.img})` }}
                                />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
                                <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 transition-colors" />

                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">{item.subtitle}</p>
                                    <h3 className="text-3xl font-black text-white italic uppercase leading-none">{item.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 1. Find Similar Section (Yellow) */}
            <section className="py-32 px-6 bg-[#F7D348] text-black overflow-hidden">
                <div className="max-w-[1400px] mx-auto text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4">Find Similar</p>
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tight leading-none mb-6">
                        Use music to find music.
                    </h2>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-16 opacity-80">
                        Search for tracks with a similar tone and sound, using your favorite riff, hook, drop, or bridge.
                    </p>

                    {/* Mock UI Element */}
                    <div className="max-w-4xl mx-auto bg-[#18181b] rounded-xl shadow-2xl overflow-hidden text-left transform rotate-1 hover:rotate-0 transition-transform duration-500">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <span className="font-bold text-white text-sm">Find similar tracks</span>
                            <X size={18} className="text-zinc-500" />
                        </div>
                        <div className="p-4 md:p-8 space-y-6">
                            {/* Player Mock */}
                            <div className="flex items-center gap-4 bg-zinc-800/50 p-4 rounded-lg">
                                <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center text-2xl">💿</div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-sm">All Gassed Up</p>
                                    <p className="text-zinc-500 text-xs">Larry Poppinz</p>
                                </div>
                                <div className="flex-1 h-8 bg-zinc-700/30 rounded flex items-center px-2">
                                    <div className="w-full h-1 bg-zinc-600 rounded-full overflow-hidden">
                                        <div className="w-1/3 h-full bg-[#F7D348]" />
                                    </div>
                                </div>
                            </div>
                            {/* List Mock */}
                            <div className="space-y-4 opacity-50">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-zinc-800 rounded" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-2 w-24 bg-zinc-700 rounded" />
                                            <div className="h-2 w-16 bg-zinc-800 rounded" />
                                        </div>
                                        <div className="h-4 w-32 bg-zinc-800 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Sonaraura Venue / Business Section (Light Grey/Blue) */}
            <section className="py-32 px-6 bg-[#E8EDF2] text-black overflow-hidden border-b border-black/5">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 text-center md:text-left space-y-10">
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Sonaraura Venue</p>
                        <h2 className="text-4xl md:text-[5rem] font-black tracking-tight leading-[0.9]">
                            Define the <br />spirit of your <br />venue with Aura.
                        </h2>
                        <p className="text-xl md:text-2xl font-medium opacity-70 leading-relaxed max-w-xl">
                            Seamless, high-fidelity, and fully licensed music for your business. Sonaraura Venue doesn&apos;t just play music; it scientifically optimizes your atmosphere with frequency tuning.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4">
                            <Link href="/venue" className="px-10 py-5 bg-black text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl uppercase tracking-wider">
                                Start for your business
                            </Link>
                            <button className="flex items-center gap-3 font-bold border-b-2 border-black/20 pb-1 hover:border-black transition-all uppercase text-sm tracking-widest">
                                Explore enterprise solutions <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative group w-full">
                        {/* Soft Glow Background */}
                        <div className="w-full aspect-video bg-blue-400/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[120px] opacity-60" />

                        {/* Desktop Interface Mockup (Epidemic Playlist Style) */}
                        <div className="relative w-full aspect-video bg-[#111] rounded-xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                            <div className="p-6 h-full flex flex-col gap-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center">🍒</div>
                                        <div className="space-y-1">
                                            <div className="h-2 w-24 bg-white/20 rounded" />
                                            <div className="h-1.5 w-48 bg-white/10 rounded" />
                                        </div>
                                    </div>
                                    <div className="h-4 w-4 bg-violet-500 rounded-full" />
                                </div>

                                {/* Track List Mockup */}
                                <div className="space-y-3 overflow-hidden">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex items-center gap-4 py-2 border-b border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                                            <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-1.5 w-32 bg-white/20 rounded" />
                                                <div className="h-1 w-20 bg-white/10 rounded" />
                                            </div>
                                            <div className="flex-1 hidden md:block">
                                                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex items-center px-1">
                                                    <div className="h-[2px] w-1/3 bg-violet-400 rounded-full" />
                                                </div>
                                            </div>
                                            <div className="w-12 h-1.5 bg-white/10 rounded" />
                                            <div className="flex gap-2">
                                                <div className="w-4 h-4 bg-white/5 rounded" />
                                                <div className="w-4 h-4 bg-white/5 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bottom Grid Mockup */}
                                <div className="grid grid-cols-4 gap-3 mt-2">
                                    {[1, 2, 4].map(i => (
                                        <div key={i} className="aspect-square bg-zinc-900 rounded-lg border border-white/5 flex flex-col p-2 gap-2">
                                            <div className="w-full h-2/3 bg-zinc-800 rounded" />
                                            <div className="h-1 w-3/4 bg-white/10 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Gradient Overlay for Premium Look */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Categories Grid (Dark) */}
            <section className="py-32 px-6 bg-[#111] text-white">
                <div className="max-w-[1400px] mx-auto space-y-16">
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-center md:text-left">
                        A sound for everything.
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { name: 'Ads, Promos & Trailers', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800' },
                            { name: 'Vlogs', img: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800' },
                            { name: 'Cinematic', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800' },
                            { name: 'Travel', img: 'https://images.unsplash.com/photo-1500835595351-263d8137b6a9?w=800' },
                            { name: 'Gaming', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800' },
                            { name: 'Tech', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800' },
                            { name: 'Nature', img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800' },
                            { name: 'Abstract', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800' }
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
            </section>

            {/* 4. Aura Tailor / Custom Music (Studio Background) */}
            <section className="relative py-48 px-6 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2600)' }}
                />
                <div className="absolute inset-0 bg-black/40" />

                <div className="relative z-10 max-w-[1400px] mx-auto">
                    <div className="max-w-xl bg-[#E996B8] p-12 md:p-16 rounded-sm shadow-2xl space-y-6 text-black">
                        <p className="text-xs font-bold uppercase tracking-[0.2em]">Personalized Sound</p>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                            Aura Tailor: Music on Request.
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            SonarAura provides intelligent background music solutions for venues, creators, and businesses.
                        </p>
                        <button className="flex items-center gap-2 font-bold border-b-2 border-black pb-1 group mt-4">
                            Request custom music <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* 5. Value Highlight (Pink) */}
            <section className="py-32 px-6 bg-[#E996B8] text-black">
                <div className="max-w-[1400px] mx-auto text-center space-y-12">
                    <h2 className="text-5xl md:text-[8rem] font-bold tracking-tight leading-[0.9] mb-12">
                        Discover what <br />sound can do.
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left max-w-5xl mx-auto pt-12 border-t border-black/10">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold italic">Frequency Tuning</h3>
                            <p className="opacity-70">Experience your favorite tracks in 432Hz or 528Hz for deeper connection and focus.</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold italic">Sonic Fingerprint</h3>
                            <p className="opacity-70">Every track is uniquely watermarked to ensure 100% safety for your social channels.</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold italic">Universal License</h3>
                            <p className="opacity-70">One simple license that covers all your creative needs, across any platform worldwide.</p>
                        </div>
                    </div>
                    <Link href="/signup" className="inline-block mt-12 px-12 py-5 bg-black text-white rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-xl">
                        Create free account
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
