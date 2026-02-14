'use client';

import { useState } from 'react';
import { 
    MessageSquare, 
    Loader2, 
    CheckCircle2, 
    Calendar,
    ArrowUpRight,
    UploadCloud,
    Music as MusicIcon,
    DollarSign,
    Save,
    FileText,
    ExternalLink
} from 'lucide-react';
import { updateRequestStatus_Action } from '@/app/actions/admin-requests';

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

export function RequestActionCard({ req }: { req: any }) {
    const [loading, setLoading] = useState(false);
    const [quotePrice, setQuotePrice] = useState(req.price_paid || '199.00');
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [adminNotes, setAdminNotes] = useState(req.admin_notes || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    const handleUpdateStatus = async (status: 'pending' | 'processing' | 'review' | 'completed' | 'rejected') => {
        setLoading(true);
        try {
            await updateRequestStatus_Action(req.id, status, parseFloat(quotePrice));
        } catch (e) {
            console.error(e);
            alert('Status update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        setIsSavingNotes(true);
        try {
            await updateRequestNotes_Action(req.id, adminNotes);
        } catch (e) {
            console.error(e);
            alert('Saving notes failed');
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleSavePrice = async () => {
        setLoading(true);
        try {
            await updateRequestStatus_Action(req.id, req.status, parseFloat(quotePrice));
            setIsEditingPrice(false);
        } catch (e) {
            console.error(e);
            alert('Price update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`bg-[#1E1E22] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch group hover:border-white/10 transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Left: Customer & Specs */}
            <div className="p-8 md:w-80 border-r border-white/5 bg-white/[0.01] space-y-8">
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Client Info</p>
                    <h4 className="text-white font-bold">{req.profiles?.full_name || 'VIP Client'}</h4>
                    <p className="text-[10px] text-zinc-600 lowercase">{req.profiles?.email}</p>
                </div>
                
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Aura Analytics</p>
                    <div className="grid grid-cols-2 gap-2">
                        <SpecBadge label="Genre" val={req.specs?.genre} />
                        <SpecBadge label="Mood" val={req.specs?.mood} />
                        <SpecBadge label="Len" val={req.specs?.duration} />
                        <SpecBadge label="Status" val={req.status} color={
                            req.status === 'pending' ? 'text-yellow-500' :
                            req.status === 'processing' ? 'text-blue-400' :
                            req.status === 'review' ? 'text-purple-400' :
                            'text-green-400'
                        } />
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-[9px] font-black text-zinc-700 uppercase tracking-widest pt-4 border-t border-white/5">
                    <Calendar size={12} /> Received {new Date(req.created_at).toLocaleDateString()}
                </div>
            </div>

            {/* Middle: Vision & Reference */}
            <div className="p-8 flex-1 space-y-8">
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Project Mission</p>
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium italic">
                        &quot;{req.prompt}&quot;
                    </p>
                </div>

                <div className="flex flex-wrap gap-4">
                    {req.reference_links?.[0] && (
                        <SimpleTooltip text="Open reference track">
                            <a 
                                href={req.reference_links[0]} 
                                target="_blank" 
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/20 transition-all"
                            >
                                External Reference <ArrowUpRight size={12} />
                            </a>
                        </SimpleTooltip>
                    )}

                    {req.specs?.project_soul_pdf && (
                        <SimpleTooltip text="Read Project Story / Soul">
                            <a 
                                href={req.specs.project_soul_pdf} 
                                target="_blank" 
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 transition-all"
                            >
                                Project Soul PDF <FileText size={12} />
                            </a>
                        </SimpleTooltip>
                    )}
                </div>

                {/* Taxonomy Summary */}
                {(req.specs?.themes?.length > 0 || req.specs?.characters?.length > 0 || req.specs?.vibes?.length > 0 || req.specs?.venue_tags?.length > 0) && (
                    <div className="space-y-3 pt-6 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Selected Taxonomy</p>
                        <div className="flex flex-wrap gap-2">
                            {req.specs?.themes?.map((t: string) => (
                                <span key={t} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-[8px] font-black uppercase border border-blue-500/20">{t}</span>
                            ))}
                            {req.specs?.characters?.map((t: string) => (
                                <span key={t} className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-md text-[8px] font-black uppercase border border-purple-500/20">{t}</span>
                            ))}
                            {req.specs?.vibes?.map((t: string) => (
                                <span key={t} className="px-2 py-1 bg-pink-500/10 text-pink-400 rounded-md text-[8px] font-black uppercase border border-pink-500/20">#{t}</span>
                            ))}
                            {req.specs?.venue_tags?.map((t: string) => (
                                <span key={t} className="px-2 py-1 bg-green-500/10 text-green-400 rounded-md text-[8px] font-black uppercase border border-green-500/20">{t}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Admin Notes Section */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Internal Operational Notes</p>
                    <div className="flex gap-2">
                        <textarea 
                            value={adminNotes}
                            onChange={e => setAdminNotes(e.target.value)}
                            placeholder="Add internal notes about production progress..."
                            className="flex-1 bg-black/20 border border-white/5 rounded-xl p-3 text-xs text-zinc-400 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                            rows={2}
                        />
                        <button 
                            onClick={handleSaveNotes}
                            disabled={isSavingNotes}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all flex items-center justify-center"
                        >
                            {isSavingNotes ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        </button>
                    </div>
                </div>

                {/* Production Area (Conditional) */}
                {(req.status === 'processing' || req.status === 'review') && (
                    <div className="pt-6 mt-6 border-t border-white/5 space-y-4 animate-in fade-in duration-500">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Production Control</p>
                        <div className="bg-black/20 p-6 rounded-2xl border border-dashed border-white/10 flex items-center justify-between group/upload cursor-pointer hover:border-indigo-500/50 transition-all">
                             <div className="flex items-center gap-4">
                                <UploadCloud className="text-zinc-600 group-hover/upload:text-indigo-400 transition-colors" size={24} />
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Deliver Produced Master</p>
                                    <p className="text-[9px] text-zinc-600 font-bold">WAV or FLAC format recommended</p>
                                </div>
                             </div>
                             <button className="px-4 py-2 bg-white/5 text-zinc-400 rounded-lg text-[9px] font-black uppercase group-hover/upload:bg-indigo-600 group-hover/upload:text-white transition-all">Select File</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Revenue & Orchestration */}
            <div className="p-8 md:w-72 flex flex-col justify-center gap-4 border-l border-white/5 bg-white/[0.01]">
                <div className="space-y-1 mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center md:text-left">Project Value</p>
                    {isEditingPrice ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-zinc-500">$</span>
                            <input 
                                autoFocus
                                value={quotePrice}
                                onChange={e => setQuotePrice(e.target.value)}
                                className="bg-black border border-indigo-500/30 rounded-lg px-2 py-1 text-xl font-black text-white w-24 outline-none"
                            />
                            <button onClick={handleSavePrice} className="p-1 text-green-500"><CheckCircle2 size={20} /></button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between md:justify-start gap-4 group/price">
                            <h3 
                                onClick={() => setIsEditingPrice(true)}
                                className="text-4xl font-black text-white italic tracking-tighter cursor-pointer hover:text-indigo-400 transition-colors"
                            >
                                ${quotePrice}
                            </h3>
                            <button onClick={() => setIsEditingPrice(true)} className="opacity-0 group-hover/price:opacity-100 p-1 text-zinc-600 hover:text-white transition-all"><EditIcon size={14} /></button>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    {req.status === 'pending' && (
                        <button 
                            onClick={() => handleUpdateStatus('processing')}
                            className="w-full py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                            Approve & Process
                        </button>
                    )}
                    
                    {req.status === 'processing' && (
                        <button 
                            onClick={() => handleUpdateStatus('review')}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : <DollarSign size={14} />}
                            Send Quote to Client
                        </button>
                    )}

                    {req.status === 'review' && (
                        <div className="space-y-2">
                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center mb-2">
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Waiting for Payment</p>
                            </div>
                            <button 
                                onClick={() => handleUpdateStatus('completed')}
                                className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-green-500 transition-all shadow-xl"
                            >
                                Force Complete
                            </button>
                        </div>
                    )}

                    {req.status !== 'completed' && req.status !== 'rejected' && (
                        <button 
                            onClick={() => handleUpdateStatus('rejected')}
                            className="w-full py-4 bg-white/5 text-zinc-500 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-white/5"
                        >
                            Reject Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function SpecBadge({ label, val, color = "text-zinc-400" }: { label: string, val: string, color?: string }) {
    return (
        <div className="bg-black/40 border border-white/5 p-2 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-[8px] font-black text-zinc-600 uppercase mb-0.5">{label}</span>
            <span className={`text-[9px] font-black uppercase truncate w-full ${color}`}>{val || 'N/A'}</span>
        </div>
    );
}

function EditIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
    );
}
