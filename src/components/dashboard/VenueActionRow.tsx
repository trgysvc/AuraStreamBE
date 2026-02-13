'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, MoreHorizontal } from 'lucide-react';
import { verifyVenue_Action } from '@/app/actions/admin-users';

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

export function VenueActionRow({ venue }: { venue: any }) {
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        setLoading(true);
        try {
            await verifyVenue_Action(venue.id);
        } catch (e) {
            console.error(e);
            alert('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <tr className="hover:bg-white/[0.02] transition-colors group">
            <td className="p-6">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-white uppercase italic">{venue.business_name}</p>
                    <p className="text-[10px] text-zinc-500 font-medium lowercase">{(venue.profiles as any)?.email}</p>
                </div>
            </td>
            <td className="p-6 text-xs font-medium text-zinc-400">
                {venue.city || 'N/A'}, {venue.country || 'N/A'}
            </td>
            <td className="p-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                    venue.verification_status === 'verified' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                }`}>
                    {venue.verification_status}
                </div>
            </td>
            <td className="p-6">
                <div className="flex items-center gap-2">
                    {venue.verification_status !== 'verified' && (
                        <SimpleTooltip text="Verify Commercial Documents">
                            <button 
                                onClick={handleVerify}
                                disabled={loading}
                                className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-all"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            </button>
                        </SimpleTooltip>
                    )}
                    <SimpleTooltip text="Management Options">
                        <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                            <MoreHorizontal size={18} />
                        </button>
                    </SimpleTooltip>
                </div>
            </td>
        </tr>
    );
}
