'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, MoreHorizontal, Building2 } from 'lucide-react';

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

export function TenantActionRow({ tenant }: { tenant: any }) {
    return (
        <tr className="hover:bg-white/[0.02] transition-colors group">
            <td className="p-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 overflow-hidden">
                        {tenant.logo_url ? (
                            <img src={tenant.logo_url} alt={tenant.display_name} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 size={20} />
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-white uppercase italic">{tenant.display_name || tenant.legal_name || 'Unnamed Institution'}</p>
                        <p className="text-[10px] text-zinc-500 font-medium lowercase">{tenant.industry || 'Unknown Sector'}</p>
                    </div>
                </div>
            </td>
            <td className="p-6">
                <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-tight">{tenant.current_plan || 'Free'}</p>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${tenant.plan_status === 'active'
                            ? 'bg-green-500/10 border-green-500/20 text-green-500'
                            : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
                        }`}>
                        {tenant.plan_status}
                    </div>
                </div>
            </td>
            <td className="p-6 text-xs font-medium text-zinc-400">
                {tenant.website ? (
                    <a href={tenant.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline decoration-white/10 underline-offset-4">
                        {tenant.website.replace(/^https?:\/\//, '')}
                    </a>
                ) : (
                    'N/A'
                )}
            </td>
            <td className="p-6 text-right">
                <div className="flex items-center gap-2 justify-end">
                    <SimpleTooltip text="Management Options">
                        <button className="p-2 text-zinc-600 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg">
                            <MoreHorizontal size={18} />
                        </button>
                    </SimpleTooltip>
                </div>
            </td>
        </tr>
    );
}
