'use client';

import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Heart, Plus, Download } from 'lucide-react';

export default function Player() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume] = useState(80);
    const [progress] = useState(30);

    return (
        <div className="h-24 bg-[#121212] border-t border-white/10 fixed bottom-0 left-0 right-0 z-50 flex items-center px-6 justify-between text-white">

            {/* Track Info */}
            <div className="flex items-center gap-4 w-[30%]">
                <div className="h-14 w-14 bg-zinc-800 rounded overflow-hidden relative group">
                    {/* Placeholder Art */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500" />
                </div>
                <div>
                    <h4 className="font-bold text-sm hover:underline cursor-pointer">Low Orbit</h4>
                    <p className="text-xs text-gray-400 hover:text-white hover:underline cursor-pointer transition-colors">Jobii</p>
                </div>
                <button className="text-gray-400 hover:text-pink-500 transition-colors ml-2">
                    <Heart size={18} />
                </button>
            </div>

            {/* Controls & Waveform */}
            <div className="flex flex-col items-center justify-center w-[40%] gap-2">
                <div className="flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <Shuffle size={16} />
                    </button>
                    <button className="text-gray-200 hover:text-white transition-colors">
                        <SkipBack size={20} fill="currentColor" />
                    </button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                    </button>
                    <button className="text-gray-200 hover:text-white transition-colors">
                        <SkipForward size={20} fill="currentColor" />
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <Repeat size={16} />
                    </button>
                </div>

                <div className="w-full flex items-center gap-3 text-xs font-mono text-gray-400">
                    <span>1:12</span>
                    <div className="relative h-1 flex-1 bg-zinc-800 rounded-full group cursor-pointer">
                        <div
                            className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-pink-500 transition-colors"
                            style={{ width: `${progress}%` }}
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `${progress}%` }}
                        />
                    </div>
                    <span>3:45</span>
                </div>
            </div>

            {/* Volume & Actions */}
            <div className="flex items-center justify-end gap-4 w-[30%]">
                <button className="text-gray-400 hover:text-white transition-colors" title="Add to playlist">
                    <Plus size={20} />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors" title="Download">
                    <Download size={20} />
                </button>
                <div className="flex items-center gap-2 w-32 group">
                    <Volume2 size={20} className="text-gray-400 group-hover:text-white" />
                    <div className="h-1 flex-1 bg-zinc-800 rounded-full cursor-pointer">
                        <div
                            className="h-full bg-gray-400 group-hover:bg-white rounded-full"
                            style={{ width: `${volume}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
