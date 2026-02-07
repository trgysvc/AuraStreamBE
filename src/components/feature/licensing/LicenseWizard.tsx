'use client';

import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Music } from 'lucide-react';
import { PricingCard } from './PricingCard';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface LicenseWizardProps {
    track: {
        id: string;
        title: string;
        artist: string;
        cover_image_url?: string;
    };
    onClose: () => void;
}

type LicenseType = 'personal' | 'commercial';

export function LicenseWizard({ track, onClose }: LicenseWizardProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedLicense, setSelectedLicense] = useState<LicenseType | null>(null);
    const [projectName, setProjectName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        if (!selectedLicense || !projectName.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // import dynamically to avoid server-side issues if needed, though this is client comp
            // We will call the server action here
            // const { createCheckoutSession } = await import('@/app/actions/checkout'); 

            // Call server action
            const { createCheckoutSession } = await import('@/app/actions/checkout');

            const session = await createCheckoutSession({
                trackId: track.id,
                licenseType: selectedLicense,
                projectName
            });

            if (session.url) {
                window.location.href = session.url;
            } else {
                throw new Error('No checkout URL returned');
            }

        } catch (err: any) {
            console.error('Checkout error:', err);
            setError('Failed to initiate checkout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* Left Panel: Track Info */}
                <div className="w-full md:w-1/3 bg-white/5 p-8 border-r border-white/10 flex flex-col">
                    <h3 className="text-white/40 text-sm font-bold tracking-wider mb-6">SELECTED TRACK</h3>

                    <div className="relative aspect-square rounded-lg overflow-hidden bg-black/40 mb-4 border border-white/10 group">
                        {track.cover_image_url ? (
                            <img src={track.cover_image_url} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                <Music className="w-12 h-12" />
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1">{track.title}</h2>
                    <p className="text-white/60 text-sm mb-6">{track.artist}</p>

                    <div className="mt-auto pt-6 border-t border-white/10">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                            <ShieldCheck className="w-4 h-4" />
                            <span>100% Copyright Safe</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Content */}
                <div className="flex-1 p-8 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Select License</h2>
                            <p className="text-white/60 text-sm">Step {step} of 2</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {step === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PricingCard
                                title="Standard"
                                price={19}
                                description="For personal creators"
                                features={[
                                    'YouTube, Instagram, TikTok',
                                    'Podcasts & Social Media',
                                    '1 Project Usage',
                                    'Worldwide License'
                                ]}
                                selected={selectedLicense === 'personal'}
                                onSelect={() => setSelectedLicense('personal')}
                            />
                            <PricingCard
                                title="Commercial"
                                price={49}
                                description="For businesses & ads"
                                features={[
                                    'Client Work & Commercial Ads',
                                    'Unlimited Views',
                                    'Broadcast & TV',
                                    'Unlimited Projects'
                                ]}
                                recommended
                                selected={selectedLicense === 'commercial'}
                                onSelect={() => setSelectedLicense('commercial')}
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                <h3 className="text-lg font-medium text-white mb-4">Project Details</h3>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">Project Name (for Invoice)</label>
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="e.g. Summer Vlog 2024"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                    />
                                    <p className="text-xs text-white/40">This will appear on your license certificate.</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <div>
                                    <div className="text-orange-200 font-medium">Total to Pay</div>
                                    <div className="text-sm text-orange-200/60">{selectedLicense === 'personal' ? 'Standard License' : 'Commercial License'}</div>
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    ${selectedLicense === 'personal' ? '19' : '49'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                        {step === 2 && (
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-3 rounded-lg font-medium text-white hover:bg-white/10 transition-colors"
                            >
                                Back
                            </button>
                        )}

                        <button
                            onClick={() => {
                                if (step === 1 && selectedLicense) setStep(2);
                                else if (step === 2) handleCheckout();
                            }}
                            disabled={!selectedLicense || (step === 2 && !projectName) || loading}
                            className={`
                                flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all
                                ${!selectedLicense || (step === 2 && !projectName) || loading
                                    ? 'bg-white/10 cursor-not-allowed text-white/40'
                                    : 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                                }
                            `}
                        >
                            {loading ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : (
                                <>
                                    {step === 1 ? 'Continue' : 'Pay & Download'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
