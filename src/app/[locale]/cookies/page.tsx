import React from 'react';
import { Footer } from '@/components/layout/Footer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Cookie, ToggleRight, Activity, CloudLightning, Shield } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface Props {
    params: Promise<{ locale: string }>;
}

export default async function CookiePolicyPage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Legal.Cookies' });

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            <DashboardHeader />

            <main className="flex-1 max-w-4xl mx-auto px-8 py-24 space-y-16 animate-in fade-in duration-700">
                <header className="space-y-4 border-b border-white/5 pb-12">
                    <div className="flex items-center gap-3 text-amber-500">
                        <Cookie size={32} />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">{t('title')}</h1>
                    <p className="text-zinc-500 text-lg font-medium">{t('subtitle')}</p>
                </header>

                <div className="prose prose-invert max-w-none space-y-12 text-zinc-400 leading-relaxed text-sm md:text-base">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight text-glow-amber">{t('what.title')}</h2>
                        <p>{t('what.content')}</p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">{t('collect.title')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                                <h4 className="text-white font-bold uppercase italic text-xs flex items-center gap-2">
                                    <ToggleRight size={14} className="text-amber-500" /> {t('collect.session.title')}
                                </h4>
                                <p className="text-xs leading-relaxed">{t.rich('collect.session.content', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                            </div>
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                                <h4 className="text-white font-bold uppercase italic text-xs flex items-center gap-2">
                                    <Activity size={14} className="text-amber-500" /> {t('collect.telemetry.title')}
                                </h4>
                                <p className="text-xs leading-relaxed">{t.rich('collect.telemetry.content', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                            </div>
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                                <h4 className="text-white font-bold uppercase italic text-xs flex items-center gap-2">
                                    <CloudLightning size={14} className="text-amber-500" /> {t('collect.infra.title')}
                                </h4>
                                <p className="text-xs leading-relaxed">{t.rich('collect.infra.content', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                            </div>
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                                <h4 className="text-white font-bold uppercase italic text-xs flex items-center gap-2">
                                    <Shield size={14} className="text-amber-500" /> {t('collect.fraud.title')}
                                </h4>
                                <p className="text-xs leading-relaxed">{t.rich('collect.fraud.content', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">{t('improve.title')}</h2>
                        <p>{t.rich('improve.content', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                        <ul className="space-y-2 text-sm italic">
                            <li className="flex items-center gap-3"><div className="h-1 w-1 rounded-full bg-amber-500" /> {t('improve.item1')}</li>
                            <li className="flex items-center gap-3"><div className="h-1 w-1 rounded-full bg-amber-500" /> {t('improve.item2')}</li>
                            <li className="flex items-center gap-3"><div className="h-1 w-1 rounded-full bg-amber-500" /> {t('improve.item3')}</li>
                        </ul>
                    </section>
                </div>
            </main>

            <Footer variant="dark" />
        </div>
    );
}
