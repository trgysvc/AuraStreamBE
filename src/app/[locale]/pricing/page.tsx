import { Link } from '@/i18n/navigation';
import { Check, X, ChevronDown } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MainHeader } from '@/components/layout/MainHeader';
import { createClient } from '@/lib/db/server';
import { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';

export const metadata: Metadata = {
    title: 'Pricing',
    description: 'Flexible, scientific pricing for creators and venues. From free browsing to elite enterprise audio ecosystems.',
};

export default async function PricingPage() {
    const t = await getTranslations('Pricing');
    const locale = await getLocale();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const plans = [
        {
            name: t('plans.free.name'),
            price: "$0",
            description: t('plans.free.desc'),
            features: [
                t('features.browsing'),
                t('features.preview'),
                t('features.search'),
                t('features.community')
            ],
            buttonText: t('plans.free.button'),
            highlight: false,
            disabled: true
        },
        {
            name: t('plans.pro.name'),
            price: "$19",
            description: t('plans.pro.desc'),
            features: [
                t('features.hqDownloads'),
                t('features.freqs'),
                t('features.dispute'),
                t('features.watermarking'),
                t('features.licenseCert'),
                t('features.lyrics')
            ],
            buttonText: t('plans.pro.button'),
            highlight: false,
            disabled: true
        },
        {
            name: t('plans.business.name'),
            price: "$25",
            description: t('plans.business.desc'),
            features: [
                t('features.venuePlayer'),
                t('features.weatherAI'),
                t('features.smartFlow'),
                t('features.offline'),
                t('features.perfLicense'),
                t('features.qr')
            ],
            buttonText: t('plans.business.button'),
            highlight: true,
            badge: t('plans.business.badge')
        },
        {
            name: t('plans.enterprise.name'),
            price: t('plans.enterprise.price'),
            description: t('plans.enterprise.desc'),
            features: [
                t('features.tailor'),
                t('features.stems'),
                t('features.roles'),
                t('features.globalPro'),
                t('features.api'),
                t('features.support')
            ],
            buttonText: t('plans.enterprise.button'),
            highlight: false,
            badge: t('plans.enterprise.badge')
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">
            {/* Header */}
            <MainHeader initialUser={user} />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex flex-col items-center pt-32 md:pt-48 pb-24 px-6">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-40"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2600&auto=format&fit=crop)' }}
                    />
                </div>

                <div className="relative z-20 w-full max-w-[1600px] mx-auto text-center mb-12 md:mb-20 space-y-4">
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">{t('scientific')}</p>
                    <h1 className="text-4xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                        {t.rich('title', {
                            br: () => <br />
                        })}
                    </h1>
                </div>

                <div className="relative z-20 w-full max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-[1400px] mx-auto items-stretch">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] text-left flex flex-col h-full transition-all duration-700 hover:scale-[1.02] border ${plan.highlight
                                    ? 'bg-white text-black border-white z-10 shadow-[0_30px_80px_-15px_rgba(255,255,255,0.2)]'
                                    : 'bg-zinc-950/60 backdrop-blur-3xl text-white border-white/5 shadow-2xl'
                                    }`}
                            >
                                {plan.badge && (
                                    <div className={`absolute -top-3 md:-top-4 left-4 md:left-10 px-3 md:px-4 py-1 text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg ${plan.highlight ? 'bg-indigo-600 text-white' : 'bg-white text-black'
                                        }`}>
                                        {plan.badge}
                                    </div>
                                )}
                                <h3 className="text-xl md:text-4xl font-black uppercase italic mb-1 md:mb-2 tracking-tighter leading-none">{plan.name}</h3>
                                <p className={`text-[8px] md:text-[11px] mb-6 md:mb-10 font-bold uppercase tracking-widest leading-none ${plan.highlight ? 'text-black/60' : 'text-white/60'}`}>
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-1 mb-6 md:mb-10 border-b pb-6 md:pb-10 border-black/5 md:border-white/5">
                                    <span className="text-3xl md:text-7xl font-black tracking-tighter">{plan.price}</span>
                                    {plan.name !== t('plans.enterprise.name') && <span className="text-[8px] md:text-sm font-black uppercase opacity-60 ml-1">{t('perMonth')}</span>}
                                </div>

                                <ul className="space-y-3 md:space-y-5 mb-8 md:mb-14 flex-1">
                                    {plan.features.slice(0, 5).map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 md:gap-4 text-[9px] md:text-[13px] font-bold leading-none">
                                            <Check className={plan.highlight ? 'text-indigo-600' : 'text-white'} size={12} strokeWidth={4} />
                                            <span className="uppercase tracking-tight truncate">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.disabled ? "#" : (plan.name === t('plans.enterprise.name') ? `/${locale}/enterprise#contact-section` : `/${locale}/signup`)}
                                    className={`w-full py-3 md:py-5 text-center rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all ${plan.disabled
                                        ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                                        : (plan.highlight
                                            ? 'bg-black text-white hover:bg-indigo-600 shadow-xl'
                                            : 'bg-white text-black hover:bg-indigo-500 hover:text-white')
                                        }`}
                                >
                                    {plan.buttonText}
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 md:mt-20 text-center">
                        <Link
                            href="#technical-breakdown"
                            className="inline-flex flex-col items-center gap-2 md:gap-3 font-black text-[8px] md:text-[9px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-zinc-500 hover:text-white transition-all group"
                        >
                            {t('technicalBreakdown')}
                            <ChevronDown size={20} className="animate-bounce text-indigo-400 group-hover:text-white transition-colors" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section id="technical-breakdown" className="py-24 md:py-40 px-6 bg-[#F5F5F0] text-black rounded-t-[2.5rem] md:rounded-t-[4rem]">
                <div className="max-w-[1200px] mx-auto">
                    <div className="mb-16 md:mb-24 text-center md:text-left space-y-3 md:space-y-4">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-black/40">{t('matrix')}</p>
                        <h2 className="text-4xl md:text-8xl font-black tracking-tight uppercase italic leading-[0.9]">
                            {t.rich('symmetry', {
                                br: () => <br />
                            })}
                        </h2>
                    </div>

                    <div className="overflow-x-auto -mx-6 px-6 custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                            <thead>
                                <tr className="border-b-4 md:border-b-[6px] border-black">
                                    <th className="py-6 md:py-10 px-2 md:px-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-black/50">{t('layer')}</th>
                                    <th className="py-6 md:py-10 px-2 md:px-6 text-sm md:text-2xl font-black uppercase italic">{t('free')}</th>
                                    <th className="py-6 md:py-10 px-2 md:px-6 text-sm md:text-2xl font-black uppercase italic">{t('pro')}</th>
                                    <th className="py-6 md:py-10 px-2 md:px-6 text-sm md:text-2xl font-black uppercase italic text-indigo-600 underline decoration-2 md:decoration-4 underline-offset-4 md:underline-offset-8">{t('business')}</th>
                                    <th className="py-6 md:py-10 px-2 md:px-6 text-sm md:text-2xl font-black uppercase italic">{t('enterprise')}</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-xs md:text-sm text-zinc-900">
                                {[
                                    { f: t('table.universal'), v: [true, true, true, true] },
                                    { f: t('table.freqEng'), v: [false, true, true, true] },
                                    { f: t('table.weather'), v: [false, false, true, true] },
                                    { f: t('table.smartFlow'), v: [false, false, true, true] },
                                    { f: t('table.watermark'), v: [false, true, true, true] },
                                    { f: t('table.dispute'), v: [false, true, false, false] },
                                    { f: t('table.offline'), v: [false, false, true, true] },
                                    { f: t('table.customProd'), v: [t('table.req'), t('table.req'), t('table.req'), true] },
                                    { f: t('table.qr'), v: [false, false, true, true] },
                                    { f: t('table.multiseat'), v: [false, false, true, true] },
                                    { f: t('table.stems'), v: [false, true, true, true] },
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group">
                                        <td className="py-5 md:py-8 px-2 md:px-6 text-[7px] md:text-[10px] font-black uppercase tracking-wider text-black/60 group-hover:text-black transition-colors">{row.f}</td>
                                        {row.v.map((val, i) => (
                                            <td key={i} className="py-5 md:py-8 px-2 md:px-6">
                                                {typeof val === 'boolean' ? (
                                                    val ? <Check size={14} className="md:w-6 md:h-6 text-black" strokeWidth={4} /> : <X size={14} className="md:w-6 md:h-6 text-black/10" strokeWidth={3} />
                                                ) : <span className="text-[7px] md:text-[10px] uppercase font-black tracking-widest bg-black text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full">{val}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
