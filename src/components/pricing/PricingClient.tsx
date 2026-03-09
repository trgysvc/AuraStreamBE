'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Check, X, ChevronDown } from 'lucide-react';

export interface PlanFeature {
    name: string;
    price: string;
    description: string;
    features: string[];
    buttonText: string;
    highlight: boolean;
    disabled?: boolean;
    badge?: string;
}

export function PricingClient({
    plans,
    tPerMonth,
    tTechnicalBreakdown,
    tEnterpriseName,
    tBusinessName
}: {
    plans: PlanFeature[];
    tPerMonth: string;
    tTechnicalBreakdown: string;
    tEnterpriseName: string;
    tBusinessName: string;
}) {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className="relative z-20 w-full max-w-[1600px] mx-auto">
            {/* Toggle Switch */}
            <div className="flex justify-center items-center gap-4 mb-12 md:mb-16">
                <span className={`text-sm md:text-base font-bold uppercase tracking-widest transition-colors ${!isYearly ? 'text-white' : 'text-white/40'}`}>
                    Monthly
                </span>
                <button
                    onClick={() => setIsYearly(!isYearly)}
                    className="relative w-16 md:w-20 h-8 md:h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                >
                    <div
                        className={`absolute top-1/2 -translate-y-1/2 w-6 md:w-8 h-6 md:h-8 rounded-full bg-indigo-500 shadow-lg transition-all duration-300 ${isYearly ? 'left-[calc(100%-24px-4px)] md:left-[calc(100%-32px-4px)]' : 'left-1 md:left-1'}`}
                    />
                </button>
                <div className="flex items-center gap-2">
                    <span className={`text-sm md:text-base font-bold uppercase tracking-widest transition-colors ${isYearly ? 'text-white' : 'text-white/40'}`}>
                        Yearly
                    </span>
                    <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider border border-indigo-500/30">
                        Save 16%
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-[1400px] mx-auto items-stretch">
                {plans.map((plan) => {
                    // Update Business Plan pricing and link logic dynamically
                    const isBusiness = plan.name === tBusinessName;
                    const displayPrice = isBusiness
                        ? (isYearly ? "$25" : "$30")
                        : plan.price;

                    let href = plan.disabled ? "#" : "/signup";
                    if (isBusiness) {
                        href = isYearly ? "/checkout?plan=business_yearly" : "/checkout?plan=business_monthly";
                    } else if (plan.name === tEnterpriseName) {
                        href = "/enterprise#contact-section";
                    }

                    return (
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
                                <span className="text-3xl md:text-7xl font-black tracking-tighter transition-all">{displayPrice}</span>
                                {plan.name !== tEnterpriseName && <span className="text-[8px] md:text-sm font-black uppercase opacity-60 ml-1">{tPerMonth}</span>}
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
                                href={href}
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
                    );
                })}
            </div>

            <div className="mt-12 md:mt-20 text-center">
                <Link
                    href="#technical-breakdown"
                    className="inline-flex flex-col items-center gap-2 md:gap-3 font-black text-[8px] md:text-[9px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-zinc-500 hover:text-white transition-all group"
                >
                    {tTechnicalBreakdown}
                    <ChevronDown size={20} className="animate-bounce text-indigo-400 group-hover:text-white transition-colors" />
                </Link>
            </div>
        </div>
    );
}
