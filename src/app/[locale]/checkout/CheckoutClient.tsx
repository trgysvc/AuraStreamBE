'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface CheckoutClientProps {
    initialPlan: string;
    isCorporateValid: boolean;
    missingFields: string[];
}

export function CheckoutClient({ initialPlan, isCorporateValid, missingFields }: CheckoutClientProps) {
    const [billingCountry, setBillingCountry] = useState('TR');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [iyzicoFormContent, setIyzicoFormContent] = useState<string | null>(null);

    // Effect to render iyzico script when it arrives
    useEffect(() => {
        if (iyzicoFormContent) {
            const container = document.getElementById('iyzipay-checkout-form');
            if (container) {
                container.innerHTML = '';
                const fragment = document.createRange().createContextualFragment(iyzicoFormContent);
                container.appendChild(fragment);
            }
        }
    }, [iyzicoFormContent]);

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);
        setIyzicoFormContent(null);

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: initialPlan,
                    billingCountry
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Checkout failed');
            }

            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else if (data.clientSecret) {
                setIyzicoFormContent(data.clientSecret);
            } else {
                setError("Unexpected response from payment gateway.");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">
                Complete Your Subscription
            </h1>

            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 mb-8">
                <h2 className="text-xl font-bold mb-4">
                    Plan Selected: <span className="text-indigo-400">
                        {initialPlan.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                </h2>

                {!isCorporateValid ? (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-500/20 rounded-full text-orange-400">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-orange-400 font-bold text-lg mb-2 uppercase tracking-wide">
                                    Corporate Details Required
                                </h3>
                                <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
                                    AuraStream requires a complete Corporate profile to process B2B subscriptions.
                                    Please update your account settings to include the following missing information:
                                </p>
                                <ul className="list-disc list-inside text-sm text-zinc-400 font-medium mb-6 space-y-1">
                                    {missingFields.map((field, idx) => (
                                        <li key={idx}>{field}</li>
                                    ))}
                                </ul>
                                <Link
                                    href="/account"
                                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                                >
                                    Complete Billing Profile <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 space-y-2 mt-6 border-t border-white/5 pt-6">
                            <label className="block text-sm font-bold uppercase tracking-widest text-white/60">
                                Billing Country
                            </label>
                            <select
                                value={billingCountry}
                                onChange={(e) => setBillingCountry(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="TR">Turkey (TRY Billing via Iyzico)</option>
                                <option value="US">United States (USD Billing via Stripe)</option>
                                <option value="GB">United Kingdom (USD Billing via Stripe)</option>
                                <option value="DE">Germany (USD Billing via Stripe)</option>
                            </select>
                            <p className="text-xs text-white/40">
                                Change country to test dynamic routing between Stripe and iyzico.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        {!iyzicoFormContent && (
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-white text-black font-black uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50 mt-4"
                            >
                                {loading ? 'Initializing...' : 'Proceed to Payment'}
                            </button>
                        )}

                        {/* Iyzico Form Container */}
                        <div id="iyzipay-checkout-form" className="mt-8 responsive" />
                    </>
                )}
            </div>
        </>
    );
}
