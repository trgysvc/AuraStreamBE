'use client';

import React from 'react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { MainHeader } from '@/components/layout/MainHeader';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ResearchHubPage() {
    const t = useTranslations('About.Research');

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-zinc-100 selection:bg-indigo-500 selection:text-white font-sans">
            <MainHeader />

            <main>
                {/* Hero Section */}
                <section className="py-24 md:py-40 px-6 text-center border-b border-white/5">
                    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
                            {t.rich('hero.title', {
                                br: () => <br />
                            })}
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto font-medium uppercase tracking-tight">
                            {t('hero.desc')}
                        </p>
                        <div className="pt-4">
                            <button className="px-12 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl">
                                {t('hero.button')}
                            </button>
                        </div>
                    </div>
                </section>

                {/* What's in it for you? - Yellow Section */}
                <section className="w-full bg-[#F7D348] text-black py-32 px-6 md:px-12">
                    <div className="max-w-[1200px] mx-auto space-y-24">
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-black text-center">{t('benefits.title')}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-20">

                            {/* Card 1 */}
                            <div className="space-y-10 group">
                                <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-black/5 shadow-2xl border border-black/5">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80 mix-blend-multiply group-hover:mix-blend-normal"
                                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1000&auto=format&fit=crop)' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#F7D348]/40 via-transparent to-transparent opacity-40" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-black">{t('benefits.paid.title')}</h3>
                                    <p className="text-black/70 leading-relaxed text-sm font-medium">
                                        {t('benefits.paid.desc')}
                                    </p>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="space-y-10 group">
                                <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-black/5 shadow-2xl border border-black/5">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80 mix-blend-multiply group-hover:mix-blend-normal"
                                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop)' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#F7D348]/40 via-transparent to-transparent opacity-40" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-black">{t('benefits.peeks.title')}</h3>
                                    <p className="text-black/70 leading-relaxed text-sm font-medium">
                                        {t('benefits.peeks.desc')}
                                    </p>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="space-y-10 group">
                                <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-black/5 shadow-2xl border border-black/5">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80 mix-blend-multiply group-hover:mix-blend-normal"
                                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop)' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#F7D348]/40 via-transparent to-transparent opacity-40" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-black">{t('benefits.influence.title')}</h3>
                                    <p className="text-black/70 leading-relaxed text-sm font-medium">
                                        {t('benefits.influence.desc')}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* How it works - White Section with Side Image */}
                <section className="w-full bg-white text-black py-32 px-6 md:px-12">
                    <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-32">
                        {/* Left Content */}
                        <div className="flex-1 space-y-10 text-left">
                            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">{t('howItWorks.title')}</h2>
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <p className="text-lg md:text-xl leading-relaxed text-zinc-800 font-medium">
                                        <span className="text-black font-black">{t('howItWorks.step1.title')}</span> {t('howItWorks.step1.desc')}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg md:text-xl leading-relaxed text-zinc-800 font-medium">
                                        <span className="text-black font-black">{t('howItWorks.step2.title')}</span> {t('howItWorks.step2.desc')}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg md:text-xl leading-relaxed text-zinc-800 font-medium">
                                        <span className="text-black font-black">{t('howItWorks.step3.title')}</span> {t('howItWorks.step3.desc')}
                                    </p>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.3em] border-b-2 border-black pb-1 hover:text-indigo-600 hover:border-indigo-600 transition-all">
                                    {t('howItWorks.cta')} <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="flex-1 w-full relative aspect-square">
                            <div
                                className="absolute inset-0 bg-cover bg-center rounded-[3rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
                                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1500&auto=format&fit=crop)' }}
                            />
                            {/* Accent Glow */}
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-10 animate-pulse" />
                        </div>
                    </div>
                </section>

                {/* Final CTA Section - Grey Background like Hero */}
                <section className="bg-[#1A1A1A] py-32 md:py-48 px-6 text-center border-t border-white/5">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
                            {t('finalCta.title')}
                        </h2>
                        <div className="pt-4">
                            <button className="px-10 py-4 bg-white text-black rounded-md font-bold text-sm hover:bg-zinc-200 transition-all inline-flex items-center gap-2">
                                {t('finalCta.button')}
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer variant="dark" />
        </div>
    );
}
