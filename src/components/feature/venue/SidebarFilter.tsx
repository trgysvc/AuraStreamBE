'use client';

import { useState } from 'react';

// Mock data based on design system
const MOODS = ['Chill', 'Cinematic', 'Lixnour', 'Laine', 'Graty'];
const GENRES = ['Cinematic', 'Syrharic', 'Maunting', 'Revetation', 'Maginaa', 'Other'];

export function SidebarFilter() {
    const [selectedMoods, setSelectedMoods] = useState<string[]>(['Chill']);
    const [selectedGenres, setSelectedGenres] = useState<string[]>(['Cinematic']);
    const [bpm, setBpm] = useState(120);

    const toggleFilter = (list: string[], item: string, setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col h-full overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-white">Search filters</h2>

            {/* Mood Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-gray-400 text-sm font-medium">Mood</h3>
                    <span className="text-gray-600 text-xs">v</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {MOODS.map(mood => (
                        <button
                            key={mood}
                            onClick={() => toggleFilter(selectedMoods, mood, setSelectedMoods)}
                            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${selectedMoods.includes(mood)
                                    ? 'bg-gray-700 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {mood}
                        </button>
                    ))}
                </div>
            </div>

            {/* Genre Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-gray-400 text-sm font-medium">Genre</h3>
                    <span className="text-gray-600 text-xs">v</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {GENRES.map(genre => (
                        <button
                            key={genre}
                            onClick={() => toggleFilter(selectedGenres, genre, setSelectedGenres)}
                            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${selectedGenres.includes(genre)
                                    ? 'bg-gray-700 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </div>

            {/* BPM Slider */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-gray-400 text-sm font-medium">BPM</h3>
                    <span className="text-gray-400 text-xs">{bpm}</span>
                </div>
                <input
                    type="range"
                    min="60"
                    max="180"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
            </div>

            {/* Duration Slider */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-gray-400 text-sm font-medium">Duration</h3>
                    <span className="text-gray-400 text-xs">00 - 40</span>
                </div>
                <div className="w-full h-1 bg-gray-700 rounded-lg relative">
                    <div className="absolute left-0 top-0 h-full bg-orange-500 w-1/3 rounded-l-lg"></div>
                </div>
            </div>
        </aside>
    )
}
