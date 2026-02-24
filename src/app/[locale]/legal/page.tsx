import React from 'react';
import { Footer } from '@/components/layout/Footer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Scale } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface Props {
    params: Promise<{ locale: string }>;
}

export default async function TermsOfServicePage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Legal.Terms' });

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            <DashboardHeader />

            <main className="flex-1 max-w-4xl mx-auto px-8 py-24 space-y-16 animate-in fade-in duration-700">
                <header className="space-y-4 border-b border-white/5 pb-12">
                    <div className="flex items-center gap-3 text-indigo-500">
                        <Scale size={32} />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">{t('title')}</h1>
                    <p className="text-zinc-400 text-lg font-medium">{t('lastUpdated')}</p>
                </header>

                <div className="prose prose-invert max-w-none space-y-12 text-zinc-300 leading-relaxed text-sm md:text-base">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> {t('s1.title')}
                        </h2>
                        <p>{t('s1.content')}</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> {t('s2.title')}
                        </h2>
                        <p>{t('s2.content')}</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> {t('s3.title')}
                        </h2>
                        <p>{t.rich('s3.content', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                        <p className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-2xl text-sm italic">
                            {t('s3.watermark')}
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> {t('s4.title')}
                        </h2>
                        <p>
                            <strong>{t('s4.b2b.title')}</strong> {t('s4.b2b.content')}
                        </p>
                        <p>
                            <strong>{t('s4.individual.title')}</strong> {t('s4.individual.content')}
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> {t('s5.title')}
                        </h2>
                        <p>{t.rich('s5.content', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> {t('s6.title')}
                        </h2>
                        <p>{t('s6.content')}</p>
                    </section>

                    <section className="space-y-4 border-t border-white/5 pt-12">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> {t('s7.title')}
                        </h2>
                        <p>{t.rich('s7.content', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                    </section>
                </div>
            </main>

            <Footer variant="dark" />
        </div>
    );
}
