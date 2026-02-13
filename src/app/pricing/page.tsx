'use client';

import Link from 'next/link';
import { ArrowRight, Check, X, ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { Footer } from '@/components/layout/Footer';

export default function PricingPage() {
    const compareRef = useRef<HTMLDivElement>(null);

    const scrollToCompare = () => {
        compareRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const plans = [
        {
            name: "Free",
            price: "$0",
            description: "For explorers & music lovers",
            features: [
                "Unlimited catalog browsing",
                "Standard quality preview",
                "Basic search functionality",
                "Community access"
            ],
            buttonText: "Coming Soon",
            highlight: false,
            disabled: true
        },
        {
            name: "Pro",
            price: "$19",
            description: "For creators & influencers",
            features: [
                "Unlimited Hi-Fi downloads",
                "YouTube Dispute Support",
                "Personal License Certificate",
                "Smart Whitelisting",
                "Semantic AI Search",
                "432Hz/528Hz Tuning"
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
                "Sonaraura Venue Player",
                "Biorhythm Energy Curve",
                "Smart Offline Caching",
                "Public Performance License",
                "Smart Scheduling",
                "Licensed Venue Certificate"
            ],
            buttonText: "Start for Business",
            highlight: true,
            badge: "Most Popular / Venue Ready"
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For agencies & corporations",
            features: [
                "Sonic Tailor (Custom AI Music)",
                "Full API Access",
                "Dedicated Account Manager",
                "Multi-seat & Role Mgmt",
                "Custom Licensing Terms",
                "24/7 Priority Support"
            ],
            buttonText: "Contact Sales",
            highlight: false,
            badge: "Enterprise"
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-black selection:text-white">
            {/* 1. Header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-black/90 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 cursor-pointer text-white">
                        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-lg leading-none">A</div>
                        <span className="text-xl font-bold tracking-tight">Sonaraura</span>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-gray-300">
                        <Link href="/music" className="hover:text-white transition-colors">Music</Link>
                        <Link href="/sound-effects" className="hover:text-white transition-colors">Sound Effects</Link>
                        <Link href="/pricing" className="text-white border-b border-white pb-1">Pricing</Link>
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                        <Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/login" className="hidden sm:block text-sm font-bold hover:text-gray-300 transition-colors text-white">Log in</Link>
                    <Link href="/signup" className="h-10 px-6 flex items-center justify-center rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors">Start free trial</Link>
                </div>
            </header>

            {/* 2. Hero Section */}
            <section className="relative min-h-[90vh] flex flex-col items-center pt-48 pb-32 px-6">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2600&auto=format&fit=crop)' }}
                    />
                </div>

                <div className="relative z-20 w-full max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto items-stretch">
                        {plans.map((plan) => (
                            <div 
                                key={plan.name}
                                className={`relative p-10 rounded-sm text-left flex flex-col h-full transition-all duration-500 hover:scale-[1.03] ${
                                    plan.highlight 
                                    ? 'bg-white text-black scale-105 z-10 shadow-[0_40px_100px_-15px_rgba(255,255,255,0.2)]' 
                                    : 'bg-black/60 backdrop-blur-2xl text-white border border-white/10 shadow-2xl'
                                }`}
                            >
                                {plan.badge && (
                                    <div className={`absolute -top-4 left-10 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                        plan.highlight ? 'bg-pink-500 text-white' : 'bg-white text-black'
                                    }`}>
                                        {plan.badge}
                                    </div>
                                )}
                                <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">{plan.name}</h3>
                                <p className={`text-sm mb-10 font-medium leading-relaxed min-h-[40px] ${plan.highlight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-1 mb-10 border-b pb-10 border-current opacity-10">
                                    <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                                    {plan.name !== 'Enterprise' && <span className="text-sm font-bold opacity-60">/mo</span>}
                                </div>
                                
                                <ul className="space-y-5 mb-14 flex-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-4 text-[15px] font-bold leading-snug">
                                            <Check className={plan.highlight ? 'text-pink-500' : 'text-white'} size={20} strokeWidth={4} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link 
                                    href={plan.disabled ? "#" : (plan.name === 'Enterprise' ? '/contact' : '/signup')} 
                                    className={`w-full py-5 text-center rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-all ${
                                        plan.disabled 
                                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50' 
                                        : (plan.highlight 
                                            ? 'bg-black text-white hover:bg-zinc-800 shadow-xl' 
                                            : 'bg-white text-black hover:bg-zinc-200')
                                    }`}
                                >
                                    {plan.buttonText}
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <button 
                            onClick={scrollToCompare}
                            className="inline-flex flex-col items-center gap-2 font-black text-[10px] uppercase tracking-[0.4em] text-zinc-400 hover:text-white transition-colors"
                        >
                            View more
                            <ChevronDown size={20} className="animate-bounce" />
                        </button>
                    </div>
                </div>
            </section>

            {/* 3. Comparison Section */}
            <section ref={compareRef} className="py-32 px-6 bg-[#F5F5F0] text-black">
                <div className="max-w-[1200px] mx-auto">
                    <div className="mb-20 text-center md:text-left">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight uppercase italic leading-[0.9]">
                            Compare <br/>the plans.
                        </h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-4 border-black">
                                    <th className="py-8 px-4 text-[11px] font-black uppercase tracking-widest text-zinc-400">Detailed Features</th>
                                    <th className="py-8 px-4 text-xl font-black uppercase italic">Free</th>
                                    <th className="py-8 px-4 text-xl font-black uppercase italic">Pro</th>
                                    <th className="py-8 px-4 text-xl font-black uppercase italic text-pink-600">Business</th>
                                    <th className="py-8 px-4 text-xl font-black uppercase italic">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-sm text-zinc-900">
                                {[
                                    { f: "Unlimited catalog access", v: [true, true, true, true] },
                                    { f: "Frequency Engineering (432Hz / 528Hz)", v: [false, true, true, true] },
                                    { f: "Commercial Use Rights", v: [false, false, true, true] },
                                    { f: "YouTube Dispute Support", v: [false, true, true, true] },
                                    { f: "Biorhythm Energy Curve", v: [false, false, true, true] },
                                    { f: "Smart Offline Caching (Venue Player)", v: [false, false, true, true] },
                                    { f: "Licensed Venue Certification", v: [false, false, true, true] },
                                    { f: "Sonic Tailor (Custom AI Request)", v: ["Add-on", "Add-on", "Add-on", true] },
                                    { f: "Multi-seat Management", v: [false, false, true, true] },
                                    { f: "Dedicated Account Manager", v: [false, false, false, true] },
                                    { f: "Full API Access", v: [false, false, false, true] },
                                ].map((row, idx) => (row.v && (
                                    <tr key={idx} className="border-b border-black/10 hover:bg-black/5 transition-colors">
                                        <td className="py-6 px-4 text-zinc-600 uppercase tracking-tighter text-[11px]">{row.f}</td>
                                        {row.v.map((val, i) => (
                                            <td key={i} className="py-6 px-4">
                                                {typeof val === 'boolean' ? (
                                                    val ? <Check size={20} className="text-black" /> : <X size={20} className="text-zinc-300" />
                                                ) : <span className="text-[9px] uppercase font-black tracking-widest opacity-60">{val}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
