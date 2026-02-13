'use client';

import { useState } from 'react';
import { Video, Link2, ArrowUpRight, Loader2, ShieldCheck } from 'lucide-react';
import { resolveDispute_Action, rejectDispute_Action } from '@/app/actions/dispute';
import { DisputeAsset } from '@/types/admin';

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

export function DisputeActionCard({ dispute }: { dispute: DisputeAsset }) {
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState<'resolve' | 'reject' | null>(null);

    const handleResolve = async () => {
        setLoading(true);
        setActionType('resolve');
        try {
            await resolveDispute_Action(dispute.id);
        } catch (e) {
            console.error(e);
            alert('Resolution failed');
        } finally {
            setLoading(false);
            setActionType(null);
        }
    };

    const handleReject = async () => {
        if (!confirm('Are you sure you want to reject this dispute?')) return;
        setLoading(true);
        setActionType('reject');
        try {
            await rejectDispute_Action(dispute.id);
        } catch (e) {
            console.error(e);
            alert('Rejection failed');
        } finally {
            setLoading(false);
            setActionType(null);
        }
    };

    return (
        <div className={`bg-[#1E1E22] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch group transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Left Info: User & Track */}
            <div className="p-8 md:w-80 border-r border-white/5 bg-white/[0.01] space-y-6">
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Creator</p>
                    <h4 className="text-white font-bold truncate">{dispute.profiles?.full_name || dispute.profiles?.email}</h4>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Licensed Track</p>
                    <h4 className="text-white font-bold">{dispute.licenses?.tracks?.title || 'Unknown Track'}</h4>
                </div>
                <div className="pt-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                        dispute.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 
                        dispute.status === 'resolved' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    }`}>
                        Status: {dispute.status}
                    </div>
                </div>
            </div>

            {/* Middle: Evidence & Links */}
            <div className="p-8 flex-1 space-y-6">
                <div className="flex items-center gap-4">
                    <SimpleTooltip text="Open original YouTube video link">
                        <a 
                            href={dispute.video_url} 
                            target="_blank" 
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-300 transition-all border border-white/5"
                        >
                            <Video size={14} /> View Flagged Video <ArrowUpRight size={12} />
                        </a>
                    </SimpleTooltip>
                    <SimpleTooltip text="Unique commercial license identifier">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-xs font-bold text-zinc-500 border border-white/5">
                            <Link2 size={14} /> Key: {dispute.licenses?.license_key}
                        </div>
                    </SimpleTooltip>
                </div>

                <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Generated Support Text</p>
                    <p className="text-xs text-zinc-400 leading-relaxed italic">
                        &quot;{dispute.dispute_text}&quot;
                    </p>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="p-8 flex flex-col justify-center gap-3 border-l border-white/5 bg-white/[0.01]">
                {dispute.status === 'pending' && (
                    <>
                        <SimpleTooltip text="Close claim and confirm license">
                            <button 
                                onClick={handleResolve}
                                className="w-full px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                {loading && actionType === 'resolve' ? <Loader2 size={14} className="animate-spin" /> : 'Resolve Dispute'}
                            </button>
                        </SimpleTooltip>
                        <SimpleTooltip text="Decline dispute and maintain claim">
                            <button 
                                onClick={handleReject}
                                className="w-full px-8 py-3 bg-rose-500/10 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 flex items-center justify-center gap-2"
                            >
                                {loading && actionType === 'reject' ? <Loader2 size={14} className="animate-spin" /> : 'Reject'}
                            </button>
                        </SimpleTooltip>
                    </>
                )}
                {dispute.status === 'resolved' && (
                    <div className="text-center space-y-2">
                        <ShieldCheck size={32} className="text-green-500 mx-auto opacity-50" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Successfully Resolved</p>
                    </div>
                )}
            </div>
        </div>
    );
}
