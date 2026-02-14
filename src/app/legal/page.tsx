'use client';

import React from 'react';
import { Footer } from '@/components/layout/Footer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Shield, Scale, FileText, Gavel } from 'lucide-react';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            <DashboardHeader />

            <main className="flex-1 max-w-4xl mx-auto px-8 py-24 space-y-16 animate-in fade-in duration-700">
                <header className="space-y-4 border-b border-white/5 pb-12">
                    <div className="flex items-center gap-3 text-indigo-500">
                        <Scale size={32} />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">Terms of Service</h1>
                    <p className="text-zinc-500 text-lg font-medium">Last Updated: February 14, 2026</p>
                </header>

                <div className="prose prose-invert max-w-none space-y-12 text-zinc-400 leading-relaxed text-sm md:text-base">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> 1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using the Sonaraura platform, you agree to be bound by these Terms of Service and all applicable laws and regulations in the Republic of Turkey. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> 2. Description of Service
                        </h2>
                        <p>
                            Sonaraura provides a proprietary "Atmospheric Intelligence" audio streaming and licensing platform. Services include B2B background music for commercial venues, B2C licensing for individual creators, and custom production services (Aura Tailor).
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> 3. Intellectual Property Rights
                        </h2>
                        <p>
                            All audio assets, algorithms, branding, and "Sonic Taxonomy" data are the exclusive property of Sonaraura or its vetted production partners. Unauthorized reproduction, extraction (scraping), or re-distribution of audio signals is strictly prohibited and protected under the <strong>Law on Intellectual and Artistic Works (Law No. 5846)</strong>.
                        </p>
                        <p className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-2xl text-sm italic">
                            Sonaraura utilizes LSB Digital Watermarking. Every stream is embedded with a unique UUID that tracks ownership and prevents unauthorized usage across platforms like YouTube, Instagram, and Twitch.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> 4. Commercial vs. Personal Use
                        </h2>
                        <p>
                            <strong>B2B Subscriptions:</strong> Grants a non-exclusive license for Public Performance within the specified venue. This license is compliant with local performance rights requirements for commercial spaces.
                        </p>
                        <p>
                            <strong>Individual Licenses:</strong> Grants usage for digital content creation (YouTube, Social Media). These licenses are format-agnostic but restricted to a single project per license key.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> 5. Fees and Payments
                        </h2>
                        <p>
                            Fees are billed according to the selected plan. Payments are processed via secure gateways (Stripe/Iyzico). According to <strong>Regulation on Distance Contracts</strong> in Turkey, digital services that are executed immediately are generally non-refundable once the service (streaming or downloading) has commenced.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> 6. Termination
                        </h2>
                        <p>
                            We reserve the right to terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section className="space-y-4 border-t border-white/5 pt-12">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> 7. Governing Law
                        </h2>
                        <p>
                            These terms shall be governed and construed in accordance with the laws of the Republic of Turkey, without regard to its conflict of law provisions. Any dispute arising from these terms shall be subject to the exclusive jurisdiction of the <strong>Istanbul (Central) Courts and Enforcement Offices</strong>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer variant="dark" />
        </div>
    );
}
