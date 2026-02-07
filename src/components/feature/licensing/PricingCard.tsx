import React from 'react';
import { Check } from 'lucide-react';

interface PricingCardProps {
    title: string;
    price: number | string;
    features: string[];
    description?: string;
    recommended?: boolean;
    onSelect: () => void;
    selected?: boolean;
}

export function PricingCard({
    title,
    price,
    features,
    description,
    recommended,
    onSelect,
    selected
}: PricingCardProps) {
    return (
        <div
            onClick={onSelect}
            className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                ${selected
                    ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }
                ${recommended ? 'scale-105 z-10' : ''}
            `}
        >
            {recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-bold text-white shadow-lg">
                    MOST POPULAR
                </div>
            )}

            <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-white">
                        {typeof price === 'number' ? `$${price}` : price}
                    </span>
                    {typeof price === 'number' && <span className="text-white/40 mb-1">/track</span>}
                </div>
                {description && <p className="text-sm text-white/60 mt-2">{description}</p>}
            </div>

            <ul className="space-y-3 mb-6">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                className={`
                    w-full py-2.5 rounded-lg font-medium transition-colors
                    ${selected
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }
                `}
            >
                {selected ? 'Selected' : 'Select Plan'}
            </button>
        </div>
    );
}
