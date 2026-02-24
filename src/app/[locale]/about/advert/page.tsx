import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, X, Shield, Activity, Cloud, Mic, Play, Lock, BarChart3, Clock, Zap, Layers, Layout } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { Footer } from '@/components/layout/Footer';
import { createClient } from '@/lib/db/server';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
    title: 'Pulse Advertising',
    description: 'Sonaraura Pulse is an AI-powered automated ingestion engine specifically designed for audio advertising. Deliver targeted, high-fidelity sonic experiences.',
};

export default async function AdvertPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const t = await getTranslations('About.Advert');

    const comparisonRows = [
        t.raw('comparison.rows.hz'),
        t.raw('comparison.rows.karaoke'),
        t.raw('comparison.rows.weather'),
        t.raw('comparison.rows.scheduling'),
        t.raw('comparison.rows.watermarking'),
        t.raw('comparison.rows.dispute'),
        t.raw('comparison.rows.metadata'),
        t.raw('precision' in t.raw('comparison.rows') ? t.raw('comparison.rows.precision') : { f: 'Duration Precision', t: '⚠️ Estimated', a: '✅ Real-time File Sync' }),
        t.raw('comparison.rows.roi'),
        t.raw('comparison.rows.production'),
    ];

    // Wait, getTranslations().raw() might be tricky if keys are slightly different or if I use index.
    // I'll manually map them for safety.
    const rows = [
        { f: t('comparison.rows.hz.f'), t: t('comparison.rows.hz.t'), a: t('comparison.rows.hz.a') },
        { f: t('comparison.rows.karaoke.f'), t: t('comparison.rows.karaoke.t'), a: t('comparison.rows.karaoke.a') },
        { f: t('comparison.rows.weather.f'), t: t('comparison.rows.weather.t'), a: t('comparison.rows.weather.a') },
        { f: t('comparison.rows.scheduling.f'), t: t('comparison.rows.scheduling.t'), a: t('comparison.rows.scheduling.a') },
        { f: t('comparison.rows.watermarking.f'), t: t('comparison.rows.watermarking.t'), a: t('comparison.rows.watermarking.a') },
        { f: t('comparison.rows.dispute.f'), t: t('comparison.rows.dispute.t'), a: t('comparison.rows.dispute.a') },
        { f: t('comparison.rows.metadata.f'), t: t('comparison.rows.metadata.t'), a: t('comparison.rows.metadata.a') },
        { f: t('comparison.rows.precision.f'), t: t('comparison.rows.precision.t'), a: t('comparison.rows.precision.a') },
        { f: t('comparison.rows.roi.f'), t: t('comparison.rows.roi.t'), a: t('comparison.rows.roi.a') },
        { f: t('comparison.rows.production.f'), t: t('comparison.rows.production.t'), a: t('comparison.rows.production.a') },
    ];

    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-purple-500 selection:text-white">
            <MainHeader initialUser={user} />

            {/* Hero Section */}
            <section className="relative h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/advert/advert_hero_background.png"
                        alt={t('hero.title')}
                        fill
                        sizes="100vw"
                        className="object-cover opacity-60"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/30 via-transparent to-[#111111] z-10" />
                </div>

                <div className="relative z-20 max-w-5xl w-full text-center space-y-8 animate-fade-in-up">
                    <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-purple-400">
                        {t('hero.tag')}
                    </p>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                        {t('hero.title')}
                    </h1>
                    <p className="text-xl md:text-3xl text-gray-300 font-light max-w-3xl mx-auto italic">
                        {t('hero.desc')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link href="/signup" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 justify-center">
                            {t('hero.start')} <ArrowRight size={20} />
                        </Link>
                        <Link href="#features" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-full hover:bg-white/20 transition-colors border border-white/10">
                            {t('hero.explore')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 md:px-12 bg-[#111111]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t('features.title')}</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">{t('features.desc')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Feature 1: Frequency Engineering */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="/images/advert/molecular_sound_frequency.png"
                                alt={t('features.frequency.title')}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Activity className="text-purple-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">{t('features.frequency.title')}</h3>
                                <p className="text-gray-400 text-sm">{t('features.frequency.desc')}</p>
                            </div>
                        </div>

                        {/* Feature 2: Aura Karaoke Engine */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="/images/advert/aura_karaoke_lyrics.png"
                                alt={t('features.karaoke.title')}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Mic className="text-pink-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">{t('features.karaoke.title')}</h3>
                                <p className="text-gray-400 text-sm">{t('features.karaoke.desc')}</p>
                            </div>
                        </div>

                        {/* Feature 3: Weather-Aware AI */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="/images/advert/weather_aware_ai_sound.png"
                                alt={t('features.weather.title')}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Cloud className="text-blue-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">{t('features.weather.title')}</h3>
                                <p className="text-gray-400 text-sm">{t('features.weather.desc')}</p>
                            </div>
                        </div>

                        {/* Feature 4: Smart Flow */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="/images/advert/smart_flow_schedule.png"
                                alt={t('features.smartFlow.title')}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Zap className="text-yellow-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">{t('features.smartFlow.title')}</h3>
                                <p className="text-gray-400 text-sm">{t('features.smartFlow.desc')}</p>
                            </div>
                        </div>

                        {/* Feature 5: Enterprise HQ */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000"
                                alt={t('features.enterprise.title')}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Layers className="text-indigo-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">{t('features.enterprise.title')}</h3>
                                <p className="text-gray-400 text-sm">{t('features.enterprise.desc')}</p>
                            </div>
                        </div>

                        {/* Feature 6: Playlist Studio */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000"
                                alt={t('features.studio.title')}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Layout className="text-pink-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">{t('features.studio.title')}</h3>
                                <p className="text-gray-400 text-sm">{t('features.studio.desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table Section */}
            <section className="py-24 px-6 md:px-12 bg-zinc-900/30">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">{t('comparison.title')}</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="py-6 px-4 text-gray-400 font-medium">{t('comparison.head.feature')}</th>
                                    <th className="py-6 px-4 text-gray-400 font-medium">{t('comparison.head.traditional')}</th>
                                    <th className="py-6 px-4 text-white font-bold text-xl">{t('comparison.head.aura')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 font-medium">{row.f}</td>
                                        <td className="py-4 px-4 text-gray-500">{row.t}</td>
                                        <td className="py-4 px-4 text-purple-300 font-semibold shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-purple-500/5 rounded-lg">{row.a}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Technical Deep Dive */}
            <section className="py-24 px-6 md:px-12 bg-[#111111] overflow-hidden">
                <div className="max-w-[1400px] mx-auto space-y-32">

                    {/* Deep Dive 1: Signal Protection */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 order-2 md:order-1 relative">
                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl shadow-purple-900/20 border border-white/10">
                                <Image
                                    src="/images/advert/signal_protection_watermark.png"
                                    alt={t('deepDive.signal.title')}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>
                            {/* Decorative blurred blob */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-[80px]" />
                        </div>
                        <div className="flex-1 space-y-6 order-1 md:order-2">
                            <div className="p-3 bg-blue-500/10 rounded-lg inline-block text-blue-400"><Shield size={24} /></div>
                            <h3 className="text-3xl md:text-5xl font-bold">{t('deepDive.signal.title')}</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                {t('deepDive.signal.desc')}
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>LSB Watermarking</span></li>
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>YouTube Dispute Ready</span></li>
                            </ul>
                        </div>
                    </div>

                    {/* Deep Dive 2: Interactive Waveforms */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 space-y-6 md:order-2">
                            <div className="p-3 bg-pink-500/10 rounded-lg inline-block text-pink-400"><Activity size={24} /></div>
                            <h3 className="text-3xl md:text-5xl font-bold">{t('deepDive.waveforms.title')}</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                {t('deepDive.waveforms.desc')}
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>Canlı Visualizer</span></li>
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>Doku Analizi</span></li>
                            </ul>
                        </div>
                        <div className="flex-1 relative md:order-1">
                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl shadow-pink-900/20 border border-white/10">
                                <Image
                                    src="/images/advert/interactive_waveforms_discovery.png"
                                    alt={t('deepDive.waveforms.title')}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/30 rounded-full blur-[80px]" />
                        </div>
                    </div>

                    {/* Deep Dive 3: AI Analytics */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 order-2 md:order-1 relative">
                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl shadow-green-900/20 border border-white/10">
                                <Image
                                    src="/images/advert/elite_ai_analytics_dashboard.png"
                                    alt={t('deepDive.analytics.title')}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-500/10 rounded-full blur-[100px]" />
                        </div>
                        <div className="flex-1 space-y-6 order-1 md:order-2">
                            <div className="p-3 bg-green-500/10 rounded-lg inline-block text-green-400"><BarChart3 size={24} /></div>
                            <h3 className="text-3xl md:text-5xl font-bold">{t('deepDive.analytics.title')}</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                {t('deepDive.analytics.desc')}
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>JIT Rendering & ROI</span></li>
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>Churn Heartbeat</span></li>
                            </ul>
                        </div>
                    </div>

                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 text-center bg-gradient-to-t from-purple-900/20 to-transparent border-t border-white/5">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tight">{t('cta.title')}</h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        {t('cta.desc')}
                    </p>
                    <Link href="/signup" className="inline-block px-12 py-5 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        {t('cta.button')}
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
