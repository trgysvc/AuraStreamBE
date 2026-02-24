import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Globe, MapPin } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MainHeader } from '@/components/layout/MainHeader';
import { createClient } from '@/lib/db/server';
import { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { BUSINESS_SECTORS } from './data';
import TallyForm from '@/components/shared/TallyForm';

export const metadata: Metadata = {
    title: 'Enterprise | SonarAura',
    description: 'Scale your sonic identity across hundreds of locations.'
};

export default async function EnterprisePage() {
    const t = await getTranslations('Enterprise');
    const tSector = await getTranslations('Sectors');
    const locale = await getLocale();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <main className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white">
            <MainHeader initialUser={user} />

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover grayscale opacity-40"
                    >
                        <source src="https://sonar-aura-assets.s3.eu-central-1.amazonaws.com/videos/enterprise-hero.mp4" type="video/mp4" />
                    </video>
                </div>

                <div className="relative z-20 max-w-5xl w-full text-center space-y-10">
                    <p className="text-sm font-bold uppercase tracking-[0.4em] text-zinc-400">{t('badge')}</p>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.0] uppercase italic">
                        {t.rich('title', {
                            br: () => <br />
                        })}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 font-light max-w-3xl mx-auto leading-relaxed">
                        {t('description')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                        <Link href="#contact-section" className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-transform hover:scale-105 shadow-2xl uppercase tracking-wider">
                            {t('demo')}
                        </Link>
                        <Link href={`/${locale}/pricing`} className="flex items-center gap-3 font-bold border-b-2 border-white/20 pb-1 hover:border-white transition-all uppercase text-sm tracking-widest text-white">
                            {t('viewPricing')} <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Central Control Section */}
            <section className="py-32 px-6 md:px-12 bg-[#0A0A0B]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic leading-[1.1]">
                                {t.rich('controlTitle', {
                                    br: () => <br />
                                })}
                            </h2>
                            <p className="text-xl text-zinc-400 leading-relaxed max-w-xl">
                                {t('controlDesc')}
                            </p>

                            <ul className="space-y-6 pt-4">
                                {[
                                    { title: t('mgmt.scheduling'), desc: t('mgmt.schedulingDesc') },
                                    { title: t('mgmt.permissions'), desc: t('mgmt.permissionsDesc') },
                                    { title: t('mgmt.billing'), desc: t('mgmt.billingDesc') }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                                            <ArrowRight size={14} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white uppercase">{item.title}</h4>
                                            <p className="text-zinc-500">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex-1 relative w-full">
                            <div className="relative bg-zinc-900 border border-white/10 rounded-xl p-8 shadow-2xl overflow-hidden aspect-square flex flex-col">
                                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">{t('dashboard.badge')}</p>
                                        <h3 className="text-xl font-bold text-white">{t('dashboard.title')}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold border border-green-500/20">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        {t('dashboard.status')}
                                    </div>
                                </div>

                                <div className="flex-1 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                        <div className="w-24 h-24 bg-[#111] border border-white/20 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.3)]">
                                            <Globe size={32} className="text-violet-500 mb-1" />
                                            <span className="text-[10px] font-bold text-white">{t('dashboard.hq')}</span>
                                        </div>
                                    </div>

                                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                                        <div
                                            key={i}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-12"
                                            style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}
                                        >
                                            <div className="w-40 h-px bg-gradient-to-r from-violet-500/50 to-transparent" />
                                            <div style={{ transform: `rotate(-${deg}deg)` }}>
                                                <div className="w-12 h-12 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center">
                                                    <MapPin size={16} className="text-zinc-400" />
                                                </div>
                                                <div className="bg-zinc-900 px-3 py-1 rounded text-[10px] font-bold border border-white/5 whitespace-nowrap">
                                                    {t('dashboard.store')} #{100 + i}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Infrastructure Section */}
            <section className="py-20 md:py-24 px-6 md:px-12 bg-[#F7D348] text-black overflow-hidden">
                <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12">
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 leading-none">{t('infrastructure.badge')}</p>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic leading-[0.9]">
                            {t.rich('infrastructure.title', {
                                br: () => <br />
                            })}
                        </h2>
                    </div>

                    <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible pb-8 md:pb-0 scrollbar-hide">
                        {[
                            {
                                title: t('infrastructure.unlimited'),
                                subtitle: t('infrastructure.catalog'),
                                description: t('infrastructure.unlimitedDesc'),
                                img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1600',
                                badge: t('infrastructure.catalog')
                            },
                            {
                                title: t('infrastructure.tools'),
                                subtitle: t('infrastructure.intelligence'),
                                description: t('infrastructure.toolsDesc'),
                                img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600',
                                badge: t('infrastructure.intelligence')
                            },
                            {
                                title: t('infrastructure.publish'),
                                subtitle: t('infrastructure.legal'),
                                description: t('infrastructure.publishDesc'),
                                img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600',
                                badge: t('infrastructure.legal')
                            }
                        ].map((item, i) => (
                            <div key={i} className={`min-w-[280px] md:min-w-0 flex-shrink-0 group cursor-pointer ${i % 2 === 0 ? 'mt-0' : 'mt-8 md:mt-0'}`}>
                                <div className="relative aspect-[4/5] bg-black overflow-hidden rounded-2xl md:rounded-[2rem]">
                                    <Image
                                        src={item.img}
                                        alt={item.title}
                                        fill
                                        className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                    />
                                    <div className="absolute top-6 left-6 md:top-10 md:left-10 px-4 py-1.5 bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {item.badge}
                                    </div>
                                </div>
                                <div className="mt-6 md:mt-10 px-2 space-y-4 md:space-y-8 flex flex-col items-start h-full">
                                    <div className="space-y-4 md:space-y-6">
                                        <h3 className="text-xl md:text-5xl font-black italic md:not-italic md:uppercase md:tracking-tight leading-tight md:leading-[0.9]">
                                            {item.title}
                                        </h3>
                                        <p className="md:hidden text-[9px] font-bold uppercase tracking-widest text-indigo-400 italic leading-none">{item.subtitle}</p>
                                        <p className="text-[10px] md:text-lg font-medium leading-relaxed opacity-60 md:opacity-90">
                                            {item.description}
                                        </p>
                                    </div>
                                    <Link href={`/${locale}/about/howitworks`} className="flex items-center gap-2 font-black text-[8px] md:text-sm uppercase tracking-widest text-white/40 md:text-black/40 border-b border-white/10 md:border-black/10 w-fit pb-0.5 mt-4 hover:text-indigo-500 hover:border-indigo-500 transition-all">
                                        {t('infrastructure.learnMore')} <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Direct Licensing Section */}
            <section className="py-24 md:py-40 px-6 md:px-12 bg-white text-black overflow-hidden">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/50 mb-4">{t('licensing.badge')}</p>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                                {t.rich('licensing.title', {
                                    br: () => <br />
                                })}
                            </h2>
                        </div>
                        <div className="space-y-6 text-lg text-zinc-700 leading-relaxed">
                            <p>
                                {t('licensing.p1')}
                            </p>
                            <p>
                                {t('licensing.p2')}
                            </p>
                        </div>
                        <Link href={`/${locale}/about/howitworks?page=direct-licensing`} className="inline-flex items-center gap-2 font-bold text-black border-b-2 border-black/20 pb-1 hover:border-black transition-all">
                            {t('infrastructure.learnMore')} <ArrowRight size={18} />
                        </Link>
                    </div>
                    <div className="relative aspect-square bg-[#E0E0E0] overflow-hidden rounded-xl">
                        <Image
                            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1600"
                            alt="Legal & Licensing"
                            fill
                            className="object-cover grayscale"
                        />
                    </div>
                </div>
            </section>

            {/* Business Sectors Preview Grid */}
            <section className="py-32 px-6 bg-[#1E1E22] text-white">
                <div className="max-w-[1400px] mx-auto space-y-12">
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{t('curated.badge')}</p>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic">
                            {t('curated.title')}
                        </h2>
                    </div>

                    <BusinessGrid tSector={tSector} />

                    <div className="flex justify-end">
                        <Link href={`/${locale}/enterprise/spaces`} className="px-8 py-3 bg-white/10 text-white rounded-full font-bold text-sm hover:bg-white/20 transition-colors uppercase tracking-widest">
                            {t('curated.explore')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Clients Section */}
            <section className="py-24 px-6 bg-black border-t border-white/10">
                <div className="max-w-[1400px] mx-auto text-center space-y-12">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">{t('brands')}</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos - mimicking text logos for now */}
                        {['Revo Hospitality Group', 'Marriott', 'Equinox', 'W Hotels', 'Aesop'].map(brand => (
                            <span key={brand} className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact-section" className="py-24 md:py-40 px-6 bg-[#F5F5F0]">
                <div className="max-w-4xl mx-auto bg-white p-6 md:p-12 rounded-3xl shadow-2xl text-center space-y-4 md:space-y-6">
                    <div className="space-y-2 md:space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase italic">
                            {t('cta.title')}
                        </h2>
                        <p className="text-lg text-black/60 max-w-2xl mx-auto">
                            {t('cta.desc')}
                        </p>
                    </div>

                    <TallyForm formId="zxqExR" />

                    <p className="text-[10px] text-zinc-400 font-medium -mt-4">
                        {t.rich('cta.agree', {
                            link: (chunks) => <Link href={`/${locale}/legal`} className="underline hover:text-zinc-600 transition-colors">{chunks}</Link>
                        })}
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}

function BusinessGrid({ tSector }: { tSector: any }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {BUSINESS_SECTORS.slice(0, 10).map((sector, i) => {
                return (
                    <div key={i} className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer">
                        <Image
                            src={sector.imagePath || `https://images.unsplash.com/photo-${sector.imageId}?q=80&w=800`}
                            alt={tSector(sector.key)}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute inset-x-4 bottom-4">
                            <h3 className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">{tSector(sector.key)}</h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
