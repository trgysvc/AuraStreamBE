'use client';

import React from 'react';
import { Sparkles, Zap, Shield, Repeat, Layout, Search, BarChart3, CloudRain, Wind, Play, Globe } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const FeatureSection = ({
    title,
    subtitle,
    description,
    image,
    reverse = false,
    icon: Icon,
    bgColor = "bg-black",
    textColor = "text-white",
    accentColor = "text-indigo-500",
    descriptionColor = "text-zinc-400",
    link = "/about/howitworks"
}: {
    title: string,
    subtitle: string,
    description: string,
    image: string,
    reverse?: boolean,
    icon: any,
    bgColor?: string,
    textColor?: string,
    accentColor?: string,
    descriptionColor?: string,
    link?: string
}) => (
    <section className={`py-20 md:py-32 px-6 md:px-16 ${bgColor} transition-colors duration-700`}>
        <div className={`max-w-7xl mx-auto flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}>
            <div className="flex-1 space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className={`flex items-center gap-3 ${accentColor} font-black text-xs uppercase tracking-[0.3em]`}>
                    <Icon size={18} />
                    <span>{subtitle}</span>
                </div>
                <h2 className={`text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] ${textColor}`}>
                    {title}
                </h2>
                <p className={`text-lg md:text-xl ${descriptionColor} leading-relaxed max-w-xl font-medium`}>
                    {description}
                </p>
                <div className="pt-4">
                    <Link href={link} className={`inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] border-b-2 ${textColor === 'text-black' ? 'border-black' : 'border-white'} pb-1 hover:text-indigo-500 hover:border-indigo-500 transition-all`}>
                        Learn more
                    </Link>
                </div>
            </div>
            <div className="flex-1 w-full relative group">
                <div className="absolute -inset-4 bg-indigo-500/20 rounded-[3rem] blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700 opacity-50" />
                <div className="relative aspect-[4/3] md:aspect-square overflow-hidden rounded-[2rem] md:rounded-[3.5rem] bg-zinc-900 border border-white/5 ring-1 ring-white/10 shadow-2xl">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
            </div>
        </div>
    </section>
);

const AdvantageCard = ({ icon: Icon, title, description, link = "/about/howitworks" }: { icon: any, title: string, description: string, link?: string }) => (
    <div className="bg-white/5 p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 space-y-4 md:space-y-6 hover:border-indigo-500/30 transition-all group backdrop-blur-sm flex flex-col">
        <div className="h-10 w-10 md:h-14 md:w-14 bg-indigo-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
            <Icon size={24} />
        </div>
        <div className="space-y-2 md:space-y-3 flex-grow">
            <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white">{title}</h3>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-medium">{description}</p>
        </div>
        <Link href={link} className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors">
            Learn more
        </Link>
    </div>
);

const IntelligenceCard = ({ title, description, tag, link = "/about/howitworks" }: { title: string, description: string, tag: string, link?: string }) => (
    <div className="bg-white/[0.02] border border-white/5 p-5 md:p-12 rounded-[1.5rem] md:rounded-[3rem] space-y-4 md:space-y-8 hover:bg-white/[0.04] transition-all group relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-indigo-500/5 blur-[100px] -mr-16 -mt-16 md:-mr-32 md:-mt-32 group-hover:bg-indigo-500/10 transition-colors" />
        <div className="space-y-4 md:space-y-6 relative z-10 flex-grow">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-indigo-500 bg-indigo-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full">{tag}</span>
            <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">{title}</h3>
            <p className="text-base md:text-xl text-zinc-400 leading-relaxed font-medium max-w-lg">{description}</p>
        </div>
        <Link href={link} className="inline-flex items-center gap-3 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors pt-4 md:pt-8 bg-black/0 relative z-10">
            Technical Specs <Sparkles size={14} className="text-indigo-500" />
        </Link>
    </div>
);

export default function CatalogAdPage() {
    const t = useTranslations('About.Ad');

    return (
        <div className="bg-black text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
            <main>
                {/* Tactical Hero */}
                <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center pt-20">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-black to-black z-10" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-50" />
                    </div>

                    <div className="relative z-10 max-w-5xl space-y-8 md:space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Zap size={14} className="text-indigo-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-400">{t('hero.tag')}</span>
                        </div>

                        <div className="space-y-2 md:space-y-4">
                            <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none">
                                {t('hero.title')}<br />
                                <span className="text-indigo-500 text-glow-indigo">{t('hero.subtitle')}</span>
                            </h1>
                            <p className="text-lg md:text-2xl text-zinc-400 font-medium uppercase tracking-tight max-w-2xl mx-auto">
                                {t('hero.desc')}
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 pt-8">
                            <button className="w-full md:w-auto px-10 md:px-12 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95">
                                {t('hero.explore')}
                            </button>
                            <button className="w-full md:w-auto px-10 md:px-12 py-5 bg-transparent text-white border-2 border-white/20 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all backdrop-blur-md">
                                {t('hero.partner')}
                            </button>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-40">
                        <div className="w-px h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
                    </div>
                </section>

                <FeatureSection
                    title={t('features.frequency.title')}
                    subtitle={t('features.frequency.subtitle')}
                    description={t('features.frequency.desc')}
                    image="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1500&auto=format&fit=crop"
                    icon={Repeat}
                    accentColor="text-indigo-500"
                />

                <FeatureSection
                    title={t('features.karaoke.title')}
                    subtitle={t('features.karaoke.subtitle')}
                    description={t('features.karaoke.desc')}
                    image="https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1500&auto=format&fit=crop"
                    icon={Layout}
                    reverse={true}
                    bgColor="bg-zinc-900"
                    accentColor="text-pink-500"
                />

                <FeatureSection
                    title={t('features.weather.title')}
                    subtitle={t('features.weather.subtitle')}
                    description={t('features.weather.desc')}
                    image="https://images.unsplash.com/photo-1438449805896-28a666819a20?q=80&w=1500&auto=format&fit=crop"
                    icon={CloudRain}
                    accentColor="text-cyan-400"
                />

                <FeatureSection
                    title={t('features.smartFlow.title')}
                    subtitle={t('features.smartFlow.subtitle')}
                    description={t('features.smartFlow.desc')}
                    image="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1500&auto=format&fit=crop"
                    icon={Wind}
                    reverse={true}
                    bgColor="bg-indigo-950"
                    accentColor="text-indigo-400"
                />

                {/* The Matrix Section */}
                <section className="py-24 md:py-48 px-6 bg-black relative">
                    <div className="max-w-7xl mx-auto space-y-12 md:space-y-20">
                        <div className="text-center space-y-4">
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-indigo-500">{t('matrix.tag')}</span>
                            <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white">{t('matrix.title')}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            <AdvantageCard
                                icon={Shield}
                                title={t('features.enterprise.title')}
                                description={t('features.enterprise.desc')}
                            />
                            <AdvantageCard
                                icon={Search}
                                title={t('features.studio.title')}
                                description={t('features.studio.desc')}
                            />
                            <AdvantageCard
                                icon={BarChart3}
                                title={t('features.waveforms.title')}
                                description={t('features.waveforms.desc')}
                            />
                        </div>
                    </div>
                </section>

                {/* Intelligence Layer */}
                <section className="py-24 md:py-40 px-6 bg-zinc-900 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
                        <div className="space-y-8 md:space-y-12 order-2 lg:order-1">
                            <IntelligenceCard
                                tag={t('intelligence.tag')}
                                title={t('intelligence.title')}
                                description={t('intelligence.desc')}
                            />
                        </div>
                        <div className="space-y-6 md:space-y-10 order-1 lg:order-2 text-left">
                            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black italic uppercase tracking-tighter text-white leading-none">
                                Aura<br />Autonomous
                            </h2>
                            <div className="space-y-4 md:space-y-6">
                                <div className="flex items-center gap-4 text-zinc-400 group">
                                    <div className="h-px w-8 md:w-12 bg-indigo-500 group-hover:w-20 transition-all" />
                                    <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white">Neural Scheduling</span>
                                </div>
                                <div className="flex items-center gap-4 text-zinc-400 group">
                                    <div className="h-px w-8 md:w-12 bg-indigo-500 group-hover:w-20 transition-all" />
                                    <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white">Global Fleet Sync</span>
                                </div>
                                <div className="flex items-center gap-4 text-zinc-400 group">
                                    <div className="h-px w-8 md:w-12 bg-indigo-500 group-hover:w-20 transition-all" />
                                    <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white">Financial Intel</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final Tactical CTA */}
                <section className="py-32 md:py-64 px-6 relative overflow-hidden bg-black">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-indigo-600/10 mix-blend-overlay" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-indigo-500/10 rounded-full blur-[150px] md:blur-[250px] animate-pulse" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
                        <h2 className="text-5xl md:text-8xl font-white font-black italic uppercase tracking-tighter leading-none">
                            {t('cta.title')}
                        </h2>
                        <p className="text-lg md:text-2xl text-zinc-400 font-medium uppercase tracking-tight">
                            {t('cta.desc')}
                        </p>
                        <div className="pt-8">
                            <button className="px-12 md:px-16 py-6 bg-indigo-600 text-white rounded-full font-black text-xs md:text-sm uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-2xl hover:scale-110 active:scale-95">
                                {t('cta.button')}
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer variant="dark" />
        </div>
    );
}
