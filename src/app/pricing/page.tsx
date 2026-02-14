import Link from 'next/link';
import { Check, X, ChevronDown, Menu } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { MainHeader } from '@/components/layout/MainHeader';
import { createClient } from '@/lib/db/server';

export default async function PricingPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const plans = [
        {
            name: "Free",
            price: "$0",
            description: "For explorers & music lovers",
            features: [
                "Unlimited catalog browsing",
                "Standard quality preview (440Hz)",
                "Basic semantic search",
                "Community access"
            ],
            buttonText: "Coming Soon",
            highlight: false,
            disabled: true
        },
        {
            name: "Pro",
            price: "$19",
            description: "For elite creators & influencers",
            features: [
                "Unlimited HQ Downloads (WAV)",
                "Frequency Engineering (432Hz/528Hz)",
                "YouTube Dispute Auto-Center",
                "Steganographic Watermarking",
                "Personal License Certificate",
                "Dynamic Lyrics Integration"
            ],
            buttonText: "Coming Soon",
            highlight: false,
            disabled: true
        },
        {
            name: "Business",
            price: "$25",
            description: "For venues & commercial spaces",
            features: [
                "Aura Smart Venue Player",
                "Weather-Aware AI Optimization",
                "Autonomous Smart Flow Scheduling",
                "500MB Intelligent Offline Caching",
                "Public Performance License",
                "Licensed Venue QR Certification"
            ],
            buttonText: "Start for Business",
            highlight: true,
            badge: "Most Popular / Venue Ready"
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For agencies & global corporations",
            features: [
                "Aura Tailor (Custom AI Production)",
                "Master Stems Delivery",
                "Multi-seat Role Management",
                "Global Performance Rights (PRO)",
                "Custom API Integration",
                "24/7 Priority Support Hub"
            ],
            buttonText: "Contact Sales",
            highlight: false,
            badge: "Enterprise"
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-black selection:text-white">
            {/* Header */}
            <MainHeader initialUser={user} />

            {/* 2. Hero Section */}
            <section className="relative min-h-[90vh] flex flex-col items-center pt-48 pb-32 px-6">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2600&auto=format&fit=crop)' }}
                    />
                </div>

                <div className="relative z-20 w-full max-w-[1600px] mx-auto text-center mb-20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Scientific Pricing</p>
                    <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
                        Elite Audio <br /> Plans.
                    </h1>
                </div>

                <div className="relative z-20 w-full max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto items-stretch">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative p-10 rounded-[2.5rem] text-left flex flex-col h-full transition-all duration-700 hover:scale-[1.02] border ${plan.highlight
                                    ? 'bg-white text-black border-white z-10 shadow-[0_40px_120px_-15px_rgba(255,255,255,0.2)]'
                                    : 'bg-zinc-950/60 backdrop-blur-3xl text-white border-white/5 shadow-2xl'
                                    }`}
                            >
                                {plan.badge && (
                                    <div className={`absolute -top-4 left-10 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg ${plan.highlight ? 'bg-indigo-600 text-white' : 'bg-white text-black'
                                        }`}>
                                        {plan.badge}
                                    </div>
                                )}
                                <h3 className="text-4xl font-black uppercase italic mb-2 tracking-tighter leading-none">{plan.name}</h3>
                                <p className={`text-[11px] mb-10 font-bold uppercase tracking-widest leading-relaxed min-h-[40px] ${plan.highlight ? 'text-black/60' : 'text-white/60'}`}>
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-1 mb-10 border-b pb-10 border-white/5">
                                    <span className="text-7xl font-black tracking-tighter">{plan.price}</span>
                                    {plan.name !== 'Enterprise' && <span className="text-sm font-black uppercase opacity-60 ml-2">/ mo</span>}
                                </div>

                                <ul className="space-y-5 mb-14 flex-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-4 text-[13px] font-bold leading-snug">
                                            <Check className={plan.highlight ? 'text-indigo-600' : 'text-white'} size={18} strokeWidth={4} />
                                            <span className="uppercase tracking-tight">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.disabled ? "#" : (plan.name === 'Enterprise' ? '/enterprise#contact-section' : '/signup')}
                                    className={`w-full py-5 text-center rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all ${plan.disabled
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

                    <div className="mt-20 text-center">
                        <Link
                            href="#technical-breakdown"
                            className="inline-flex flex-col items-center gap-3 font-black text-[9px] uppercase tracking-[0.5em] text-zinc-500 hover:text-white transition-all group"
                        >
                            Deep Technical Analysis
                            <ChevronDown size={24} className="animate-bounce text-indigo-400 group-hover:text-white transition-colors" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3. Comparison Section */}
            <section id="technical-breakdown" className="py-40 px-6 bg-[#F5F5F0] text-black rounded-t-[4rem]">
                <div className="max-w-[1200px] mx-auto">
                    <div className="mb-24 text-center md:text-left space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Technical Breakdown</p>
                        <h2 className="text-6xl md:text-8xl font-black tracking-tight uppercase italic leading-[0.8]">
                            Symmetry <br />of Value.
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-[6px] border-black">
                                    <th className="py-10 px-6 text-[10px] font-black uppercase tracking-[0.3em] text-black/50">Architectural Layer</th>
                                    <th className="py-10 px-6 text-2xl font-black uppercase italic">Free</th>
                                    <th className="py-10 px-6 text-2xl font-black uppercase italic">Pro</th>
                                    <th className="py-10 px-6 text-2xl font-black uppercase italic text-indigo-600 underline decoration-4 underline-offset-8">Business</th>
                                    <th className="py-10 px-6 text-2xl font-black uppercase italic">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-sm text-zinc-900">
                                {[
                                    { f: "Universal Catalog Access", v: [true, true, true, true] },
                                    { f: "Frequency Engineering (432Hz/528Hz)", v: [false, true, true, true] },
                                    { f: "Weather-Aware Atmosphere AI", v: [false, false, true, true] },
                                    { f: "Autonomous Smart Flow Director", v: [false, false, true, true] },
                                    { f: "Steganographic Watermarking", v: [false, true, true, true] },
                                    { f: "YouTube Dispute Auto-Center", v: [false, true, false, false] },
                                    { f: "500MB Intelligent Offline Cache", v: [false, false, true, true] },
                                    { f: "Aura Tailor (Custom Production)", v: ["Request", "Request", "Request", true] },
                                    { f: "Licensed Venue Certification (QR)", v: [false, false, true, true] },
                                    { f: "Corporate Multi-seat Access", v: [false, false, true, true] },
                                    { f: "Master Stems & WAV Delivery", v: [false, true, true, true] },
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group">
                                        <td className="py-8 px-6 text-[10px] font-black uppercase tracking-widest text-black/60 group-hover:text-black transition-colors">{row.f}</td>
                                        {row.v.map((val, i) => (
                                            <td key={i} className="py-8 px-6">
                                                {typeof val === 'boolean' ? (
                                                    val ? <Check size={24} strokeWidth={4} className="text-black" /> : <X size={24} strokeWidth={3} className="text-black/10" />
                                                ) : <span className="text-[10px] uppercase font-black tracking-widest bg-black text-white px-3 py-1 rounded-full">{val}</span>}
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
