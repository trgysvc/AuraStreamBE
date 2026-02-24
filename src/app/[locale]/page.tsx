import { Link } from '@/i18n/navigation';
import { Search, ArrowRight, Menu, X, Play } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MainHeader } from '@/components/layout/MainHeader';
import { createClient } from '@/lib/db/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'HomePage' });

    return {
        title: t('hero.title'),
        description: t('hero.subtitle'),
    };
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'HomePage' });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-white selection:text-black">
            {/* Header */}
            <MainHeader initialUser={user} />

            {/* Hero Section */}
            <section className="relative h-[80vh] md:h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2600&auto=format&fit=crop)' }}
                    />
                </div>

                <div className="relative z-20 max-w-4xl w-full text-center space-y-6 md:space-y-8">
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                        {t('hero.title')}
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-200 font-light max-w-2xl mx-auto">
                        {t('hero.subtitle')}
                    </p>

                    {/* Search Bar - Epidemic Style */}
                    <div className="max-w-2xl mx-auto relative group mt-8 text-left">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-14 pr-12 md:pr-32 py-4 md:py-5 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 text-base md:text-lg shadow-2xl"
                            placeholder={t('hero.search_placeholder')}
                        />
                        <button className="hidden md:block absolute right-2 top-2 bottom-2 bg-black text-white px-8 rounded-full font-bold hover:bg-zinc-800 transition-colors">
                            {t('hero.search_button')}
                        </button>
                    </div>
                </div>
            </section>

            {/* "Music for every story" Section */}
            <section className="py-20 md:py-32 px-6 md:px-12 bg-[#1a1a1a] overflow-hidden">
                <div className="max-w-[1400px] mx-auto space-y-10 md:space-y-14">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="space-y-3">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic leading-[0.95]">
                                {t.rich('sections.categories.title', {
                                    br: () => <br />
                                })}
                            </h2>
                            <p className="text-sm md:text-base text-zinc-400">{t('sections.categories.subtitle')}</p>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 md:gap-5 pb-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                        {[
                            {
                                title: 'YouTube',
                                subtitle: 'Vlogs & Features',
                                img: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1600',
                            },
                            {
                                title: 'Twitch',
                                subtitle: 'Live & Gaming',
                                img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600',
                            },
                            {
                                title: 'Social',
                                subtitle: 'Reels & Stories',
                                img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1600',
                            },
                            {
                                title: 'Brand',
                                subtitle: 'Commercials & Ads',
                                img: 'https://images.unsplash.com/photo-1559136555-9303dff16302?q=80&w=1600',
                            }
                        ].map((item, i) => (
                            <div key={i} className={`min-w-[220px] lg:min-w-0 flex-shrink-0 group cursor-pointer ${i % 2 !== 0 ? 'mt-8 lg:mt-0' : ''}`}>
                                <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${item.img})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                    <div className="absolute bottom-5 left-5 right-5">
                                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-white/70 mb-1">{item.subtitle}</p>
                                        <h3 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight leading-none">{item.title}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 1. Find Similar Section (Yellow) */}
            <section className="py-20 md:py-32 px-6 bg-[#F7D348] text-black overflow-hidden">
                <div className="max-w-[1400px] mx-auto text-center space-y-8 md:space-y-12">
                    <div>
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-4">{t('sections.find_similar.badge')}</p>
                        <h2 className="text-4xl md:text-7xl font-bold tracking-tight leading-[1.1] md:leading-none mb-6">
                            {t.rich('sections.find_similar.title', {
                                br: () => <br className="md:hidden" />
                            })}
                        </h2>
                        <p className="text-base md:text-xl max-w-2xl mx-auto opacity-80">
                            {t('sections.find_similar.description')}
                        </p>
                    </div>

                    {/* Mock UI Element */}
                    <div className="max-w-4xl mx-auto bg-[#18181b] rounded-2xl md:rounded-xl shadow-2xl overflow-hidden text-left transform md:rotate-1 hover:rotate-0 transition-transform duration-500 scale-95 md:scale-100">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <span className="font-bold text-white text-sm">{t('sections.find_similar.mock_ui_title')}</span>
                            <X size={18} className="text-zinc-500" />
                        </div>
                        <div className="p-4 md:p-8 space-y-6">
                            {/* Player Mock */}
                            <div className="flex items-center gap-4 bg-zinc-800/50 p-4 rounded-lg">
                                <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center text-2xl">💿</div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-sm">All Gassed Up</p>
                                    <p className="text-zinc-500 text-xs">Larry Poppinz</p>
                                </div>
                                <div className="flex-1 h-8 bg-zinc-700/30 rounded flex items-center px-2">
                                    <div className="w-full h-1 bg-zinc-600 rounded-full overflow-hidden">
                                        <div className="w-1/3 h-full bg-[#F7D348]" />
                                    </div>
                                </div>
                            </div>
                            {/* List Mock */}
                            <div className="space-y-4 opacity-50">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-zinc-800 rounded" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-2 w-24 bg-zinc-700 rounded" />
                                            <div className="h-2 w-16 bg-zinc-800 rounded" />
                                        </div>
                                        <div className="h-4 w-32 bg-zinc-800 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Sonaraura Venue / Business Section */}
            <section className="py-20 md:py-32 px-6 bg-[#E8EDF2] text-black overflow-hidden border-b border-black/5">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
                    <div className="flex-1 text-center md:text-left space-y-8 md:space-y-10">
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-zinc-500">{t('sections.venue.badge')}</p>
                        <h2 className="text-4xl md:text-[5rem] font-black tracking-tight leading-[0.9]">
                            {t.rich('sections.venue.title', {
                                br: () => <br />
                            })}
                        </h2>
                        <p className="text-base md:text-2xl font-medium opacity-70 leading-relaxed max-w-xl">
                            {t('sections.venue.description')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 md:gap-6 pt-4">
                            <Link href="/pricing" className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-full font-bold text-base md:text-lg hover:scale-105 transition-transform shadow-2xl uppercase tracking-wider">
                                {t('sections.venue.cta_business')}
                            </Link>
                            <button className="flex items-center justify-center gap-3 font-bold border-b-2 border-black/20 pb-1 hover:border-black transition-all uppercase text-xs tracking-widest">
                                {t('sections.venue.cta_enterprise')} <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative group w-full scale-90 md:scale-100">
                        <div className="w-full aspect-video bg-blue-400/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[120px] opacity-60" />

                        <div className="relative w-full aspect-video bg-[#111] rounded-xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                            <div className="p-6 h-full flex flex-col gap-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center">🍒</div>
                                        <div className="space-y-1">
                                            <div className="h-2 w-24 bg-white/20 rounded" />
                                            <div className="h-1.5 w-48 bg-white/10 rounded" />
                                        </div>
                                    </div>
                                    <div className="h-4 w-4 bg-violet-500 rounded-full" />
                                </div>

                                <div className="space-y-3 overflow-hidden">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex items-center gap-4 py-2 border-b border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                                            <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-1.5 w-32 bg-white/20 rounded" />
                                                <div className="h-1 w-20 bg-white/10 rounded" />
                                            </div>
                                            <div className="flex-1 hidden md:block">
                                                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex items-center px-1">
                                                    <div className="h-[2px] w-1/3 bg-violet-400 rounded-full" />
                                                </div>
                                            </div>
                                            <div className="w-12 h-1.5 bg-white/10 rounded" />
                                            <div className="flex gap-2">
                                                <div className="w-4 h-4 bg-white/5 rounded" />
                                                <div className="w-4 h-4 bg-white/5 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-4 gap-3 mt-2">
                                    {[1, 2, 4].map(i => (
                                        <div key={i} className="aspect-square bg-zinc-900 rounded-lg border border-white/5 flex flex-col p-2 gap-2">
                                            <div className="w-full h-2/3 bg-zinc-800 rounded" />
                                            <div className="h-1 w-3/4 bg-white/10 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Categories Grid (Dark) */}
            <section className="py-20 md:py-32 px-6 bg-[#111] text-white">
                <div className="max-w-[1400px] mx-auto space-y-12 md:space-y-16">
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-center md:text-left leading-tight">
                        {t.rich('sections.all_sound.title', {
                            br: () => <br className="md:hidden" />
                        })}
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { name: t('sections.categories_list.ads'), img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800' },
                            { name: t('sections.categories_list.vlogs'), img: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800' },
                            { name: t('sections.categories_list.cinematic'), img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800' },
                            { name: t('sections.categories_list.travel'), img: 'https://images.unsplash.com/photo-1500835595351-263d8137b6a9?w=800' },
                            { name: t('sections.categories_list.gaming'), img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800' },
                            { name: t('sections.categories_list.tech'), img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800' },
                            { name: t('sections.categories_list.nature'), img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800' },
                            { name: t('sections.categories_list.abstract'), img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800' }
                        ].map((cat, i) => (
                            <div key={i} className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-zinc-900">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${cat.img})` }}
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <span className="text-xl font-bold tracking-tight">{cat.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Aura Tailor / Custom Music (Studio Background) */}
            <section className="relative py-48 px-6 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2600)' }}
                />
                <div className="absolute inset-0 bg-black/40" />

                <div className="relative z-10 max-w-[1400px] mx-auto">
                    <div className="max-w-xl bg-[#E996B8] p-12 md:p-16 rounded-sm shadow-2xl space-y-6 text-black">
                        <p className="text-xs font-bold uppercase tracking-[0.2em]">{t('sections.tailor.badge')}</p>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                            {t('sections.tailor.title')}
                        </h2>
                        <p className="text-black/70 text-sm leading-relaxed">
                            {t('sections.tailor.description')}
                        </p>
                        <Link
                            href="/dashboard/request"
                            className="inline-flex items-center gap-2 font-bold border-b-2 border-black pb-1 group mt-4 text-black"
                        >
                            {t('sections.tailor.cta')} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 5. Value Highlight (Pink) */}
            <section className="py-20 md:py-32 px-6 bg-[#E996B8] text-black">
                <div className="max-w-[1400px] mx-auto text-center space-y-10 md:space-y-12">
                    <h2 className="text-5xl md:text-[8rem] font-bold tracking-tight leading-[0.9] mb-8 md:mb-12">
                        {t.rich('sections.value.title', {
                            br: () => <br />
                        })}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 text-left max-w-5xl mx-auto pt-10 md:pt-12 border-t border-black/10">
                        <div className="space-y-3">
                            <h3 className="text-xl md:text-2xl font-bold italic">{t('sections.value.tuning.title')}</h3>
                            <p className="text-sm md:text-base opacity-70">{t('sections.value.tuning.description')}</p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl md:text-2xl font-bold italic">{t('sections.value.fingerprint.title')}</h3>
                            <p className="text-sm md:text-base opacity-70">{t('sections.value.fingerprint.description')}</p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl md:text-2xl font-bold italic">{t('sections.value.license.title')}</h3>
                            <p className="text-sm md:text-base opacity-70">{t('sections.value.license.description')}</p>
                        </div>
                    </div>
                    <Link href="/signup" className="inline-block w-full sm:w-auto mt-8 md:mt-12 px-12 py-5 bg-black text-white rounded-full font-bold text-lg md:text-xl hover:scale-105 transition-transform shadow-xl uppercase tracking-widest">
                        {t('sections.value.cta_signup')}
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
