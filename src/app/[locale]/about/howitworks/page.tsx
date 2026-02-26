'use client';

import React, { useState, Suspense } from 'react';
import { Link } from '@/i18n/navigation';
import {
    Search,
    Book,
    Zap,
    Music,
    Shield,
    Layers,
    Cpu,
    ChevronRight,
    Clock,
    Building2,
    Sparkles,
    CheckCircle2,
    Info,
    Layout,
    CloudLightning,
    DollarSign,
    FileText,
    BarChart3
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

function HelpCenterContent() {
    const t = useTranslations('HowItWorks');
    const searchParams = useSearchParams();
    const initialPage = searchParams.get('page') || 'vision';
    const [activePage, setActivePage] = useState(initialPage);
    const [searchQuery, setSearchQuery] = useState('');

    const HELP_SECTIONS = [
        {
            id: 'getting-started',
            title: t('sections.getting-started'),
            icon: Sparkles,
            pages: [
                { id: 'vision', title: t('pages.vision'), icon: Zap },
                { id: 'how-it-works', title: t('pages.how-it-works'), icon: Info },
                { id: 'account-setup', title: t('pages.account-setup'), icon: CheckCircle2 },
            ]
        },
        {
            id: 'technology',
            title: t('sections.technology'),
            icon: Cpu,
            pages: [
                { id: 'core-stack', title: t('pages.core-stack'), icon: Layers },
                { id: 'ai-engine', title: t('pages.ai-engine'), icon: Zap },
                { id: 'strategic-intel', title: t('pages.strategic-intel'), icon: BarChart3 },
            ]
        },
        {
            id: 'premium-features',
            title: t('sections.premium-features'),
            icon: Zap,
            pages: [
                { id: 'frequency-eng', title: t('pages.frequency-eng'), icon: Zap },
                { id: 'karaoke-engine', title: t('pages.karaoke-engine'), icon: Music },
                { id: 'smart-similarity', title: t('pages.smart-similarity'), icon: Search },
                { id: 'weather-ai', title: t('pages.weather-ai'), icon: CloudLightning },
                { id: 'watermarking', title: t('pages.watermarking'), icon: Shield },
                { id: 'interactive-waveforms', title: t('pages.interactive-waveforms'), icon: Music },
            ]
        },
        {
            id: 'intelligence',
            title: t('sections.intelligence'),
            icon: Cpu,
            pages: [
                { id: 'sync-precision', title: t('pages.sync-precision'), icon: Clock },
                { id: 'biorhythm-ml', title: t('pages.biorhythm-ml'), icon: Zap },
                { id: 'edge-roi', title: t('pages.edge-roi'), icon: Layers },
                { id: 'revenue-intel', title: t('pages.revenue-intel'), icon: DollarSign },
                { id: 'churn-heartbeat', title: t('pages.churn-heartbeat'), icon: BarChart3 },
                { id: 'ui-evolution', title: t('pages.ui-evolution'), icon: Layout },
            ]
        },
        {
            id: 'venue-guide',
            title: t('sections.venue-guide'),
            icon: Building2,
            pages: [
                { id: 'enterprise-hq', title: t('pages.enterprise-hq'), icon: Layers },
                { id: 'playlist-editor', title: t('pages.playlist-editor'), icon: Layout },
                { id: 'smart-flow', title: t('pages.smart-flow'), icon: Zap },
                { id: 'scheduling', title: t('pages.scheduling'), icon: Clock },
                { id: 'b2b-licensing', title: t('pages.b2b-licensing'), icon: Shield },
                { id: 'direct-licensing', title: t('pages.direct-licensing'), icon: FileText },
            ]
        },
        {
            id: 'creator-guide',
            title: t('sections.creator-guide'),
            icon: Music,
            pages: [
                { id: 'upload-qc', title: t('pages.upload-qc'), icon: Layout },
                { id: 'revenue-share', title: t('pages.revenue-share'), icon: DollarSign },
            ]
        },
        {
            id: 'custom-requests',
            title: t('sections.custom-requests'),
            icon: Zap,
            pages: [
                { id: 'tailor-process', title: t('pages.tailor-process'), icon: Layout },
                { id: 'project-soul', title: t('pages.project-soul'), icon: FileText },
            ]
        }
    ];

    function renderContent(id: string) {
        switch (id) {
            case 'vision':
                return (
                    <article className="space-y-10">
                        <header className="space-y-4">
                            <div className="h-16 w-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500">
                                <Zap size={32} />
                            </div>
                            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                                {t.rich('vision.title', {
                                    br: () => <br />
                                })}
                            </h1>
                            <p className="text-xl text-zinc-400 font-medium">{t('vision.subtitle')}</p>
                        </header>

                        <div className="prose prose-invert max-w-none space-y-8">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white border-b border-white/5 pb-2">{t('vision.whoAreWe.title')}</h2>
                                <p className="text-zinc-300 leading-relaxed text-lg">
                                    {t('vision.whoAreWe.p1')}
                                </p>
                                <p className="text-zinc-300 leading-relaxed">
                                    {t('vision.whoAreWe.p2')}
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white border-b border-white/5 pb-2">{t('vision.ourVision.title')}</h2>
                                <p className="text-zinc-300 leading-relaxed">
                                    {t('vision.ourVision.p1')}
                                </p>
                                <p className="text-zinc-300 leading-relaxed">
                                    {t('vision.ourVision.p2')}
                                </p>
                            </section>
                        </div>
                    </article>
                );
            default:
                if (t.has(`content.${id}.title` as any)) {
                    return (
                        <article className="space-y-10">
                            <header className="space-y-4">
                                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400">
                                    <Info size={32} />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                                    {t(`content.${id}.title` as any)}
                                </h1>
                            </header>
                            <div className="prose prose-invert max-w-none space-y-8">
                                <section className="space-y-4">
                                    <p className="text-zinc-300 leading-relaxed text-lg">
                                        {t(`content.${id}.p1` as any)}
                                    </p>
                                    <p className="text-zinc-300 leading-relaxed">
                                        {t(`content.${id}.p2` as any)}
                                    </p>
                                </section>
                            </div>
                        </article>
                    );
                }

                return (
                    <div className="py-20 text-center space-y-4">
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <Info size={40} className="text-zinc-600" />
                        </div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">{t('construction.title')}</h2>
                        <p className="text-zinc-500">{t('construction.desc')}</p>
                    </div>
                );
        }
    }

    return (
        <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white">

            <main className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-80 border-r border-white/5 bg-[#0A0A0A] overflow-y-auto p-8 space-y-10 sticky top-20 h-[calc(100vh-80px)] hidden md:block custom-scrollbar">
                    <div className="space-y-2">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <nav className="space-y-8">
                        {HELP_SECTIONS.map(section => (
                            <div key={section.id} className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-4 flex items-center gap-2">
                                    <section.icon size={12} /> {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.pages.map(page => (
                                        <button
                                            key={page.id}
                                            onClick={() => setActivePage(page.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all ${activePage === page.id
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <page.icon size={16} className={activePage === page.id ? 'text-white' : 'text-zinc-600 group-hover:text-indigo-400'} />
                                                <span className="text-sm font-bold tracking-tight">{page.title}</span>
                                            </div>
                                            <ChevronRight size={14} className={`transition-transform ${activePage === page.id ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <div className="flex-1 p-8 md:p-16 overflow-y-auto max-w-4xl custom-scrollbar min-h-screen">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {renderContent(activePage)}
                    </div>
                </div>
            </main>

            <Footer variant="dark" />
        </div>
    );
}

export default function HelpCenterPage() {
    const t = useTranslations('HowItWorks');
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">{t('loading')}</div>}>
            <HelpCenterContent />
        </Suspense>
    );
}
