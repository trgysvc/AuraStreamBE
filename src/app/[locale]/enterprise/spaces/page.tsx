import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MainHeader } from '@/components/layout/MainHeader';
import { createClient } from '@/lib/db/server';
import { getTranslations, getLocale } from 'next-intl/server';
import { BUSINESS_SECTORS } from '../data';

export default async function SpacesPage() {
    const t = await getTranslations('Enterprise');
    const tSpaces = await getTranslations('Enterprise.spaces');
    const tSector = await getTranslations('Sectors');
    const locale = await getLocale();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Grouping sectors by category for better organization
    const groups = [
        {
            title: tSpaces('group1'),
            items: BUSINESS_SECTORS.slice(0, 7)
        },
        {
            title: tSpaces('group2'),
            items: BUSINESS_SECTORS.slice(7, 13)
        },
        {
            title: tSpaces('group3'),
            items: BUSINESS_SECTORS.slice(13, 19)
        },
        {
            title: tSpaces('group4'),
            items: BUSINESS_SECTORS.slice(19, 24)
        },
        {
            title: tSpaces('group5'),
            items: BUSINESS_SECTORS.slice(24, 29)
        }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white">
            <MainHeader initialUser={user} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
                <div className="max-w-[1400px] mx-auto space-y-16">
                    {/* Hero area */}
                    <div className="space-y-6">
                        <Link href={`/${locale}/enterprise`} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-4">
                            <ArrowLeft size={16} /> {tSpaces('back')}
                        </Link>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.0] uppercase italic">
                            {tSpaces.rich('title', {
                                br: () => <br />
                            })}
                        </h1>
                        <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl leading-relaxed">
                            {tSpaces('desc')}
                        </p>
                    </div>

                    {/* Sectors Grid */}
                    <div className="space-y-32">
                        {groups.map((group, groupIdx) => (
                            <div key={groupIdx} className="space-y-12">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-sm font-black uppercase tracking-[0.4em] text-indigo-500 whitespace-nowrap">{group.title}</h2>
                                    <div className="h-px w-full bg-white/5" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {group.items.map((sector, i) => (
                                        <div
                                            key={i}
                                            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer"
                                        >
                                            <Image
                                                src={sector.imagePath || `https://images.unsplash.com/photo-${sector.imageId}?q=80&w=800`}
                                                alt={tSector(sector.key)}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                            <div className="absolute inset-x-8 bottom-8">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-bold text-white leading-tight drop-shadow-lg">{tSector(sector.key)}</h3>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                                                        {tSpaces('viewSolution')} <ExternalLink size={12} />
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
                            {tSpaces('missing')}
                        </h2>
                        <p className="text-xl text-zinc-400 max-w-xl mx-auto">
                            {tSpaces('missingDesc')}
                        </p>
                        <Link href={`/${locale}/enterprise#contact-section`} className="inline-block px-12 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-zinc-200 transition-all uppercase tracking-widest shadow-2xl">
                            {t('cta.button')}
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
