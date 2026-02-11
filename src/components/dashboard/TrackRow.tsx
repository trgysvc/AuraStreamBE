'use client';

import { Play, Download, Plus, Heart } from 'lucide-react';

interface TrackProps {
    title: string;
    artist: string;
    duration: string;
    bpm: number;
    tags: string[];
    image?: string;
}

export default function TrackRow({ title, artist, duration, bpm, tags, image }: TrackProps) {
    return (
        <div className="group flex items-center gap-4 py-3 px-4 hover:bg-white/5 rounded-md transition-colors cursor-pointer border-b border-white/5">
            {/* Play Button & Cover Art */}
            <div className="relative h-12 w-12 flex-shrink-0 group-hover:scale-105 transition-transform">
                {image ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center rounded overflow-hidden"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-zinc-800 rounded" />
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                    <button className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-black shadow-lg">
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                    </button>
                </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold truncate">{title}</h4>
                <p className="text-gray-400 text-sm truncate">{artist}</p>
            </div>

            {/* Waveform Visualization (Placeholder) */}
            <div className="hidden md:flex flex-1 h-8 gap-0.5 items-center opacity-50">
                {[...Array(40)].map((_, i) => (
                    <div
                        key={i}
                        className="w-1 bg-white rounded-full transition-all duration-300 group-hover:bg-white"
                        style={{ height: `${Math.random() * 100}%` }}
                    />
                ))}
            </div>

            {/* Meta Info */}
            <div className="hidden lg:flex items-center gap-4 text-sm text-gray-400 w-64 justify-end">
                <div className="flex gap-2">
                    {tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-white/10 rounded-full text-xs hover:bg-white/20 transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>
                <span className="w-8 text-right">{bpm}</span>
                <span className="w-12 text-right">{duration}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Heart size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Plus size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Download size={18} />
                </button>
            </div>
        </div>
    );
}
