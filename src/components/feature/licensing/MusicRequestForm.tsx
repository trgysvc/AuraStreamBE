'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, ArrowRight, Music, Link2, Clock, Check, Loader2, Upload, FileText, X } from 'lucide-react';
import { createClient } from '@/lib/db/client';
import { THEMES, CHARACTERS, VIBES, VENUE_TAGS, ALL_GENRES } from '@/constants/taxonomy';

export function MusicRequestForm() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        project_name: '',
        genre: 'Cinematic',
        mood: 'Energetic',
        duration: '2:30',
        reference_link: '',
        prompt: '',
        themes: [] as string[],
        characters: [] as string[],
        vibes: [] as string[],
        venue_tags: [] as string[],
    });

    const [pdfFile, setPdfFile] = useState<File | null>(null);

    const toggleTag = (category: keyof typeof formData, tag: string) => {
        setFormData(prev => {
            const current = prev[category] as string[];
            const updated = current.includes(tag)
                ? current.filter(t => t !== tag)
                : [...current, tag];
            return { ...prev, [category]: updated };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        } else if (file) {
            alert('Please upload a PDF file.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            let pdfUrl = null;
            if (pdfFile && user) {
                const fileExt = pdfFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('requests')
                    .upload(`souls/${fileName}`, pdfFile);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    // Continue without PDF if upload fails, or handle error
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('requests')
                        .getPublicUrl(`souls/${fileName}`);
                    pdfUrl = publicUrl;
                }
            }

            const { error } = await (supabase
                .from('custom_requests')
                .insert({
                    user_id: user?.id,
                    prompt: formData.prompt,
                    reference_links: formData.reference_link ? [formData.reference_link] : [],
                    specs: {
                        project_name: formData.project_name,
                        genre: formData.genre,
                        mood: formData.mood,
                        duration: formData.duration,
                        themes: formData.themes,
                        characters: formData.characters,
                        vibes: formData.vibes,
                        venue_tags: formData.venue_tags,
                        project_soul_pdf: pdfUrl
                    }
                } as any));

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

    const TagSection = ({ title, tags, selected, category }: { title: string, tags: string[], selected: string[], category: keyof typeof formData }) => (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">{title}</label>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(category, tag)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all border ${selected.includes(tag)
                                ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                                : 'bg-black border-white/5 text-zinc-500 hover:border-white/20'
                            }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-12 bg-[#1E1E22] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Sparkles size={200} strokeWidth={1} />
                </div>

                {/* 1. Project Info & Core Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Project Name</label>
                            <input
                                required
                                value={formData.project_name}
                                onChange={e => setFormData({ ...formData, project_name: e.target.value })}
                                placeholder="e.g. Brand Launch 2026"
                                className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Genre</label>
                                <select
                                    value={formData.genre}
                                    onChange={e => setFormData({ ...formData, genre: e.target.value })}
                                    className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 appearance-none"
                                >
                                    {ALL_GENRES.slice(0, 50).map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Expected Length</label>
                                <div className="relative">
                                    <Clock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" />
                                    <input
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full bg-black border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500"
                                        placeholder="2:30"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Reference Link</label>
                            <div className="relative">
                                <Link2 size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    value={formData.reference_link}
                                    onChange={e => setFormData({ ...formData, reference_link: e.target.value })}
                                    placeholder="https://"
                                    className="w-full bg-black border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Detailed Prompt / Instructions</label>
                            <textarea
                                required
                                value={formData.prompt}
                                onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                                rows={3}
                                placeholder="Explain the instruments, tempo changes, and overall energy curve..."
                                className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-indigo-500 transition-all resize-none"
                            />
                        </div>

                        {/* PDF Upload Section */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Project Soul / Story (PDF)</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`group relative w-full border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${pdfFile
                                        ? 'border-indigo-500 bg-indigo-500/5'
                                        : 'border-white/10 bg-black hover:border-white/20'
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                    className="hidden"
                                />
                                {pdfFile ? (
                                    <>
                                        <div className="flex items-center gap-3 text-white">
                                            <FileText size={20} className="text-indigo-400" />
                                            <span className="text-sm font-bold truncate max-w-[200px]">{pdfFile.name}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPdfFile(null);
                                                }}
                                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-zinc-400">Upload Project Story</p>
                                            <p className="text-[10px] text-zinc-600">PDF max 10MB</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Sonic Taxonomy */}
                <div className="pt-8 border-t border-white/5 space-y-8">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Sonic Taxonomy</h3>
                        <p className="text-xs text-zinc-500 font-medium">Fine-tune the sonic identity of your project by selecting relevant tags.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <TagSection title="Themes" tags={THEMES} selected={formData.themes} category="themes" />
                        <TagSection title="Characters" tags={CHARACTERS} selected={formData.characters} category="characters" />
                        <TagSection title="Vibes" tags={VIBES} selected={formData.vibes} category="vibes" />
                        <TagSection title="Venue Context" tags={VENUE_TAGS} selected={formData.venue_tags} category="venue_tags" />
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
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Billed per project.</p>
            </div>
        </form>
    );
}
