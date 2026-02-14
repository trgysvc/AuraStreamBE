'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function HelpCenterPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            <DashboardHeader />

            <main className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
                        <Info size={48} className="text-zinc-500" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Help Center</h1>
                        <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                            Our support architects are currently documenting the factory protocols. <br/>
                            Comprehensive help articles and FAQ will be available soon.
                        </p>
                    </div>
                    <div className="pt-8 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 italic">SonarAura Support Station</p>
                    </div>
                </div>
            </main>

            <Footer variant="dark" />
        </div>
    );
}
