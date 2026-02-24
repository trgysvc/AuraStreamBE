'use client';

import { useState } from 'react';
import { 
    Zap, 
    HardDrive, 
    Code2, 
    Info, 
    Save, 
    RefreshCw, 
    CloudLightning,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { triggerSystemAction_Action, updateGlobalConfig_Action } from '@/app/actions/admin-config';

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
    const [saving, setSaving] = useState(false);
    
    const [config, setConfig] = useState({
        infra: {
            aws_region: 'eu-central-1',
            meili_mode: 'Real-time Webhook',
            worker_concurrency: '4 Instances',
            s3_bucket: 'aurastream-v1-prod'
        },
        audio: {
            target_lufs: '-14.0',
            default_tuning: '440Hz (Standard)',
            freq_awareness: 'Weather-Based Enabled',
            aac_bitrate: '320 kbps'
        },
        venue: {
            max_cache: '500 MB',
            sync_interval: '6 Hours',
            purge_threshold: '90% Capacity',
            crossfade: '3.5 Seconds'
        },
        commerce: {
            base_price: '$199.00',
            rush_fee: '$49.00',
            stripe_mode: 'Live (Production)',
            rev_share: '40% Fixed'
        }
    });

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

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                updateGlobalConfig_Action('infra', config.infra),
                updateGlobalConfig_Action('audio', config.audio),
                updateGlobalConfig_Action('venue', config.venue),
                updateGlobalConfig_Action('commerce', config.commerce)
            ]);
            alert('All configurations updated successfully.');
        } catch (e) {
            console.error(e);
            alert('Save failed.');
        } finally {
            setSaving(false);
        }
    };

    const updateValue = (category: keyof typeof config, key: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Global Config</h1>
                    <p className="text-zinc-500 font-medium mt-1">Universal System Parameters and Infrastructure Tuning.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => handleAction('purge_cdn')}
                        disabled={!!loading}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        {loading === 'purge_cdn' ? <RefreshCw className="animate-spin" size={14} /> : <CloudLightning size={14} />} Purge CDN
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 disabled:bg-zinc-800"
                    >
                        {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />} 
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Infrastructure Settings */}
                <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <Zap size={160} />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
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

                    <div className="space-y-4 relative z-10">
                        <EditableConfigRow label="Active AWS Region" value={config.infra.aws_region} onChange={v => updateValue('infra', 'aws_region', v)} />
                        <EditableConfigRow label="Meilisearch Sync Mode" value={config.infra.meili_mode} onChange={v => updateValue('infra', 'meili_mode', v)} />
                        <EditableConfigRow label="Worker Concurrency" value={config.infra.worker_concurrency} onChange={v => updateValue('infra', 'worker_concurrency', v)} />
                        <EditableConfigRow label="S3 Bucket Naming" value={config.infra.s3_bucket} onChange={v => updateValue('infra', 's3_bucket', v)} />
                    </div>
                </div>

                {/* 2. Audio Processing Parameters */}
                <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <CloudLightning size={160} />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Audio DSP Engines</h3>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <EditableConfigRow label="Target Loudness (LUFS)" value={config.audio.target_lufs} onChange={v => updateValue('audio', 'target_lufs', v)} />
                        <EditableConfigRow label="Default Tuning" value={config.audio.default_tuning} onChange={v => updateValue('audio', 'default_tuning', v)} />
                        <EditableConfigRow label="Frequency Awareness" value={config.audio.freq_awareness} onChange={v => updateValue('audio', 'freq_awareness', v)} />
                        <EditableConfigRow label="AAC Bitrate" value={config.audio.aac_bitrate} onChange={v => updateValue('audio', 'aac_bitrate', v)} />
                    </div>
                </div>

                {/* 3. Venue & B2B Performance */}
                <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <HardDrive size={160} />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                                <HardDrive size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Venue Performance</h3>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <EditableConfigRow label="Max Cache per Device" value={config.venue.max_cache} onChange={v => updateValue('venue', 'max_cache', v)} />
                        <EditableConfigRow label="Offline Sync Interval" value={config.venue.sync_interval} onChange={v => updateValue('venue', 'sync_interval', v)} />
                        <EditableConfigRow label="Auto-Purge Threshold" value={config.venue.purge_threshold} onChange={v => updateValue('venue', 'purge_threshold', v)} />
                        <EditableConfigRow label="Crossfade Duration" value={config.venue.crossfade} onChange={v => updateValue('venue', 'crossfade', v)} />
                    </div>
                </div>

                {/* 4. Music on Request (Commerce) */}
                <div className="bg-[#1E1E22] rounded-[2.5rem] border border-white/5 p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <Code2 size={160} />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                                <Code2 size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Commerce & Pricing</h3>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <EditableConfigRow label="Custom Music Base Price" value={config.commerce.base_price} onChange={v => updateValue('commerce', 'base_price', v)} />
                        <EditableConfigRow label="Rush Delivery Add-on" value={config.commerce.rush_fee} onChange={v => updateValue('commerce', 'rush_fee', v)} />
                        <EditableConfigRow label="Stripe API Mode" value={config.commerce.stripe_mode} onChange={v => updateValue('commerce', 'stripe_mode', v)} />
                        <EditableConfigRow label="Creator Rev Share" value={config.commerce.rev_share} onChange={v => updateValue('commerce', 'rev_share', v)} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditableConfigRow({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-white/[0.03] group/row">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover/row:text-zinc-400 transition-colors">{label}</span>
            <div className="flex items-center gap-3">
                <input 
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="bg-black/20 border border-transparent hover:border-white/5 focus:border-indigo-500/50 rounded-lg px-4 py-2 text-sm font-bold text-white text-right focus:outline-none focus:text-indigo-400 transition-all min-w-[200px]"
                />
            </div>
        </div>
    );
}
