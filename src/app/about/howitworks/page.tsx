'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Search, 
    Book, 
    Zap, 
    Music, 
    Shield, 
    Layers, 
    Cpu, 
    ChevronRight, 
    Clock, 
    Building2, 
    Sparkles,
    CheckCircle2,
    Info,
    Layout,
    CloudLightning,
    DollarSign,
    FileText
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

// --- Documentation Content Structure ---
const HELP_SECTIONS = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: Sparkles,
        pages: [
            { id: 'vision', title: 'The Sonaraura Vision', icon: Zap },
            { id: 'how-it-works', title: 'How It Works', icon: Info },
            { id: 'account-setup', title: 'Account Initialization', icon: CheckCircle2 },
        ]
    },
    {
        id: 'technology',
        title: 'Technology Stack',
        icon: Cpu,
        pages: [
            { id: 'core-stack', title: 'Modern Architecture', icon: Layers },
            { id: 'ai-engine', title: 'Aura AI Intelligence', icon: Zap },
        ]
    },
    {
        id: 'premium-features',
        title: 'Unique Features (USPs)',
        icon: Zap,
        pages: [
            { id: 'frequency-eng', title: 'Molecular Sound (Hz)', icon: Zap },
            { id: 'karaoke-engine', title: 'Karaoke & Word Sync', icon: Music },
            { id: 'weather-ai', title: 'Atmospheric AI', icon: CloudLightning },
            { id: 'watermarking', title: 'Signal Protection', icon: Shield },
        ]
    },
    {
        id: 'venue-guide',
        title: 'For Venues & Businesses',
        icon: Building2,
        pages: [
            { id: 'smart-flow', title: 'Mastering Smart Flow', icon: Zap },
            { id: 'scheduling', title: 'Dynamic Scheduling', icon: Clock },
            { id: 'b2b-licensing', title: 'Commercial Licensing', icon: Shield },
        ]
    },
    {
        id: 'creator-guide',
        title: 'Partners & Production',
        icon: Music,
        pages: [
            { id: 'upload-qc', title: 'The Production Factory', icon: Layout },
            { id: 'revenue-share', title: 'Strategic Partnerships', icon: DollarSign },
        ]
    },
    {
        id: 'custom-requests',
        title: 'Music on Request',
        icon: Zap,
        pages: [
            { id: 'tailor-process', title: 'The Tailor Workflow', icon: Layout },
            { id: 'project-soul', title: 'Project Soul Concept', icon: FileText },
        ]
    }
];

export default function HelpCenterPage() {
    const [activePage, setActivePage] = useState('vision');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
            <DashboardHeader />

            <main className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-80 border-r border-white/5 bg-[#0A0A0A] overflow-y-auto p-8 space-y-10 sticky top-16 h-[calc(100vh-64px)] hidden md:block custom-scrollbar">
                    <div className="space-y-2">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                            <input 
                                type="text"
                                placeholder="Search help..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <nav className="space-y-8">
                        {HELP_SECTIONS.map(section => (
                            <div key={section.id} className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-4 flex items-center gap-2">
                                    <section.icon size={12} /> {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.pages.map(page => (
                                        <button
                                            key={page.id}
                                            onClick={() => setActivePage(page.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all ${
                                                activePage === page.id 
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <page.icon size={16} className={activePage === page.id ? 'text-white' : 'text-zinc-600 group-hover:text-indigo-400'} />
                                                <span className="text-sm font-bold tracking-tight">{page.title}</span>
                                            </div>
                                            <ChevronRight size={14} className={`transition-transform ${activePage === page.id ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <div className="flex-1 p-8 md:p-16 overflow-y-auto max-w-4xl custom-scrollbar min-h-screen">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {renderContent(activePage)}
                    </div>
                </div>
            </main>

            <Footer variant="dark" />
        </div>
    );
}

function renderContent(id: string) {
    switch (id) {
        case 'frequency-eng':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500">
                            <Zap size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Molecular <br/> Sound</h1>
                        <p className="text-xl text-zinc-500 font-medium">Frequency engineering that bypasses traditional streaming limits.</p>
                    </header>

                    <div className="prose prose-invert max-w-none space-y-8">
                        <p className="text-zinc-400 leading-relaxed text-lg">
                            Sonaraura is the first platform to implement <strong>Real-time Molecular Tuning</strong>. We don't just play audio; we manipulate the physical frequency of sound waves on the fly.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-[#111] border border-white/5 rounded-3xl space-y-4">
                                <h4 className="text-white font-black italic uppercase">432Hz (Healing)</h4>
                                <p className="text-xs text-zinc-500 leading-relaxed">Mathematically consistent with the universe. Ideal for spa, wellness, and early morning hospitality environments to reduce stress.</p>
                            </div>
                            <div className="p-8 bg-[#111] border border-white/5 rounded-3xl space-y-4">
                                <h4 className="text-white font-black italic uppercase">528Hz (Focus)</h4>
                                <p className="text-xs text-zinc-500 leading-relaxed">The 'miracle' frequency. Used to increase clarity, repair DNA vibrationally, and enhance concentration in workspaces.</p>
                            </div>
                        </div>

                        <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Technical Superiority</p>
                            <p className="text-sm text-zinc-300">Our DSP engine shifts the frequency without affecting the original BPM or pitch of the instruments, ensuring zero distortion.</p>
                        </div>
                    </div>
                </article>
            );

        case 'karaoke-engine':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-pink-600/10 rounded-2xl flex items-center justify-center text-pink-500">
                            <Music size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Aura <br/> Karaoke</h1>
                        <p className="text-xl text-zinc-500 font-medium">Word-level precision for a truly immersive lyrical experience.</p>
                    </header>

                    <div className="prose prose-invert max-w-none space-y-8">
                        <p className="text-zinc-400 leading-relaxed text-lg">
                            Move beyond basic line-by-line scrolling. The Aura Karaoke Engine provides <strong>temporal glow synchronization</strong> at the word level.
                        </p>

                        <div className="bg-black/40 border border-white/5 p-10 rounded-[3rem] text-center space-y-4">
                            <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-700">Live Simulation</p>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter">
                                <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">Soundtrack</span>{' '}
                                <span className="text-zinc-700">the</span>{' '}
                                <span className="text-zinc-700">world.</span>
                            </h3>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black italic">W</div>
                                <p className="text-sm text-zinc-400"><strong>Word Glow:</strong> The exact word being pronounced comes alive on the screen.</p>
                            </li>
                            <li className="flex gap-4">
                                <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black italic">S</div>
                                <p className="text-sm text-zinc-400"><strong>Visual Rhythm:</strong> Lyrics adapt to the track's biometrics and tempo.</p>
                            </li>
                        </ul>
                    </div>
                </article>
            );

        case 'weather-ai':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                            <CloudLightning size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Atmospheric <br/> Zeka</h1>
                        <p className="text-xl text-zinc-500 font-medium">Your space, synchronized with the outside world.</p>
                    </header>

                    <div className="prose prose-invert max-w-none space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white border-b border-white/5 pb-2">Weather-Aware Optimization</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Aura AI uses the GPS coordinates of your venue to fetch real-time atmospheric data. When it starts to rain or the sun begins to set, the auditory environment adapts instantly.
                            </p>
                        </section>

                        <div className="p-8 bg-indigo-600/10 border border-indigo-600/20 rounded-[2.5rem] space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Dynamic Logic Examples</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <div className="text-indigo-400 font-bold uppercase italic text-[10px]">Storm Mode</div>
                                    <p className="text-xs text-zinc-400">System increases mid-range warmth and selects more comforting 'Cooning' textures.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-indigo-400 font-bold uppercase italic text-[10px]">Golden Hour</div>
                                    <p className="text-xs text-zinc-400">Transitions to smoother, higher-resonance frequencies as natural light fades.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            );

        case 'watermarking':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-white">
                            <Shield size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Signal <br/> Protection</h1>
                        <p className="text-xl text-zinc-500 font-medium">Invisible security built into the very fabric of the sound.</p>
                    </header>

                    <div className="prose prose-invert max-w-none space-y-8">
                        <p className="text-zinc-400 leading-relaxed text-lg">
                            We use <strong>LSB (Least Significant Bit) Watermarking</strong> to embed a permanent, digital UUID into every high-fidelity asset in our library.
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-6 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Format Agnostic</span>
                                <span className="text-xs text-zinc-500">Watermark survives WAV to MP3 conversion.</span>
                            </div>
                            <div className="p-6 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Legal Proof</span>
                                <span className="text-xs text-zinc-500">Unshakable evidence for copyright claim resolutions.</span>
                            </div>
                            <div className="p-6 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Invisible Signal</span>
                                <span className="text-xs text-zinc-500">Zero degradation of the audio listening experience.</span>
                            </div>
                        </div>
                    </div>
                </article>
            );

        case 'vision':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500">
                            <Zap size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">The Future of Sound, <br/> Frequency of Intelligence</h1>
                        <p className="text-xl text-zinc-500 font-medium">Architecture beyond silence and frequency engineering.</p>
                    </header>

                    <div className="prose prose-invert max-w-none space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white border-b border-white/5 pb-2">Who We Are?</h2>
                            <p className="text-zinc-400 leading-relaxed text-lg">
                                Sonaraura transforms music from a mere background element into a living intelligence that manages the atmosphere of a space on biological and emotional levels.
                            </p>
                            <p className="text-zinc-400 leading-relaxed">
                                By merging sound engineering, artificial intelligence, and psychoacoustics, we have built the world's first <strong>Atmospheric Intelligence</strong> platform. We are a technology company that synchronizes the frequency of sound, the vibe of the environment, and the listener's pulse.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white border-b border-white/5 pb-2">Our Vision</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Every space has a soul, every moment has a frequency. Our goal is to deepen the connection between businesses and creators with their target audiences through <strong>Frequency Engineering</strong>.
                            </p>
                            <p className="text-zinc-400 leading-relaxed">
                                We evolve music from the standard 440Hz mold into <strong>432Hz (Peace)</strong> and <strong>528Hz (Focus/Vitality)</strong> frequencies, synchronized with human biology in real-time. While doing this, we maintain the musical rhythm (BPM), re-engineering art with scientific precision.
                            </p>
                        </section>

                        <div className="p-10 bg-indigo-600/5 border border-indigo-600/20 rounded-[3rem] space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Core Principles</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <h5 className="text-white font-bold italic uppercase text-xs">Atmospheric Sync</h5>
                                    <p className="text-xs text-zinc-500">The seamless union of a space's soul with technological infrastructure.</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-white font-bold italic uppercase text-xs">Biological Alignment</h5>
                                    <p className="text-xs text-zinc-500">Frequencies that follow human biorhythms, reducing fatigue and enhancing well-being.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            );

        case 'core-stack':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500">
                            <Cpu size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Modern <br/> Architecture</h1>
                        <p className="text-xl text-zinc-500 font-medium">Built on the bleeding edge for speed, security, and scalability.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TechCard 
                            title="Frontend" 
                            tech="Next.js 14 (App Router)" 
                            desc="Server Components for instant loading and SEO-optimized dynamic routes."
                        />
                        <TechCard 
                            title="Backend" 
                            tech="Supabase" 
                            desc="Real-time subscriptions, RLS security policies, and PostgreSQL power."
                        />
                        <TechCard 
                            title="Styling" 
                            tech="Tailwind CSS 4" 
                            desc="The latest in utility-first CSS for high-performance UI designs."
                        />
                        <TechCard 
                            title="AI Layer" 
                            tech="Google Gemini AI" 
                            desc="Powering Aura Orchestrator for content analysis and metadata generation."
                        />
                        <TechCard 
                            title="State" 
                            tech="React Context & Hooks" 
                            desc="Lightweight, reactive player state and Smart Flow logic."
                        />
                        <TechCard 
                            title="Payments" 
                            tech="Stripe & Iyzico" 
                            desc="Global and local payment gateways for secure B2B and B2C transactions."
                        />
                    </div>
                </article>
            );

        case 'smart-flow':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                            <Zap size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Smart Flow <br/> Mastery</h1>
                        <p className="text-xl text-zinc-500 font-medium">Automated energy management for professional venues.</p>
                    </header>

                    <div className="prose prose-invert max-w-none space-y-8">
                        <p className="text-zinc-400 leading-relaxed text-lg">
                            Smart Flow is the heart of the Sonaraura venue experience. It removes the need for manual playlist management by using advanced rulesets.
                        </p>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white uppercase italic">How to Set Up a Rule:</h3>
                            <div className="space-y-6">
                                <Step number={1} title="Define the Time Window" desc="Set the start and end hours (e.g., 08:00 - 11:00 for Breakfast)." />
                                <Step number={2} title="Select Sonic Moods" desc="Choose from our taxonomy (e.g., Peaceful, Chill, Acoustic)." />
                                <Step number={3} title="Target Energy" desc="Define the BPM range and energy curve for that specific period." />
                                <Step number={4} title="Activate" desc="Aura will automatically transition between rules, ensuring no silence or jarring shifts." />
                            </div>
                        </div>

                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-8 rounded-[2rem]">
                            <p className="text-sm font-medium text-zinc-300 italic">
                                &quot;Aura automatically detects weather patterns. If it's raining outside, Smart Flow can subtly shift towards warmer, more comforting frequencies.&quot;
                            </p>
                        </div>
                    </div>
                </article>
            );

        case 'how-it-works':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                            <Info size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">The Sonaraura <br/> Ecosystem</h1>
                        <p className="text-xl text-zinc-500 font-medium">A simplified overview of how sound becomes a strategic asset.</p>
                    </header>

                    <div className="grid grid-cols-1 gap-12 pt-8">
                        <FlowItem 
                            title="1. Production & AI Orchestration" 
                            desc="Every asset in the library is a product of the Sonaraura Factory. Our AI Architects design the core sonic foundations, which are then refined by specialized production units to ensure absolute brand alignment." 
                        />
                        <FlowItem 
                            title="2. Quality Control (QC)" 
                            desc="Every asset passes through a rigorous QC pipeline. We verify technical standards like LUFS and bitrate, while Aura AI assigns precise taxonomy tags (Mood, Vibe, Theme) for intelligent delivery." 
                        />
                        <FlowItem 
                            title="3. Smart Curation" 
                            desc="Approved tracks are intelligently mapped to Premium Vibes—curated collections designed for specific business contexts (e.g., Luxury Boutique, Fine Dining, Gym & CrossFit)." 
                        />
                        <FlowItem 
                            title="4. Intelligent Playback" 
                            desc="Venues use the Aura Player with Smart Flow enabled. The system automatically shifts the environment based on time, customer volume, and local weather conditions." 
                        />
                    </div>
                </article>
            );

        case 'ai-engine':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500">
                            <Zap size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Aura AI <br/> Intelligence</h1>
                        <p className="text-xl text-zinc-500 font-medium">Powering the next generation of auditory context-awareness.</p>
                    </header>

                    <div className="prose prose-invert max-w-none space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white border-b border-white/5 pb-2">Neural Content Analysis</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                Our AI engine, built on <strong>Google Gemini</strong> models, understands the emotional and functional purpose of every sound. It analyzes spectral data to distinguish between contexts like 'Deep Focus' and 'Euphoric Celebration'.
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 group hover:border-indigo-500/20 transition-all">
                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Weather Sync</h4>
                                <p className="text-[11px] text-zinc-500">Adjusts room acoustics and playlist mood based on real-time outdoor conditions.</p>
                            </div>
                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 group hover:border-indigo-500/20 transition-all">
                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Biorhythm</h4>
                                <p className="text-[11px] text-zinc-500">Aligns musical tempo with circadian rhythms of human energy levels.</p>
                            </div>
                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 group hover:border-indigo-500/20 transition-all">
                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Auto-Tagging</h4>
                                <p className="text-[11px] text-zinc-500">Generates precise taxonomy tags (Theme, Vibe, Character) for every track.</p>
                            </div>
                        </div>
                    </div>
                </article>
            );

        case 'scheduling':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                            <Clock size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Dynamic <br/> Scheduling</h1>
                        <p className="text-xl text-zinc-500 font-medium">Set it and forget it. Aura handles the transitions.</p>
                    </header>

                    <div className="space-y-8">
                        <div className="bg-[#111] border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                            <h3 className="text-xl font-bold italic uppercase tracking-tight text-white">Example Schedule Profile</h3>
                            <div className="space-y-4">
                                <ScheduleRow time="08:00 - 11:00" activity="Morning Energy" vibe="Peaceful / Acoustic" energy="Low" />
                                <ScheduleRow time="11:00 - 16:00" activity="Lunch Peak" vibe="Upbeat / Lounge" energy="Medium" />
                                <ScheduleRow time="16:00 - 19:00" activity="Golden Hour" vibe="Dreamy / Smooth" energy="Medium-High" />
                                <ScheduleRow time="19:00 - Close" activity="Late Night" vibe="Dark / Cinematic" energy="High" />
                            </div>
                        </div>
                    </div>
                </article>
            );

        case 'tailor-process':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500">
                            <Layout size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">The Tailor <br/> Workflow</h1>
                        <p className="text-xl text-zinc-500 font-medium">How custom music production works for high-ticket clients.</p>
                    </header>

                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 bg-[#111] border border-white/5 rounded-3xl space-y-4">
                                <div className="text-4xl font-black text-white/10 italic leading-none">01</div>
                                <h4 className="text-lg font-bold text-white uppercase italic">Briefing & Story</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed">The client submits a detailed prompt and the <strong>Project Soul (PDF)</strong> explaining the brand identity.</p>
                            </div>
                            <div className="p-8 bg-[#111] border border-white/5 rounded-3xl space-y-4">
                                <div className="text-4xl font-black text-white/10 italic leading-none">02</div>
                                <h4 className="text-lg font-bold text-white uppercase italic">AI Orchestration</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed">AI Architects generate blueprints. These aren't final tracks, but sonic foundations.</p>
                            </div>
                            <div className="p-8 bg-[#111] border border-white/5 rounded-3xl space-y-4">
                                <div className="text-4xl font-black text-white/10 italic leading-none">03</div>
                                <h4 className="text-lg font-bold text-white uppercase italic">Producer Polish</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed">Human producers take the blueprints and perform final instrumentation and mastering to WAV standards.</p>
                            </div>
                            <div className="p-8 bg-[#111] border border-white/5 rounded-3xl space-y-4">
                                <div className="text-4xl font-black text-white/10 italic leading-none">04</div>
                                <h4 className="text-lg font-bold text-white uppercase italic">Delivery</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed">The client receives full commercial usage rights and high-fidelity masters in their dashboard.</p>
                            </div>
                        </div>
                    </div>
                </article>
            );

        case 'account-setup':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-green-600/10 rounded-2xl flex items-center justify-center text-green-500">
                            <CheckCircle2 size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Account <br/> Initialization</h1>
                        <p className="text-xl text-zinc-500 font-medium">Getting your credentials synchronized with the ecosystem.</p>
                    </header>

                    <div className="space-y-8">
                        <p className="text-zinc-400 leading-relaxed">
                            Every user in the Sonaraura network starts with a Unified Identity. Whether you are a solo creator or a multi-location hotel chain, your account lifecycle follows these phases:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 bg-[#111] border border-white/5 rounded-[2.5rem] space-y-3">
                                <h4 className="text-white font-bold uppercase italic tracking-tight">1. Auth Sync</h4>
                                <p className="text-xs text-zinc-500">We support Google and Apple SSO. Metadata is automatically matched with a secure Profile record.</p>
                            </div>
                            <div className="p-8 bg-[#111] border border-white/5 rounded-[2.5rem] space-y-3">
                                <h4 className="text-white font-bold uppercase italic tracking-tight">2. Tenant Provisioning</h4>
                                <p className="text-xs text-zinc-500">A "Tenant" is automatically created. This is your private workspace for venues and billing.</p>
                            </div>
                        </div>
                    </div>
                </article>
            );

        case 'b2b-licensing':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-zinc-600/10 rounded-2xl flex items-center justify-center text-zinc-400">
                            <Shield size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Commercial <br/> Licensing</h1>
                        <p className="text-xl text-zinc-500 font-medium">Fully cleared audio for high-traffic environments.</p>
                    </header>

                    <div className="prose prose-invert max-w-none space-y-8">
                        <div className="p-10 bg-indigo-600/5 border border-indigo-600/20 rounded-[3rem] space-y-6">
                            <h3 className="text-2xl font-black italic text-white uppercase leading-tight">The 100% Clearance Guarantee</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">Sonaraura provides a <strong>Commercial Performance License</strong> with every subscription. This covers:</p>
                            <ul className="space-y-2 text-xs font-medium text-zinc-300">
                                <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-indigo-500" /> Public Performance Rights (PPR)</li>
                                <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-indigo-500" /> Synchronization Rights for Digital Signage</li>
                                <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-indigo-500" /> Global Territorial Clearance</li>
                            </ul>
                        </div>
                    </div>
                </article>
            );

        case 'project-soul':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-pink-600/10 rounded-2xl flex items-center justify-center text-pink-500">
                            <FileText size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Project Soul <br/> Concept</h1>
                        <p className="text-xl text-zinc-500 font-medium">Capturing the intangible spirit of your brand in a single document.</p>
                    </header>

                    <div className="space-y-8">
                        <p className="text-zinc-400 leading-relaxed text-lg italic">
                            &quot;Music on Request is not about following a tempo; it's about translating a mission into frequencies.&quot;
                        </p>
                        <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Soul Document Requirements (PDF)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <h5 className="text-white font-bold italic">Brand Archetype</h5>
                                    <p className="text-xs text-zinc-500">Explorer? Sage? Magician? This defines our instrument choice.</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-white font-bold italic">Auditory Shadow</h5>
                                    <p className="text-xs text-zinc-500">What sounds should never be heard in your space?</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-white font-bold italic">Temporal Vision</h5>
                                    <p className="text-xs text-zinc-500">How should the music evolve as the project matures?</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-white font-bold italic">Visual Synesthesia</h5>
                                    <p className="text-xs text-zinc-500">Colors, textures, and materials associated with the brand.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            );

        case 'upload-qc':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                            <Layout size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">The Production <br/> Factory</h1>
                        <p className="text-xl text-zinc-500 font-medium">Ensuring world-class audio consistency across the ecosystem.</p>
                    </header>

                    <div className="prose prose-invert max-w-none space-y-8">
                        <p className="text-zinc-400 leading-relaxed">
                            Sonaraura does not operate as an open marketplace. Our library is an exclusive collection of engineered sound, designed to maintain a consistent 'Aura' across all touchpoints. All assets are either produced internally or by strictly vetted partners.
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-6 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase tracking-widest">LUFS Normalization</span>
                                <span className="text-xs font-black text-indigo-400">-14.0 LUFS Target</span>
                            </div>
                            <div className="p-6 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Sample Rate</span>
                                <span className="text-xs font-black text-indigo-400">48kHz / 24-bit min</span>
                            </div>
                            <div className="p-6 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Format Requirement</span>
                                <span className="text-xs font-black text-indigo-400">WAV or FLAC Only</span>
                            </div>
                        </div>
                    </div>
                </article>
            );

        case 'revenue-share':
            return (
                <article className="space-y-10">
                    <header className="space-y-4">
                        <div className="h-16 w-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                            <DollarSign size={32} />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Strategic <br/> Partnerships</h1>
                        <p className="text-xl text-zinc-500 font-medium">Revenue models for our vetted production units.</p>
                    </header>

                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8">
                        <div className="flex items-end justify-between">
                            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Partner Revenue Share</h4>
                            <span className="text-6xl font-black text-indigo-500 italic leading-none">40%</span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed italic border-t border-white/5 pt-6">
                            * Vetted partners receive 40% of every license sold (B2C) and a proportionate share of B2B streaming pools. This model ensures high-quality output over high-volume noise.
                        </p>
                    </div>
                </article>
            );

        default:
            return (
                <div className="py-20 text-center space-y-4">
                    <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Info size={40} className="text-zinc-600" />
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Section Under Construction</h2>
                    <p className="text-zinc-500">Our architects are documenting this part of the factory. Please check back shortly.</p>
                </div>
            );
    }
}

function TechCard({ title, tech, desc }: { title: string, tech: string, desc: string }) {
    return (
        <div className="p-8 bg-[#111] border border-white/5 rounded-[2rem] hover:border-white/10 transition-all space-y-4 group">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-indigo-400 transition-colors">{title}</h4>
            <div className="space-y-1">
                <h5 className="text-lg font-black text-white italic">{tech}</h5>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function Step({ number, title, desc }: { number: number, title: string, desc: string }) {
    return (
        <div className="flex gap-6 items-start">
            <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center font-black text-sm shrink-0">
                {number}
            </div>
            <div className="space-y-1">
                <h4 className="font-black text-white uppercase italic tracking-tight">{title}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function FlowItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="relative pl-12 border-l-2 border-white/5 space-y-2 group">
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-zinc-800 border-2 border-black group-hover:bg-indigo-500 transition-colors" />
            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{title}</h4>
            <p className="text-zinc-500 leading-relaxed max-w-2xl">{desc}</p>
        </div>
    );
}

function ScheduleRow({ time, activity, vibe, energy }: { time: string, activity: string, vibe: string, energy: string }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group">
            <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest min-w-[100px]">{time}</span>
                <div className="space-y-0.5">
                    <h5 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{activity}</h5>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{vibe}</p>
                </div>
            </div>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                Energy: {energy}
            </div>
        </div>
    );
}
