import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Globe, MapPin, Globe2, Zap, Shield, Menu } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MainHeader } from '@/components/layout/MainHeader';
import { createClient } from '@/lib/db/server';
import { Metadata } from 'next';
import { BUSINESS_SECTORS } from './data';
import TallyForm from '@/components/shared/TallyForm';

export const metadata: Metadata = {
    title: 'Enterprise',
    description: 'Scale your sonic identity across hundreds of locations. Centralized management, unified billing, and global licensing for large-scale operations.',
};

export default async function EnterprisePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-white selection:text-black">
            {/* Header */}
            <MainHeader initialUser={user} />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2600)' }}
                    />
                </div>

                <div className="relative z-20 max-w-5xl w-full text-center space-y-10">
                    <p className="text-sm font-bold uppercase tracking-[0.4em] text-zinc-400">Enterprise Solutions</p>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.0] uppercase italic">
                        Soundtrack your <br /> entire ecosystem.
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 font-light max-w-3xl mx-auto leading-relaxed">
                        One platform to manage music, licensing, and atmosphere across hundreds of locations. Scale your sound with centralized control.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                        <Link href="#contact-section" className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-transform hover:scale-105 shadow-2xl uppercase tracking-wider">
                            Book a Demo
                        </Link>
                        <Link href="/pricing" className="flex items-center gap-3 font-bold border-b-2 border-white/20 pb-1 hover:border-white transition-all uppercase text-sm tracking-widest text-white">
                            View Pricing <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Centralized Management Section */}
            <section className="py-32 px-6 bg-[#111] overflow-hidden">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic leading-[1.1]">
                                Total Control.<br /> Zero Chaos.
                            </h2>
                            <p className="text-xl text-zinc-400 leading-relaxed max-w-xl">
                                Forget managing individual logins for every franchise. With SonarAura Enterprise, you control the sonic identity of 1,000+ locations from a single HQ dashboard.
                            </p>

                            <ul className="space-y-6 pt-4">
                                {[
                                    { title: "Centralized Scheduling", desc: "Push day-parted playlists to all zones instantly." },
                                    { title: "Granular Permissions", desc: "Give local managers volume control, but keep curation locked." },
                                    { title: "Unified Billing", desc: "One monthly invoice for your entire fleet. No more expense reports." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                                            <Check size={14} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{item.title}</h4>
                                            <p className="text-zinc-500">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visual Representation of Centralized Management */}
                        <div className="flex-1 w-full relative group">
                            <div className="absolute inset-0 bg-violet-500/20 blur-[100px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity" />

                            <div className="relative bg-zinc-900 border border-white/10 rounded-xl p-8 shadow-2xl overflow-hidden aspect-square flex flex-col">
                                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">HQ Dashboard</p>
                                        <h3 className="text-xl font-bold text-white">Global Operations</h3>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold border border-green-500/20">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        System Active
                                    </div>
                                </div>

                                <div className="flex-1 relative">
                                    {/* Central Node */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                        <div className="w-24 h-24 bg-[#111] border border-white/20 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.3)]">
                                            <Globe size={32} className="text-violet-500 mb-1" />
                                            <span className="text-[10px] font-bold text-white">HQ</span>
                                        </div>
                                    </div>

                                    {/* Connecting Lines & Nodes */}
                                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                                        <div key={i} className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}>
                                            <div className="absolute top-0 left-1/2 h-[calc(50%-48px)] w-[1px] bg-gradient-to-b from-white/20 to-transparent -translate-x-1/2 origin-bottom" />
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group-hover:scale-110 transition-transform duration-500" style={{ transform: `translate(-50%, -50%) rotate(-${deg}deg)` }}>
                                                <div className="w-12 h-12 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center">
                                                    <MapPin size={16} className="text-zinc-400" />
                                                </div>
                                                <div className="bg-zinc-900 px-3 py-1 rounded text-[10px] font-bold border border-white/5 whitespace-nowrap">
                                                    Store #{100 + i}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Props Grid - Compact Zig-Zag Horizontal Scroll Style */}
            <section className="py-20 md:py-24 px-6 md:px-12 bg-[#F7D348] text-black overflow-hidden">
                <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12">
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 leading-none">Technical Edge</p>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic leading-[0.9]">
                            Unmatched <br />Infrastructure.
                        </h2>
                    </div>

                    <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-x-visible gap-4 md:gap-12 pb-8 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 items-stretch">
                        {[
                            {
                                title: 'Unlimited Access',
                                subtitle: 'World-Class Music',
                                description: 'Discover exclusive tracks by award-winning composers and up-and-coming artists, tailored for premium venues.',
                                img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1600',
                                badge: 'Catalog'
                            },
                            {
                                title: 'Next-Gen Tools',
                                subtitle: 'Supercharge Teams',
                                description: "Spend less time searching. Use 'Aura Tailor' for smart discovery and centralized playlist management.",
                                img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600',
                                badge: 'Intelligence'
                            },
                            {
                                title: 'Publish Worry-Free',
                                subtitle: 'Worldwide Coverage',
                                description: 'Soundtrack your physical and digital spaces without restrictions. One simple license covers it all.',
                                img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600',
                                badge: 'Legal'
                            }
                        ].map((item, i) => (
                            <div key={i} className={`min-w-[280px] md:min-w-0 flex-shrink-0 group cursor-pointer ${i % 2 === 0 ? 'mt-0' : 'mt-8 md:mt-0'}`}>
                                {/* Image Box (Hidden on Desktop to maintain original look) */}
                                <div className="md:hidden relative aspect-[3/2] overflow-hidden rounded-t-xl bg-black/10">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[3s] group-hover:scale-110"
                                        style={{ backgroundImage: `url(${item.img})` }}
                                    />
                                    <div className="absolute bottom-3 left-3 bg-black px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white italic">
                                        {item.badge}
                                    </div>
                                </div>
                                {/* Content Box */}
                                <div className={`h-full flex flex-col justify-between ${i === 0 ? '' : 'md:border-l md:border-black/10 md:pl-12'
                                    } ${
                                    /* Mobile styling only */
                                    'bg-black text-white p-6 rounded-b-xl md:bg-transparent md:text-black md:p-0 md:rounded-none'
                                    }`}>
                                    <div className="space-y-4 md:space-y-6">
                                        <h3 className="text-xl md:text-5xl font-black italic md:not-italic md:uppercase md:tracking-tight leading-tight md:leading-[0.9]">
                                            {item.title}
                                        </h3>
                                        <p className="md:hidden text-[9px] font-bold uppercase tracking-widest text-indigo-400 italic leading-none">{item.subtitle}</p>
                                        <p className="text-[10px] md:text-lg font-medium leading-relaxed opacity-60 md:opacity-90">
                                            {item.description}
                                        </p>
                                    </div>
                                    <Link href="/about/howitworks" className="flex items-center gap-2 font-black text-[8px] md:text-sm uppercase tracking-widest text-white/40 md:text-black/40 border-b border-white/10 md:border-black/10 w-fit pb-0.5 mt-4 hover:text-indigo-500 hover:border-indigo-500 transition-all">
                                        Learn more <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Licensing Section (New) */}
            <section className="py-32 px-6 bg-[#F2F0EB] text-black">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/50 mb-4">A Unique License Model</p>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                                Music licensing <br /> made easy
                            </h2>
                        </div>
                        <div className="space-y-6 text-lg text-zinc-700 leading-relaxed">
                            <p>
                                Forget lawsuits, surprise fees, copyright claims, and admin headaches. Our direct license model means you&apos;re cleared to use our music globally — regardless of media, territory, or type of content, both online and offline. Removing legal risk for your business.
                            </p>
                            <p>
                                And because we own all the rights to our music, including public performance rights, we can customize our plans to cover all of your soundtracking needs, now and in the future.
                            </p>
                        </div>
                        <Link href="/about/howitworks?page=direct-licensing" className="inline-flex items-center gap-2 font-bold text-black border-b-2 border-black/20 pb-1 hover:border-black transition-all">
                            Learn more <ArrowRight size={18} />
                        </Link>
                    </div>
                    <div className="relative aspect-square bg-[#E0E0E0] overflow-hidden rounded-xl">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200)' }}
                        />
                    </div>
                </div>
            </section>

            {/* Explore Popular Tracks Section */}
            <section className="py-32 px-6 bg-[#1E1E22] text-white">
                <div className="max-w-[1400px] mx-auto space-y-12">
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Tailored Playlists</p>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic">
                            Curated for your space
                        </h2>
                    </div>

                    <BusinessGrid />

                    <div className="flex justify-end">
                        <Link href="/enterprise/spaces" className="px-8 py-3 bg-white/10 text-white rounded-full font-bold text-sm hover:bg-white/20 transition-colors uppercase tracking-widest">
                            Explore all sectors
                        </Link>
                    </div>
                </div>
            </section>

            {/* Clients Section */}
            <section className="py-24 px-6 bg-black border-t border-white/10">
                <div className="max-w-[1400px] mx-auto text-center space-y-12">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Trusted by Global Brands</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos - mimicking text logos for now */}
                        {['Revo Hospitality Group', 'Marriott', 'Equinox', 'W Hotels', 'Aesop'].map(brand => (
                            <span key={brand} className="text-2xl md:text-3xl font-black text-white">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact / CTA Section */}
            <section id="contact-section" className="py-12 md:py-20 px-6 bg-[#D9E1EB] text-black">
                <div className="max-w-4xl mx-auto bg-white p-6 md:p-12 rounded-3xl shadow-2xl text-center space-y-4 md:space-y-6">
                    <div className="space-y-2 md:space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase italic">
                            Ready to scale your sound?
                        </h2>
                        <p className="text-lg text-black/60 max-w-2xl mx-auto">
                            Get a custom quote tailored to your number of locations and specific needs.
                        </p>
                    </div>

                    {/* Tally Form Integration - Seamless & Auto-resizing */}
                    <TallyForm formId="zxqExR" />

                    <p className="text-[10px] text-zinc-400 font-medium -mt-4">
                        By requesting a quote, you agree to our <Link href="/legal" className="underline hover:text-zinc-600 transition-colors">Terms of Service</Link>.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function BusinessGrid() {
    // Randomly select 8 unique items
    const shuffled = [...BUSINESS_SECTORS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 8);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selected.map((item, i) => (
                <div key={i} className="group relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${item.imagePath || `https://images.unsplash.com/photo-${item.imageId}?auto=format&fit=crop&q=80&w=800`})` }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-bold text-white leading-tight shadow-black drop-shadow-md">{item.name}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
