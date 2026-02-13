'use client';

import { useState } from 'react';
import { Mail, ExternalLink, Loader2, ChevronDown } from 'lucide-react';
import { updateUserTier_Action } from '@/app/actions/admin-users';

const SimpleTooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
    return (
        <div className="group/tooltip relative flex items-center justify-center">
            {children}
            <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:block whitespace-nowrap rounded bg-zinc-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-2xl border border-white/10 z-50">
                {text}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
            </div>
        </div>
    );
};

export function CreatorActionCard({ profile }: { profile: any }) {
    const [loading, setLoading] = useState(false);
    const [isTierMenuOpen, setIsTierMenuOpen] = useState(false);

    const handleUpdateTier = async (tier: any) => {
        setLoading(true);
        setIsTierMenuOpen(false);
        try {
            await updateUserTier_Action(profile.id, tier);
        } catch (e) {
            console.error(e);
            alert('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const tiers = ['free', 'pro', 'business', 'enterprise'];

    return (
        <div className="bg-[#18181b] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col gap-4 relative">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center font-bold text-xs uppercase text-white">
                    {profile.full_name?.charAt(0) || profile.email?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{profile.full_name || 'Anonymous'}</p>
                    
                    <div className="relative inline-block">
                        <button 
                            onClick={() => setIsTierMenuOpen(!isTierMenuOpen)}
                            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-pink-500 hover:text-pink-400 transition-colors"
                        >
                            {profile.subscription_tier} <ChevronDown size={10} />
                        </button>

                        {isTierMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-32 bg-[#1E1E22] border border-white/10 rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
                                {tiers.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => handleUpdateTier(t)}
                                        className={`w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors ${profile.subscription_tier === t ? 'text-pink-500' : 'text-zinc-400'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-zinc-600">
                    <Mail size={12} />
                    <span className="text-[9px] font-bold truncate lowercase max-w-[100px]">{profile.email}</span>
                </div>
                <SimpleTooltip text="View Detailed Intelligence">
                    <button className="text-zinc-500 hover:text-white transition-colors">
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                    </button>
                </SimpleTooltip>
            </div>
        </div>
    );
}
