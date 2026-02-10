import Link from 'next/link';
import { Search, Play, ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-pink-500 selection:text-white font-sans">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent transition-all duration-300">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-lg">A</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">AuraStream</span>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="#" className="hover:text-gray-300 transition-colors">Music</Link>
                    <Link href="#" className="hover:text-gray-300 transition-colors">Sound Effects</Link>
                    <Link href="#" className="hover:text-gray-300 transition-colors">Pricing</Link>
                    <Link href="#" className="hover:text-gray-300 transition-colors">Blog</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium hover:text-gray-300 transition-colors">
                        Log in
                    </Link>
                    <Link href="/signup" className="hidden sm:inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-black hover:bg-gray-100 transition-transform hover:scale-105">
                        Start Free Trial
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
                {/* Background Video/Image Placeholder */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
                    {/* Using a high-quality abstract dark background to simulate the premium feel */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1614149162883-504ebd4d28cc?q=80&w=2600&auto=format&fit=crop)' }}
                    />
                </div>

                <div className="relative z-10 max-w-4xl w-full text-center space-y-8 mt-20">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                        Soundtrack your content
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
                        Royalty-free music and sound effects for creators.
                        Safe for YouTube, Twitch, Instagram, and more.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-4 rounded-full text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-xl"
                            placeholder="Try 'Cinematic', 'Vlog', or 'Happy'..."
                        />
                        <button className="absolute right-2 top-2 bottom-2 bg-black text-white px-6 rounded-full font-medium hover:bg-gray-800 transition-colors">
                            Search
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition-transform hover:scale-105">
                            Start Free Trial
                        </Link>
                        <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-colors">
                            Browse Music
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <ArrowRight className="rotate-90 text-white/50" size={24} />
                </div>
            </section>

            {/* "Music for every creator" Section */}
            <section className="py-24 px-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">
                            Music for every story.
                            <span className="block text-gray-500 mt-2">Find the perfect track.</span>
                        </h2>
                        <Link href="/dashboard" className="flex items-center gap-2 font-medium hover:gap-4 transition-all">
                            Explore Catalog <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'YouTube', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80' },
                            { title: 'Twitch', img: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80' },
                            { title: 'Podcast', img: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?w=800&q=80' },
                            { title: 'Commercial', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80' }
                        ].map((item, i) => (
                            <div key={i} className="group relative aspect-[4/5] overflow-hidden rounded-2xl cursor-pointer">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${item.img})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                <div className="absolute bottom-6 left-6">
                                    <h3 className="text-2xl font-bold">{item.title}</h3>
                                </div>
                                <div className="absolute bottom-6 right-6 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="bg-white text-black p-3 rounded-full">
                                        <Play size={20} fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features / Value Prop */}
            <section className="py-24 px-6 bg-zinc-900">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mb-6">
                            <Check className="text-white" size={24} />
                        </div>
                        <h3 className="text-xl font-bold">Worry-free licensing</h3>
                        <p className="text-gray-400 leading-relaxed">
                            One subscription covers everything. No copyright claims, no hidden fees. Monetize your content on all major platforms from day one.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-6">
                            <Check className="text-white" size={24} />
                        </div>
                        <h3 className="text-xl font-bold">40,000+ Tracks</h3>
                        <p className="text-gray-400 leading-relaxed">
                            World-class music composed by professional artists. New tracks added daily to keep your content fresh and trending.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-6">
                            <Check className="text-white" size={24} />
                        </div>
                        <h3 className="text-xl font-bold">Try it for free</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Start your 30-day free trial today. Cancel anytime. Keep the content you published during your trial forever.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-32 px-6 bg-black text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-blue-500/20 blur-3xl opacity-30" />
                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to start?</h2>
                    <p className="text-xl text-gray-400">Join over 100,000 creators using AuraStream.</p>
                    <Link href="/signup" className="inline-block px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-gray-100 transition-transform hover:scale-105">
                        Get 30 days free
                    </Link>
                </div>
            </section>

            <footer className="py-12 px-6 bg-black border-t border-zinc-900 text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4">
                <p>&copy; 2026 AuraStream. Inspired by Epidemic Sound.</p>
                <div className="flex gap-6">
                    <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                    <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
                </div>
            </footer>
        </div>
    );
}
