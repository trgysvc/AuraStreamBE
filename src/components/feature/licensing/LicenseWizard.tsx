'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ShieldCheck, Music, CheckCircle } from 'lucide-react';
import { PricingCard } from './PricingCard';
import { usePlayer } from '@/context/PlayerContext';
import { claimLicense_Action } from '@/app/actions/license-claim';

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
    const { tier, role } = usePlayer();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedLicense, setSelectedLicense] = useState<LicenseType | null>(null);
    const [projectName, setProjectName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const isSubscribed = tier !== 'free' || role === 'admin';

    const handleAction = async () => {
        if (!selectedLicense || !projectName.trim()) return;
        setLoading(true);
        setError(null);

        try {
            if (isSubscribed) {
                // Subscription Path: Zero Cost
                await claimLicense_Action(track.id, projectName, selectedLicense === 'personal' ? 'social_media' : 'advertisement');
                setIsSuccess(true);
            } else {
                // Guest Path: Stripe Checkout
                const { createCheckoutSession } = await import('@/app/actions/checkout');
                const session = await createCheckoutSession({
                    trackId: track.id,
                    licenseType: selectedLicense,
                    projectName
                });
                if (session.url) window.location.href = session.url;
                else throw new Error('No checkout URL');
            }
        } catch (err: any) {
            console.error('License action error:', err);
            setError('Action failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full max-w-md bg-[#0F172A] border border-emerald-500/30 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">License Secured!</h2>
                    <p className="text-white/60 mb-8">Your license for &quot;{projectName}&quot; has been registered. You can download the certificate from your library.</p>
                    <button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-bold text-white transition-all">
                        Great, thanks!
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                
                {/* Left Panel */}
                <div className="w-full md:w-1/3 bg-white/5 p-8 border-r border-white/10 flex flex-col">
                    <h3 className="text-white/40 text-sm font-bold tracking-wider mb-6">SELECTED TRACK</h3>
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-black/40 mb-4 border border-white/10">
                        {track.cover_image_url ? (
                            <img src={track.cover_image_url} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20"><Music className="w-12 h-12" /></div>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{track.title}</h2>
                    <p className="text-white/60 text-sm mb-6">{track.artist}</p>
                    {isSubscribed && (
                        <div className="bg-indigo-500/20 border border-indigo-500/30 p-3 rounded-lg text-indigo-300 text-xs font-bold mb-4 text-center">
                            Sonaraura {tier.toUpperCase()} Member
                        </div>
                    )}
                </div>

                {/* Right Panel */}
                <div className="flex-1 p-8 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Select License</h2>
                            <p className="text-white/60 text-sm">Step {step} of 2</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                    </div>

                    {step === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PricingCard
                                title="Standard"
                                price={isSubscribed ? 0 : 19}
                                description="For personal creators"
                                features={['YouTube, Instagram, TikTok', 'Podcasts & Social Media', '1 Project Usage']}
                                selected={selectedLicense === 'personal'}
                                onSelect={() => setSelectedLicense('personal')}
                            />
                            <PricingCard
                                title="Commercial"
                                price={isSubscribed ? 0 : 49}
                                description="For businesses & ads"
                                features={['Client Work & Commercial Ads', 'Unlimited Views', 'Broadcast & TV']}
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
                                    <label className="text-sm text-white/60">Project Name (for Certificate)</label>
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="e.g. My Awesome Vlog"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>
                            <div className={`flex items-center justify-between p-4 rounded-lg border ${isSubscribed ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                                <div>
                                    <div className={`font-medium ${isSubscribed ? 'text-indigo-200' : 'text-orange-200'}`}>Total to Pay</div>
                                    <div className="text-sm opacity-60">{selectedLicense === 'personal' ? 'Standard License' : 'Commercial License'}</div>
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {isSubscribed ? '$0.00' : (selectedLicense === 'personal' ? '$19' : '$49')}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                        {step === 2 && <button onClick={() => setStep(1)} className="px-6 py-3 rounded-lg font-medium text-white hover:bg-white/10">Back</button>}
                        <button
                            onClick={() => {
                                if (step === 1 && selectedLicense) setStep(2);
                                else if (step === 2) handleAction();
                            }}
                            disabled={!selectedLicense || (step === 2 && !projectName) || loading}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all ${
                                !selectedLicense || (step === 2 && !projectName) || loading ? 'bg-white/10 cursor-not-allowed' : (isSubscribed ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-orange-500 hover:bg-orange-600')
                            }`}
                        >
                            {loading ? <span className="animate-pulse">Processing...</span> : (
                                <>
                                    {step === 1 ? 'Continue' : (isSubscribed ? 'Secure License' : 'Pay & Download')}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                    {error && <div className="mt-4 text-red-500 text-sm text-center">{error}</div>}
                </div>
            </div>
        </div>
    );
}
