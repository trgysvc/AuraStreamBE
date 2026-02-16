import React from 'react';
import { 
    Zap, 
    Wind, 
    CloudRain, 
    ShieldCheck, 
    BarChart3, 
    Clock, 
    Play, 
    Music, 
    Layers,
    Sparkles,
    Search,
    Fingerprint,
    Cpu,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

const FeatureSection = ({ 
    title, 
    subtitle, 
    description, 
    image, 
    reverse = false, 
    icon: Icon,
    bgColor = "bg-black",
    textColor = "text-white",
    accentColor = "text-indigo-500",
    descriptionColor = "text-zinc-400",
    link = "/about/howitworks"
}: { 
    title: string, 
    subtitle: string, 
    description: string, 
    image: string, 
    reverse?: boolean, 
    icon: any,
    bgColor?: string,
    textColor?: string,
    accentColor?: string,
    descriptionColor?: string,
    link?: string
}) => (
    <section className={`py-20 md:py-32 px-6 md:px-16 ${bgColor} transition-colors duration-700`}>
        <div className={`max-w-7xl mx-auto flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}>
            <div className="flex-1 space-y-6 md:space-y-8 order-2 md:order-none">
                <div className={`flex items-center gap-3 ${accentColor}`}>
                    <Icon size={20} className="md:w-6 md:h-6" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] italic">{subtitle}</span>
                </div>
                <h2 className={`text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] md:leading-[0.85] ${textColor}`}>{title}</h2>
                <p className={`text-base md:text-xl font-medium leading-relaxed max-w-xl ${descriptionColor}`}>{description}</p>
                <div className="pt-2 md:pt-4">
                    <Link href={link} className={`flex items-center gap-3 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] border-b-2 pb-1 transition-all ${textColor === 'text-black' ? 'border-black/20 hover:border-black' : 'border-white/20 hover:border-white'}`}>
                        Learn more <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
            <div className="flex-1 w-full aspect-square md:aspect-square rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative group order-1 md:order-none">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[4s] group-hover:scale-110"
                    style={{ backgroundImage: `url(${image})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${bgColor === 'bg-white' || bgColor === 'bg-[#E8EDF2]' ? 'from-white/20' : 'from-black/60'} via-transparent to-transparent`} />
            </div>
        </div>
    </section>
);

const AdvantageCard = ({ icon: Icon, title, description, link = "/about/howitworks" }: { icon: any, title: string, description: string, link?: string }) => (
    <div className="bg-white/5 p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 space-y-4 md:space-y-6 hover:border-indigo-500/30 transition-all group backdrop-blur-sm flex flex-col">
        <div className="space-y-3 md:space-y-4 flex-1">
            <div className="h-8 w-8 md:h-12 md:w-12 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-indigo-500 transition-colors">
                <Icon size={18} className="md:w-6 md:h-6" />
            </div>
            <h4 className="text-sm md:text-lg font-black uppercase italic tracking-tighter text-white leading-tight">{title}</h4>
            <p className="text-zinc-500 text-[10px] md:text-sm font-medium leading-relaxed line-clamp-3 md:line-clamp-none">{description}</p>
        </div>
        <Link href={link} className="flex items-center gap-1 md:gap-2 font-black text-[8px] md:text-[10px] uppercase tracking-widest text-indigo-400 border-b border-indigo-400/20 w-fit pb-0.5 md:pb-1 hover:border-indigo-400 transition-all mt-2 md:mt-4">
            Learn more <ArrowRight size={10} />
        </Link>
    </div>
);

const IntelligenceCard = ({ title, description, tag, link = "/about/howitworks" }: { title: string, description: string, tag: string, link?: string }) => (
    <div className="bg-white/[0.02] border border-white/5 p-5 md:p-12 rounded-[1.5rem] md:rounded-[3rem] space-y-4 md:space-y-8 hover:bg-white/[0.04] transition-all group relative overflow-hidden flex flex-col">
        <div className="space-y-3 md:space-y-4 relative z-10 flex-1">
            <span className="px-2 py-0.5 md:px-4 md:py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">{tag}</span>
            <h4 className="text-lg md:text-3xl font-black uppercase italic tracking-tighter text-white leading-tight">{title}</h4>
            <p className="text-zinc-500 text-[10px] md:text-sm font-medium leading-relaxed max-w-sm line-clamp-3 md:line-clamp-none">{description}</p>
        </div>
        <Link href={link} className="relative z-10 flex items-center gap-1 md:gap-2 font-black text-[8px] md:text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10 w-fit pb-0.5 md:pb-1 hover:text-white hover:border-white transition-all">
            Learn more <ArrowRight size={10} />
        </Link>
    </div>
);

export default function AdPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden">
            {/* Hero Section */}
            <header className="relative h-screen flex items-center justify-center overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                
                <div className="relative z-10 text-center space-y-8 md:space-y-10 px-6">
                    <div className="inline-flex items-center gap-3 px-5 py-1.5 md:px-6 md:py-2 bg-white/5 border border-white/10 rounded-full">
                        <Sparkles size={14} className="text-indigo-400 md:w-4 md:h-4" />
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">The Chief Architect of Sound</span>
                    </div>
                    <h1 className="text-5xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.8] drop-shadow-2xl">
                        SONARAURA<br />
                        <span className="text-indigo-500 text-glow-indigo">ECOSYSTEM</span>
                    </h1>
                    <p className="text-zinc-400 text-base md:text-3xl font-medium max-w-3xl mx-auto uppercase tracking-tighter leading-tight">
                        Molecular Frequency Engineering & Atmospheric Intelligence.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 pt-6 md:pt-8">
                        <Link href="/dashboard/venue" className="w-full md:w-auto px-10 py-4 md:px-12 md:py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl">
                            Explore Catalog
                        </Link>
                        <Link href="/account" className="w-full md:w-auto px-10 py-4 md:px-12 md:py-5 bg-transparent border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-white/5 transition-all">
                            Partner with us
                        </Link>
                    </div>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-white to-transparent" />
                </div>
            </header>

            {/* Feature 1: Molecular Sound (Deep Purple/Indigo) */}
            <FeatureSection 
                icon={Zap}
                subtitle="Frequency Engineering"
                title="Molecular Sound Tech"
                description="We don't just play music; we manipulate its physical structure. Seamlessly shift between 440Hz, 432Hz (Healing), and 528Hz (Focus) without losing a single beat. Sonaraura impacts listeners at a biological level."
                image="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2000"
                bgColor="bg-[#1A1B23]"
                accentColor="text-indigo-400"
                link="/about/howitworks?page=frequency-eng"
            />

            {/* Feature 2: Aura Karaoke (Black) */}
            <FeatureSection 
                icon={Layers}
                subtitle="Word-Level Precision"
                title="Aura Karaoke Engine"
                description="Experience lyrics that breathe with the music. Our word-level synchronization engine highlights exactly what is being sung with elegant glows and scales, delivering a premium visual accompaniment."
                image="https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2000"
                reverse
                bgColor="bg-[#0F0F12]"
                accentColor="text-pink-500"
                link="/about/howitworks?page=karaoke-engine"
            />

            {/* Feature 3: Weather AI (Light Grey/Blue) */}
            <FeatureSection 
                icon={CloudRain}
                subtitle="Atmospheric Zeka"
                title="Weather-Aware Intelligence"
                description="Your venue's sound should reflect the world outside. Aura AI monitors live GPS and weather data to automatically optimize playlists and frequencies. When the rain starts, the atmosphere adapts instantly."
                image="https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2000"
                bgColor="bg-[#E8EDF2]"
                textColor="text-black"
                accentColor="text-blue-600"
                descriptionColor="text-zinc-600"
                link="/about/howitworks?page=weather-ai"
            />

            {/* Feature 4: Smart Flow (Dark) */}
            <FeatureSection 
                icon={Clock}
                subtitle="Autonomous Director"
                title="Smart Flow Scheduling"
                description="The 24-hour visual schedule manager. From calm morning flows to sophisticated evening atmospheres, Aura manages the energy of your venue autonomously, following its natural biorhythm."
                image="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000"
                reverse
                bgColor="bg-[#111111]"
                accentColor="text-emerald-500"
                link="/about/howitworks?page=smart-flow"
            />

            {/* Stats / Matrix Section (Deep Purple Gradient) */}
            <section className="bg-gradient-to-b from-[#111] to-indigo-950/30 py-24 md:py-40 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 md:px-16 space-y-16 md:space-y-24">
                    <div className="text-center space-y-4 md:space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-indigo-400">Technical Sovereignty</h3>
                        <h2 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-none">The Advantage Matrix</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        <AdvantageCard 
                            icon={Fingerprint}
                            title="LSB Watermarking"
                            description="Signal-level UUID embedding for bulletproof copyright protection. Inaudible, unremovable, and legally absolute."
                            link="/about/howitworks?page=watermarking"
                        />
                        <AdvantageCard 
                            icon={BarChart3}
                            title="Elite Analytics"
                            description="Infrastructure ROI tracking that analyzes content gaps, search latency, and listener engagement in real-time."
                            link="/about/howitworks?page=strategic-intel"
                        />
                        <AdvantageCard 
                            icon={Cpu}
                            title="JIT Rendering"
                            description="Just-In-Time high-fidelity rendering that optimizes cloud storage while delivering bespoke frequencies on demand."
                            link="/about/howitworks?page=core-stack"
                        />
                        <AdvantageCard 
                            icon={Wind}
                            title="BPM Preservation"
                            description="Change the fundamental frequency of any track without altering its tempo or rhythmic integrity."
                            link="/about/howitworks?page=frequency-eng"
                        />
                        <AdvantageCard 
                            icon={ShieldCheck}
                            title="Legal Shield"
                            description="Automated YouTube dispute resolution and license-backed evidence generation for creators."
                            link="/about/howitworks?page=b2b-licensing"
                        />
                        <AdvantageCard 
                            icon={Search}
                            title="Hybrid Search"
                            description="Deep taxonomy filtering combined with AI-assisted mood and energy tagging for instant asset discovery."
                            link="/about/howitworks?page=ai-engine"
                        />
                    </div>
                </div>
            </section>

            {/* Feature 5: Interactive Waveforms (Yellow Contrast) */}
            <FeatureSection 
                icon={Music}
                subtitle="Sonic Discovery"
                title="Interactive Waveforms"
                description="Don't just listen, see the texture of the sound. Each track in our catalog features a live, interactive waveform that dances with the playback and allows for precision seeking."
                image="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2000"
                bgColor="bg-[#F7D348]"
                textColor="text-black"
                accentColor="text-black"
                descriptionColor="text-black/70"
                link="/about/howitworks?page=interactive-waveforms"
            />

            {/* NEW: Business Intelligence Section (Dark Grey) */}
            <section className="py-24 md:py-32 px-6 md:px-16 bg-[#1A1A1E]">
                <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                        <div className="space-y-4 md:space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-indigo-400 italic">Global Infrastructure</h3>
                            <h2 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] md:leading-[0.8] text-white">The Intelligence Layer</h2>
                        </div>
                        <p className="text-zinc-500 text-base md:text-lg font-medium max-w-sm md:border-l border-white/10 md:pl-8 pb-2">
                            Autonomous systems that manage your content strategy and ROI while you sleep.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <IntelligenceCard 
                            title="Frame-Perfect Sync"
                            description="Broadcast-grade timing precision. Every track is millisecond-synchronized with its physical file length for zero-drift scheduling."
                            tag="Broadcasting"
                            link="/about/howitworks?page=sync-precision"
                        />
                        <IntelligenceCard 
                            title="Regional ROI"
                            description="Our AI identifies latency in specific cities and automatically triggers Edge replication to ensure zero-lag performance globally."
                            tag="Infrastructure"
                            link="/about/howitworks?page=strategic-intel"
                        />
                        <IntelligenceCard 
                            title="Revenue Intelligence"
                            description="Aura Tailor identifies 'Content Gaps' by analyzing what your users search for but can't find, directing our production team."
                            tag="Sales Conversion"
                            link="/about/howitworks?page=revenue-intel"
                        />
                        <IntelligenceCard 
                            title="Churn Heartbeat"
                            description="Intelligent monitoring of session health. We detect risky user behavior patterns before they leave, triggering proactive retention."
                            tag="Retention AI"
                            link="/about/howitworks?page=churn-heartbeat"
                        />
                        <IntelligenceCard 
                            title="Architectural UI Evolution"
                            description="Interface decisions driven by technical telemetry. We evolve our UI based on what works fastest, not just what looks good."
                            tag="Core Integrity"
                            link="/about/howitworks?page=vision"
                        />
                        <IntelligenceCard 
                            title="Biorhythm Training"
                            description="The system learns when your venue skips tracks, automatically adjusting JIT rendering to optimize storage by 70%."
                            tag="ML Training"
                            link="/about/howitworks?page=ai-engine"
                        />
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-32 md:py-56 px-6 md:px-8 text-center bg-black">
                <div className="max-w-5xl mx-auto space-y-12 md:space-y-16">
                    <h2 className="text-5xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.9] md:leading-[0.8] text-white">
                        Ready to soundtrack the <span className="text-indigo-500">future?</span>
                    </h2>
                    <p className="text-zinc-500 text-lg md:text-2xl font-bold uppercase tracking-tighter">
                        Experience the most technically advanced audio ecosystem ever built.
                    </p>
                    <div className="pt-4 md:pt-8">
                        <Link href="/account" className="w-full md:w-auto inline-block px-12 py-5 md:px-20 md:py-8 bg-white text-black rounded-full font-black text-xs md:text-sm uppercase tracking-[0.4em] hover:bg-indigo-500 hover:text-white transition-all shadow-[0_0_80px_rgba(99,102,241,0.4)] hover:scale-105">
                            Get Early Access
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
