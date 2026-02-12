'use client';

import { Play, Download, Plus, Heart, MoreHorizontal, Wand2 } from 'lucide-react';
import { Waveform } from '@/components/shared/Waveform';
import { useState } from 'react';

interface TrackProps {
    id: string;
    title: string;
    artist: string;
    duration: string;
    bpm: number;
    tags: string[];
    image?: string;
    onSimilar?: (id: string) => void;
}

export default function TrackRow({ id, title, artist, duration, bpm, tags, image, onSimilar }: TrackProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="group flex items-center gap-6 py-4 px-4 hover:bg-white/[0.04] transition-all cursor-pointer border-b border-white/[0.02]">
            {/* Play Button & Cover Art */}
            <div className="relative h-14 w-14 flex-shrink-0">
                {image ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center rounded-lg shadow-lg"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg shadow-lg border border-white/5" />
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsPlaying(!isPlaying);
                        }}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-black shadow-2xl transform active:scale-90 transition-transform"
                    >
                        <Play size={18} fill="currentColor" className={isPlaying ? 'hidden' : 'ml-0.5'} />
                        <div className={isPlaying ? 'flex gap-0.5 items-center' : 'hidden'}>
                            <div className="w-1.5 h-4 bg-black animate-pulse" />
                            <div className="w-1.5 h-4 bg-black animate-pulse delay-75" />
                        </div>
                    </button>
                </div>
            </div>

            {/* Track Info */}
            <div className="w-44 flex-shrink-0 min-w-0">
                <h4 className="text-white font-bold truncate text-[15px] leading-tight group-hover:text-pink-500 transition-colors">{title}</h4>
                <p className="text-zinc-500 text-xs truncate mt-1 font-medium">{artist}</p>
            </div>

            {/* Waveform Visualization */}
            <div className="flex-1 px-4 min-w-[200px]">
                <Waveform 
                    seed={id} 
                    progress={isPlaying ? 0.4 : 0} 
                    height={36}
                    inactiveColor="rgba(255,255,255,0.1)"
                    activeColor="#FFFFFF"
                />
            </div>

            {/* Meta Info: Time & BPM */}
            <div className="w-20 flex-shrink-0 text-right">
                <div className="text-[13px] font-black text-zinc-200">{duration}</div>
                <div className="text-[10px] font-black text-zinc-500 mt-1 uppercase tracking-widest">{bpm} BPM</div>
            </div>

            {/* Tags / Category */}
            <div className="w-48 flex-shrink-0 px-4">
                <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-black text-zinc-400 uppercase tracking-tighter border border-white/5">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Actions (Far Right) */}
            <div className="flex items-center gap-4 pr-2 opacity-40 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => { e.stopPropagation(); onSimilar?.(id); }}
                    className="p-2 text-zinc-400 hover:text-pink-500 transition-colors" 
                    title="Find similar tracks"
                >
                    <Wand2 size={18} />
                </button>
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <Heart size={18} />
                </button>
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <Plus size={18} />
                </button>
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <Download size={18} />
                </button>
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <MoreHorizontal size={18} />
                </button>
            </div>
        </div>
    );
}
