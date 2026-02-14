import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MainHeader } from '@/components/layout/MainHeader';
import { createClient } from '@/lib/db/server';
import { BUSINESS_SECTORS } from '../data';

export default async function SpacesPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Grouping sectors by category for better organization
    const groups = [
        {
            title: "Hospitality & Dining",
            items: BUSINESS_SECTORS.slice(0, 7)
        },
        {
            title: "Wellness & Health",
            items: BUSINESS_SECTORS.slice(7, 13)
        },
        {
            title: "Retail & Fashion",
            items: BUSINESS_SECTORS.slice(13, 19)
        },
        {
            title: "Work & Study Spaces",
            items: BUSINESS_SECTORS.slice(19, 24)
        },
        {
            title: "Entertainment & Lifestyle",
            items: BUSINESS_SECTORS.slice(24, 29)
        }
    ];

    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-white selection:text-black">
            <MainHeader initialUser={user} />

            <main className="pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-[1400px] mx-auto space-y-16">
                    {/* Hero area */}
                    <div className="space-y-6">
                        <Link href="/enterprise" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-4">
                            <ArrowLeft size={16} /> Back to Enterprise
                        </Link>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.0] uppercase italic">
                            The Architecture <br /> of Ambience.
                        </h1>
                        <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl leading-relaxed">
                            Every space has a pulse. We provide the technology to measure, manage, and scale the perfect sonic environment for every single location.
                        </p>
                    </div>

                    {/* Groups Grid */}
                    <div className="space-y-32">
                        {groups.map((group, idx) => (
                            <div key={idx} className="space-y-12">
                                <div className="border-b border-white/10 pb-6">
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white">
                                        {group.title}
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {group.items.map((sector, sIdx) => (
                                        <div key={sIdx} className="group relative aspect-video bg-zinc-900 border border-white/5 overflow-hidden rounded-lg cursor-pointer">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                style={{ backgroundImage: `url(${sector.imagePath || `https://images.unsplash.com/photo-${sector.imageId}?auto=format&fit=crop&q=80&w=800`})` }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-bold text-white leading-tight drop-shadow-lg">{sector.name}</h3>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                                                        View Solution <ExternalLink size={12} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Call to Action */}
                    <div className="py-24 border-t border-white/10 text-center space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase italic">
                            Missing your sector?
                        </h2>
                        <p className="text-xl text-zinc-400 max-w-xl mx-auto">
                            We customize our technology for every environment. Let us design a solution for your specific venue.
                        </p>
                        <Link href="/enterprise#contact-section" className="inline-block px-12 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-zinc-200 transition-all uppercase tracking-widest shadow-2xl">
                            Request Custom Build
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
