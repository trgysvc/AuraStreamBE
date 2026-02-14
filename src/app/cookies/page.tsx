'use client';

import React from 'react';
import { Footer } from '@/components/layout/Footer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Cookie, Info, ToggleRight, Activity, CloudLightning, Shield } from 'lucide-react';

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            <DashboardHeader />

            <main className="flex-1 max-w-4xl mx-auto px-8 py-24 space-y-16 animate-in fade-in duration-700">
                <header className="space-y-4 border-b border-white/5 pb-12">
                    <div className="flex items-center gap-3 text-amber-500">
                        <Cookie size={32} />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">Cookie Policy</h1>
                    <p className="text-zinc-500 text-lg font-medium">How we use trackers to optimize your factory experience.</p>
                </header>

                <div className="prose prose-invert max-w-none space-y-12 text-zinc-400 leading-relaxed text-sm md:text-base">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight text-glow-amber">What are Cookies?</h2>
                        <p>
                            Cookies and similar technologies (local storage, telemetry trackers) are small data fragments stored on your device. In the Sonaraura ecosystem, these are not just trackers—they are sensors that help us align the "Digital Twin" of our factory with your real-world experience.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Data We Collect & Why</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                                <h4 className="text-white font-bold uppercase italic text-xs flex items-center gap-2">
                                    <ToggleRight size={14} className="text-amber-500" /> Session Intelligence
                                </h4>
                                <p className="text-xs leading-relaxed">We use essential cookies via <strong>Supabase</strong> to keep you securely logged in. Without these, your Aura settings and personalized Smart Flow rules cannot be accessed.</p>
                            </div>
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                                <h4 className="text-white font-bold uppercase italic text-xs flex items-center gap-2">
                                    <Activity size={14} className="text-amber-500" /> Playback Telemetry
                                </h4>
                                <p className="text-xs leading-relaxed">We track interaction data such as <strong>skip rates</strong>, <strong>listening duration</strong>, and <strong>frequency tuning preferences</strong> (432Hz vs 440Hz). This helps our AI refine your space's biorythm and improve the Smart Flow algorithm.</p>
                            </div>
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                                <h4 className="text-white font-bold uppercase italic text-xs flex items-center gap-2">
                                    <CloudLightning size={14} className="text-amber-500" /> Infrastructure Pulse
                                </h4>
                                <p className="text-xs leading-relaxed">We log <strong>search latency</strong> and <strong>CDN response times</strong>. These "performance sensors" tell our architects which global regions need more capacity, ensuring sub-millisecond audio delivery.</p>
                            </div>
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                                <h4 className="text-white font-bold uppercase italic text-xs flex items-center gap-2">
                                    <Shield size={14} className="text-amber-500" /> Fraud Prevention
                                </h4>
                                <p className="text-xs leading-relaxed">Our payment partners (Stripe & Iyzico) use security cookies to detect anomalous behavior, protecting your B2B transactions and subscription integrity.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Improving Your Experience</h2>
                        <p>
                            The data collected through these technologies is strictly used for <strong>Product Evolution</strong>. We do not sell your personal behavior to third-party advertisers. Instead, we use it to:
                        </p>
                        <ul className="space-y-2 text-sm italic">
                            <li className="flex items-center gap-3"><div className="h-1 w-1 rounded-full bg-amber-500" /> Decrease audio buffering times globally.</li>
                            <li className="flex items-center gap-3"><div className="h-1 w-1 rounded-full bg-amber-500" /> Train our AI to predict your venue's peak energy hours more accurately.</li>
                            <li className="flex items-center gap-3"><div className="h-1 w-1 rounded-full bg-amber-500" /> Simplify the user interface by surfacing your most-used taxonomy tags.</li>
                        </ul>
                    </section>
                </div>
            </main>

            <Footer variant="dark" />
        </div>
    );
}
