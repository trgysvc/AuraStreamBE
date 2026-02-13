'use client';

import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { generateLicensePDF_Action } from '@/app/actions/license';
import { updateYoutubeChannel_Action } from '@/app/actions/elite-analytics';
import { Youtube, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/db/client';

export function CreatorLibrary() {
    const { tier } = usePlayer();
    const [licenses, setLicenses] = useState<any[]>([]);
    const [youtubeChannelId, setYoutubeChannelId] = useState('');
    const [isUpdatingChannel, setIsUpdatingChannel] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('youtube_channel_id').eq('id', user.id).single();
                if (profile?.youtube_channel_id) setYoutubeChannelId(profile.youtube_channel_id);
                
                // Load licenses
                const { data: licenseData } = await supabase
                    .from('licenses')
                    .select('*, tracks(title, artist)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (licenseData) setLicenses(licenseData);
            }
            setLoading(false);
        };
        loadProfile();
    }, []);

    const handleUpdateChannel = async () => {
        setIsUpdatingChannel(true);
        try {
            await updateYoutubeChannel_Action(youtubeChannelId);
            alert('YouTube Channel ID updated for whitelisting.');
        } catch (e) {
            alert('Failed to update channel ID.');
        } finally {
            setIsUpdatingChannel(false);
        }
    };

    const handleDownloadPDF = async (licenseId: string) => {
        try {
            const base64 = await generateLicensePDF_Action(licenseId);
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${base64}`;
            link.download = `Sonaraura-License-${licenseId.slice(0, 8)}.pdf`;
            link.click();
        } catch (error) {
            console.error('Failed to download PDF:', error);
        }
    };

    if (loading) return <div className="animate-pulse text-slate-500">Loading Elite Library...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-6">
            {/* YouTube Whitelisting Section */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Youtube size={120} />
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                        <ShieldCheck className="text-emerald-400" />
                        YouTube Content ID Protection
                    </h2>
                    <p className="text-slate-400 max-w-xl mb-6">
                        Enter your YouTube Channel ID below. We will automatically whitelist your channel to prevent copyright claims on your videos using Sonaraura music.
                    </p>
                    <div className="flex gap-4 max-w-md">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={youtubeChannelId}
                                onChange={(e) => setYoutubeChannelId(e.target.value)}
                                placeholder="UCxxxxxxxxxxxxxx"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all font-mono"
                            />
                        </div>
                        <button 
                            onClick={handleUpdateChannel}
                            disabled={isUpdatingChannel}
                            className="bg-white text-black hover:bg-orange-500 hover:text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            {isUpdatingChannel ? 'Syncing...' : 'Whitelist Channel'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Licensed Content List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Download className="text-orange-500" />
                    My Licensed Content
                </h3>
                {licenses.length === 0 ? (
                    <div className="bg-slate-900/50 border border-dashed border-white/10 rounded-2xl p-12 text-center">
                        <p className="text-slate-500">No active licenses found. Visit the Store to secure your first track.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {licenses.map((license) => (
                            <div key={license.id} className="bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center justify-between transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 font-bold">
                                        {license.usage_type[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{(license.tracks as any).title}</h4>
                                        <p className="text-xs text-slate-500">Project: <span className="text-slate-300">{license.project_name}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-slate-600 bg-white/5 px-2 py-1 rounded">
                                        {license.license_key}
                                    </span>
                                    <button 
                                        onClick={() => handleDownloadPDF(license.id)}
                                        className="p-2 hover:bg-orange-500/20 rounded-lg text-slate-400 hover:text-orange-500 transition-all"
                                        title="Download PDF Certificate"
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
