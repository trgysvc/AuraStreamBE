'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Music, Link2, Clock, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/db/client';

export function MusicRequestForm() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const [formData, setFormData] = useState({
        project_name: '',
        genre: 'Cinematic',
        mood: 'Energetic',
        duration: '2:30',
        reference_link: '',
        prompt: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('custom_requests')
                .insert({
                    user_id: user?.id,
                    prompt: formData.prompt,
                    reference_links: [formData.reference_link],
                    specs: {
                        project_name: formData.project_name,
                        genre: formData.genre,
                        mood: formData.mood,
                        duration: formData.duration
                    }
                });

            if (error) throw error;
            setSubmitted(true);
        } catch (e) {
            console.error(e);
            alert('Request submission failed.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-[#1E1E22] p-12 rounded-[3rem] border border-white/5 text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="h-20 w-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                    <Check size={40} className="text-indigo-400" strokeWidth={3} />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Order Received</h2>
                <p className="text-zinc-500 max-w-sm mx-auto font-medium">Our AI Architects and QC team are reviewing your request. You will receive a quote and payment link shortly.</p>
                <button 
                    onClick={() => setSubmitted(false)}
                    className="px-10 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all"
                >
                    Submit Another
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-8 bg-[#1E1E22] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Sparkles size={200} strokeWidth={1} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 1. Project Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Project Name</label>
                            <input 
                                required
                                value={formData.project_name}
                                onChange={e => setFormData({...formData, project_name: e.target.value})}
                                placeholder="e.g. Brand Launch 2026"
                                className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Genre</label>
                                <select 
                                    value={formData.genre}
                                    onChange={e => setFormData({...formData, genre: e.target.value})}
                                    className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 appearance-none"
                                >
                                    {['Cinematic', 'Lounge', 'Techno', 'Jazz', 'Ambient', 'Hip Hop'].map(g => <option key={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Expected Length</label>
                                <div className="relative">
                                    <Clock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" />
                                    <input 
                                        value={formData.duration}
                                        onChange={e => setFormData({...formData, duration: e.target.value})}
                                        className="w-full bg-black border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500"
                                        placeholder="2:30"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Style & Reference */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Reference Link (Spotify/YT)</label>
                            <div className="relative">
                                <Link2 size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input 
                                    value={formData.reference_link}
                                    onChange={e => setFormData({...formData, reference_link: e.target.value})}
                                    placeholder="https://open.spotify.com/..."
                                    className="w-full bg-black border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Detailed Prompt / Instructions</label>
                            <textarea 
                                required
                                value={formData.prompt}
                                onChange={e => setFormData({...formData, prompt: e.target.value})}
                                rows={3}
                                placeholder="Explain the instruments, tempo changes, and overall energy curve..."
                                className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center gap-6">
                <button 
                    disabled={loading}
                    className="px-16 py-6 bg-white text-black rounded-full font-black text-sm uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center gap-4 group"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
                    Place Custom Order
                </button>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Base price starts from $199.00 — Billed per project.</p>
            </div>
        </form>
    );
}
