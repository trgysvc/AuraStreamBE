import React from 'react';
import { Footer } from '@/components/layout/Footer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface Props {
    params: Promise<{ locale: string }>;
}

export default async function PrivacyPolicyPage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Legal.Privacy' });

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            <DashboardHeader />

            <main className="flex-1 max-w-4xl mx-auto px-8 py-24 space-y-16 animate-in fade-in duration-700">
                <header className="space-y-4 border-b border-white/5 pb-12">
                    <div className="flex items-center gap-3 text-emerald-500">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">{t('title')}</h1>
                    <p className="text-zinc-400 text-lg font-medium">{t('subtitle')}</p>
                </header>

                <div className="prose prose-invert max-w-none space-y-12 text-zinc-300 leading-relaxed text-sm md:text-base">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" /> {t('s1.title')}
                        </h2>
                        <p>{t.rich('s1.content', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" /> {t('s2.title')}
                        </h2>
                        <ul className="space-y-2 list-disc pl-5">
                            <li>{t.rich('s2.items.identity', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</li>
                            <li>{t.rich('s2.items.account', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</li>
                            <li>{t.rich('s2.items.usage', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</li>
                            <li>{t.rich('s2.items.billing', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" /> {t('s3.title')}
                        </h2>
                        <p>{t('s3.content')}</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" /> {t('s4.title')}
                        </h2>
                        <p>{t('s4.content')}</p>
                    </section>

                    <section className="space-y-6 bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem]">
                        <h2 className="text-xl font-black text-emerald-400 uppercase italic tracking-tight">{t('rights.title')}</h2>
                        <p className="text-sm">{t('rights.intro')}</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-zinc-300">
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-emerald-500" /> {t('rights.learn')}</li>
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-emerald-500" /> {t('rights.request')}</li>
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-emerald-500" /> {t('rights.correct')}</li>
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-emerald-500" /> {t('rights.delete')}</li>
                        </ul>
                        <p className="text-xs pt-4 border-t border-emerald-500/10">
                            {t.rich('rights.contact', { strong: (chunks) => <strong className="text-white">{chunks}</strong> })}
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" /> {t('s5.title')}
                        </h2>
                        <p>{t('s5.content')}</p>
                    </section>
                </div>
            </main>

            <Footer variant="dark" />
        </div>
    );
}
