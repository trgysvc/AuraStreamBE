'use client';

import React from 'react';
import Link from 'next/link';
import { 
    Zap, 
    Shield, 
    Sparkles, 
    CloudLightning,
    Music,
    ChevronRight,
    Cpu,
    Target,
    Activity,
    Wind
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function AboutUsPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
            <DashboardHeader />

            <main className="flex-1">
                {/* 1. Hero: The Future of Sound */}
                <section className="py-24 px-8 md:px-16 max-w-[1400px] mx-auto">
                    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <div className="space-y-2">
                            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] text-white">
                                The Future of Sound, <br/> 
                                <span className="text-indigo-500 text-glow-indigo">Intelligence of Frequency.</span>
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-white/5">
                            <div className="lg:col-span-4">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 mb-4">Who We Are?</h2>
                                <div className="h-1 w-12 bg-indigo-500" />
                            </div>
                            <div className="lg:col-span-8 space-y-6">
                                <p className="text-xl md:text-2xl text-zinc-300 font-medium leading-relaxed">
                                    Sonaraura transforms music from a mere background element into a living intelligence that manages the atmosphere of a space on biological and emotional levels.
                                </p>
                                <p className="text-lg text-zinc-500 leading-relaxed max-w-3xl">
                                    By merging sound engineering, artificial intelligence, and psychoacoustics, we have built the world's first <strong>Atmospheric Intelligence</strong> platform. We are not an ordinary streaming service. We are a technology company that synchronizes the frequency of sound, the vibe of the environment, and the listener's pulse.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Vision: Architecture */}
                <section className="py-32 bg-[#0A0A0A] border-y border-white/5 px-8 md:px-16">
                    <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-20">
                        <div className="flex-1 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500">Our Vision</h3>
                                <h4 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">Architecture <br/> Beyond Silence</h4>
                            </div>
                            <div className="space-y-6 text-zinc-400 leading-relaxed text-lg">
                                <p>
                                    Every space has a soul, every moment has a frequency. Our goal is to deepen the connection between businesses and creators with their target audiences through <strong>Frequency Engineering</strong>.
                                </p>
                                <p>
                                    We evolve music from the standard 440Hz mold into <strong>432Hz (Peace)</strong> and <strong>528Hz (Focus/Vitality)</strong> frequencies, synchronized with human biology in real-time. While doing this, we maintain the musical rhythm (BPM), re-engineering art with scientific precision.
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full animate-pulse" />
                            <div className="relative grid grid-cols-2 gap-4 w-full max-w-md">
                                {[Zap, Activity, Wind, Cpu].map((Icon, i) => (
                                    <div key={i} className="aspect-square bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center group hover:border-indigo-500/30 transition-all">
                                        <Icon size={40} className="text-zinc-700 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Why Sonaraura? (USP Grid) */}
                <section className="py-32 px-8 md:px-16 max-w-[1400px] mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Technical Superiority</h2>
                        <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Why Sonaraura?</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FeatureCard 
                            icon={Cpu}
                            title="Molecular Sound"
                            subtitle="Frequencies Engineered"
                            desc="We don't just transmit sound; we process it. With our patented technology, we modify track frequencies in real-time to trigger desired emotional states (calm, energy, focus) in the listener."
                            color="text-indigo-500"
                        />
                        <FeatureCard 
                            icon={CloudLightning}
                            title="Weather-Aware AI"
                            subtitle="Atmospheric Sync"
                            desc="Aura sees the world outside your space. When it rains, it makes smooth transitions to warmer, enveloping tones, and to energetic rhythms when the sun comes out."
                            color="text-blue-400"
                        />
                        <FeatureCard 
                            icon={Shield}
                            title="Invisible Protection"
                            subtitle="LSB Watermarking"
                            desc="We embed a digital seal (UUID) into every sound wave we broadcast, imperceptible to the human ear. This provides signal-level protection against copyright issues across platforms."
                            color="text-pink-500"
                        />
                        <FeatureCard 
                            icon={Target}
                            title="Autonomous Music Director"
                            subtitle="Smart Flow AI"
                            desc="An AI that manages your space's energy curve from dawn until midnight. It ends the struggle of manual playlist management, optimizing your biorhythm 24/7."
                            color="text-orange-500"
                        />
                    </div>
                </section>

                {/* 4. Footer Message */}
                <section className="py-24 px-8 border-t border-white/5 bg-zinc-950">
                    <div className="max-w-[1000px] mx-auto text-center space-y-6">
                        <div className="flex justify-center gap-2 mb-4">
                            <Sparkles className="text-indigo-500" size={24} />
                        </div>
                        <h4 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">Sonaraura</h4>
                        <p className="text-xl md:text-2xl text-zinc-500 font-medium italic">The Architecture of Sound, the Frequency of Intelligence.</p>
                        <div className="pt-12">
                            <Link 
                                href="/dashboard/venue" 
                                className="px-12 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl inline-flex items-center gap-3"
                            >
                                Command Center <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer variant="dark" />
        </div>
    );
}

function FeatureCard({ icon: Icon, title, subtitle, desc, color }: any) {
    return (
        <div className="p-10 bg-[#111] border border-white/5 rounded-[3rem] space-y-6 group hover:border-white/10 transition-all relative overflow-hidden">
            <div className={`absolute -right-8 -top-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 ${color}`}>
                <Icon size={180} strokeWidth={1} />
            </div>
            <div className="space-y-4 relative z-10">
                <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-zinc-400 transition-colors">{subtitle}</h4>
                    <h5 className="text-2xl font-black italic uppercase tracking-tight text-white">{title}</h5>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors">
                    {desc}
                </p>
            </div>
        </div>
    );
}
