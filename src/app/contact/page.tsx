'use client';

import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MainHeader } from '@/components/layout/MainHeader';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#111] text-white selection:bg-white selection:text-black font-sans">
            <MainHeader />
            
            <main className="pt-32 md:pt-56 pb-0">
                {/* Hero Section - Constrained */}
                <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12 md:mb-32">
                    <h1 className="text-5xl md:text-7xl lg:text-[8rem] font-black italic uppercase tracking-tighter leading-[0.9] text-white">
                        Contacts
                    </h1>
                </section>

                {/* Grid Layout - Constrained */}
                <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-20 md:mb-32">
                    <div className="grid grid-cols-2 gap-4 md:gap-20">
                        {/* Customer Support Card */}
                        <div className="space-y-4 md:space-y-8 group">
                            <div className="relative aspect-[16/9] overflow-hidden rounded-xl md:rounded-2xl bg-zinc-800">
                                <div 
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-80"
                                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2000&auto=format&fit=crop)' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />
                            </div>
                            <div className="space-y-2 md:space-y-4">
                                <h2 className="text-sm md:text-4xl font-black italic uppercase tracking-tighter text-white">Customer Support</h2>
                                <p className="text-zinc-400 text-[10px] md:text-lg font-medium leading-relaxed max-w-md hidden sm:block">
                                    If you need any support when using Sonaraura, reach out to us at:
                                </p>
                                <div className="flex items-center gap-2 md:gap-3 text-indigo-400 font-bold tracking-tight text-lg md:text-2xl group-hover:text-white transition-colors">
                                    <Mail size={14} className="md:w-6 md:h-6" strokeWidth={2} />
                                    <a href="mailto:support@sonaraura.com" className="truncate">support@sonaraura.com</a>
                                </div>
                            </div>
                        </div>

                        {/* Creator Collaborations Card */}
                        <div className="space-y-4 md:space-y-8 group">
                            <div className="relative aspect-[16/9] overflow-hidden rounded-xl md:rounded-2xl bg-zinc-800">
                                <div 
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-80"
                                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2000&auto=format&fit=crop)' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />
                            </div>
                            <div className="space-y-2 md:space-y-4">
                                <h2 className="text-sm md:text-4xl font-black italic uppercase tracking-tighter text-white">Creator Collaborations</h2>
                                <p className="text-zinc-400 text-[10px] md:text-lg font-medium leading-relaxed max-w-md hidden sm:block">
                                    If you&apos;re a content creator who wants to collaborate with us, reach out to us at:
                                </p>
                                <div className="flex items-center gap-2 md:gap-3 text-indigo-400 font-bold tracking-tight text-lg md:text-2xl group-hover:text-white transition-colors">
                                    <Mail size={14} className="md:w-6 md:h-6" strokeWidth={2} />
                                    <a href="mailto:collaborations@sonaraura.com" className="truncate">collaborations@sonaraura.com</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Content Section (Yellow Background) */}
                <section className="w-full bg-[#F7D348] text-black py-16 md:py-32">
                    <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                        <h2 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter mb-10 md:mb-16">Related content</h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-12">
                            {/* How it works */}
                            <Link href="/about/howitworks" className="space-y-3 md:space-y-6 group">
                                <div className="relative aspect-square overflow-hidden rounded-xl md:rounded-2xl bg-black/5">
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop)' }}
                                    />
                                </div>
                                <h3 className="text-sm md:text-2xl font-black italic uppercase tracking-tighter group-hover:underline decoration-2 underline-offset-4">How it works</h3>
                            </Link>

                            {/* Help Us Improve */}
                            <Link href="/about/research" className="space-y-3 md:space-y-6 group">
                                <div className="relative aspect-square overflow-hidden rounded-xl md:rounded-2xl bg-black/5">
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop)' }} 
                                    />
                                </div>
                                <h3 className="text-sm md:text-2xl font-black italic uppercase tracking-tighter group-hover:underline decoration-2 underline-offset-4">Help Us Improve</h3>
                            </Link>

                            {/* Help Center */}
                            <Link href="/about/help" className="space-y-3 md:space-y-6 group col-span-2 md:col-span-1">
                                <div className="relative aspect-[2/1] md:aspect-square overflow-hidden rounded-xl md:rounded-2xl bg-black/5">
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=1000&auto=format&fit=crop)' }}
                                    />
                                </div>
                                <h3 className="text-sm md:text-2xl font-black italic uppercase tracking-tighter group-hover:underline decoration-2 underline-offset-4">Help Center</h3>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Subscribe Section (Grey Background) */}
                <section className="w-full bg-[#222] text-white py-16 md:py-32 overflow-hidden">
                    <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
                        {/* Left Content */}
                        <div className="w-full md:flex-1 space-y-8 md:space-y-10 text-center md:text-left">
                            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
                                Subscribe to our <br /> latest news
                            </h2>
                            <form className="space-y-6 max-w-md mx-auto md:mx-0 text-left" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">E-mail</label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input 
                                            type="email" 
                                            placeholder="Email"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                        <button className="bg-white text-black px-8 py-3 text-sm font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all whitespace-nowrap">
                                            Subscribe
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-500 font-medium">
                                    By subscribing, you agree to our <Link href="/privacy" className="underline hover:text-white">Privacy policy</Link>
                                </p>
                            </form>
                        </div>

                        {/* Right Visual (Aura Style) */}
                        <div className="hidden md:block md:flex-1 relative w-full h-[500px]">
                            <div 
                                className="absolute inset-0 bg-cover bg-center rounded-3xl opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000"
                                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2000&auto=format&fit=crop)' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-l from-[#222] via-transparent to-transparent" />
                        </div>
                    </div>
                </section>
            </main>

            <Footer variant="dark" />
        </div>
    );
}
