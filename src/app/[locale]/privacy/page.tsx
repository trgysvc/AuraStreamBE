'use client';

import React from 'react';
import { Footer } from '@/components/layout/Footer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { ShieldCheck, Eye, Lock, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            <DashboardHeader />

            <main className="flex-1 max-w-4xl mx-auto px-8 py-24 space-y-16 animate-in fade-in duration-700">
                <header className="space-y-4 border-b border-white/5 pb-12">
                    <div className="flex items-center gap-3 text-emerald-500">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">Privacy & KVKK</h1>
                    <p className="text-zinc-400 text-lg font-medium">Your data rights within the Sonaraura ecosystem.</p>
                </header>

                <div className="prose prose-invert max-w-none space-y-12 text-zinc-300 leading-relaxed text-sm md:text-base">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" /> 1. Data Controller
                        </h2>
                        <p>
                            In accordance with the <strong>Law on Protection of Personal Data (KVKK) No. 6698</strong>, your personal data is processed by Sonaraura as the "Data Controller". We are committed to protecting the privacy and security of our users' information.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" /> 2. Data We Collect
                        </h2>
                        <ul className="space-y-2 list-disc pl-5">
                            <li><strong>Identity & Contact:</strong> Full name, email address, phone number (for corporate accounts).</li>
                            <li><strong>Account Metadata:</strong> Avatar URL, subscription tier, tenant association.</li>
                            <li><strong>Usage Data:</strong> GPS location (for Weather-Aware features), playback history, search queries.</li>
                            <li><strong>Billing Data:</strong> Tax office, VKN/TCKN, official business address (processed via Stripe/Iyzico).</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" /> 3. Purpose of Processing
                        </h2>
                        <p>
                            Your data is processed to provide a personalized "Digital Twin" experience, automate atmosphere management (Smart Flow), issue legal commercial licenses, and comply with tax regulations in the Republic of Turkey.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" /> 4. Data Transfer to Third Parties
                        </h2>
                        <p>
                            We transfer data to necessary service providers for infrastructure (AWS), payment processing (Stripe, Iyzico), and AI analysis (Google Gemini). All transfers are made under strict confidentiality agreements and in compliance with KVKK Article 8 and 9.
                        </p>
                    </section>

                    <section className="space-y-6 bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem]">
                        <h2 className="text-xl font-black text-emerald-400 uppercase italic tracking-tight">Your Rights Under KVKK Article 11</h2>
                        <p className="text-sm">You have the right to:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-zinc-300">
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-emerald-500" /> Learn if data is processed</li>
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-emerald-500" /> Request information on processing</li>
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-emerald-500" /> Correct incomplete/inaccurate data</li>
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-emerald-500" /> Request deletion or destruction</li>
                        </ul>
                        <p className="text-xs pt-4 border-t border-emerald-500/10">
                            To exercise these rights, please contact our Data Protection Officer at <strong>privacy@sonaraura.com</strong>.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" /> 5. Data Retention
                        </h2>
                        <p>
                            We retain your personal data only for as long as is necessary for the purposes set out in this Privacy Policy and to comply with our legal obligations (such as tax and commercial laws).
                        </p>
                    </section>
                </div>
            </main>

            <Footer variant="dark" />
        </div>
    );
}
