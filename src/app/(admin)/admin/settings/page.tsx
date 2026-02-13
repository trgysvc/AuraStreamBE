'use client';

import { useState } from 'react';
import { 
    Zap, 
    HardDrive, 
    Code2, 
    Info, 
    Save, 
    RefreshCw, 
    CloudLightning 
} from 'lucide-react';
import { triggerSystemAction_Action } from '@/app/actions/admin-config';

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

export default function GlobalConfigPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = async (action: 'purge_cdn' | 'sync_meili' | 'refresh_workers') => {
        setLoading(action);
        try {
            await triggerSystemAction_Action(action);
            alert(`System Action [${action}] Triggered Successfully`);
        } catch {
            alert('Action failed');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Global Config</h1>
                    <p className="text-zinc-500 font-medium mt-1">Universal System Parameters and Infrastructure Tuning.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleAction('purge_cdn')}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                        {loading === 'purge_cdn' ? <RefreshCw className="animate-spin" size={14} /> : <CloudLightning size={14} />} Purge CDN
                    </button>
                    <button className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                        <Save size={14} /> Save All Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Infrastructure Settings */}
                <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 p-10 space-y-8 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Core Infrastructure</h3>
                        </div>
                        <SimpleTooltip text="System-wide hardware and cloud distribution settings.">
                            <Info size={16} className="text-zinc-700 hover:text-white transition-colors" />
                        </SimpleTooltip>
                    </div>

                    <div className="space-y-6">
                        <EditableConfigRow label="Active AWS Region" value="eu-central-1" />
                        <EditableConfigRow label="Meilisearch Sync Mode" value="Real-time Webhook" />
                        <EditableConfigRow label="Worker Concurrency" value="4 Instances" />
                        <EditableConfigRow label="S3 Bucket Naming" value="aurastream-v1-prod" />
                    </div>
                </div>

                {/* 2. Audio Processing Parameters */}
                <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 p-10 space-y-8 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Audio DSP Engines</h3>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <EditableConfigRow label="Target Loudness (LUFS)" value="-14.0" />
                        <EditableConfigRow label="Default Tuning" value="440Hz (Standard)" />
                        <EditableConfigRow label="Frequency Awareness" value="Weather-Based Enabled" />
                        <EditableConfigRow label="AAC Bitrate" value="320 kbps" />
                    </div>
                </div>

                {/* 3. Venue & B2B Performance */}
                <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 p-10 space-y-8 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                                <HardDrive size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Venue Performance</h3>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <EditableConfigRow label="Max Cache per Device" value="500 MB" />
                        <EditableConfigRow label="Offline Sync Interval" value="6 Hours" />
                        <EditableConfigRow label="Auto-Purge Threshold" value="90% Capacity" />
                        <EditableConfigRow label="Crossfade Duration" value="3.5 Seconds" />
                    </div>
                </div>

                {/* 4. Music on Request (Commerce) */}
                <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 p-10 space-y-8 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                                <Code2 size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Commerce & Pricing</h3>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <EditableConfigRow label="Custom Music Base Price" value="$199.00" />
                        <EditableConfigRow label="Rush Delivery Add-on" value="$49.00" />
                        <EditableConfigRow label="Stripe API Mode" value="Live (Production)" />
                        <EditableConfigRow label="Creator Rev Share" value="40% Fixed" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditableConfigRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-white/[0.03] group">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
            <div className="flex items-center gap-3">
                <input 
                    defaultValue={value}
                    className="bg-transparent text-sm font-bold text-white text-right focus:outline-none focus:text-indigo-400 transition-colors cursor-pointer"
                />
            </div>
        </div>
    );
}
