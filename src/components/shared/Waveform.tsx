'use client';

import React, { useMemo } from 'react';

interface WaveformProps {
    seed?: string;
    progress?: number;
    height?: number;
    barWidth?: number;
    gap?: number;
    activeColor?: string;
    inactiveColor?: string;
    className?: string;
    onSeek?: (progress: number) => void;
    bpm?: number; // New prop for rhythm
}

/**
 * Epidemic Sound Style Waveform (Mirrored/Symmetrical around center)
 */
export function Waveform({
    seed = 'default',
    progress = 0,
    height = 48,
    barWidth = 2,
    gap = 1,
    activeColor = '#FFFFFF',
    inactiveColor = 'rgba(255, 255, 255, 0.15)',
    className = '',
    onSeek,
    bpm = 120,
    data
}: WaveformProps & { data?: number[] }) {
    const bars = useMemo(() => {
        // If real data is provided, use it (resampled to 100 max if needed)
        if (data && data.length > 0) {
            // Simple resampling if length is vastly different, or just slice/pad
            // For now assuming data is ~100 points as per backend script
            // Ensure values are 0-1
            return data.map(v => Math.max(0.05, Math.min(1, v)));
        }

        const count = 100;
        const generated = [];
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Normalize BPM to a useful frequency modifier (e.g. 60-180 range -> 0.5 - 1.5)
        const rhythmFactor = Math.max(0.5, Math.min(2.0, bpm / 100));

        for (let i = 0; i < count; i++) {
            // Generate values that look like a real audio waveform
            // Using multiple sin/cos waves for a more "organic" sound-like look
            // We use the rhythmFactor to space out the "beats" or peaks

            const position = i / count;

            // Base structure: varying loudness
            const structure = Math.sin(position * Math.PI) * 0.5 + 0.5; // Envelope (quiet at ends)

            // "Beats" based on BPM
            const beat = Math.abs(Math.sin(i * rhythmFactor * 0.5 + hash));

            // Random noise texture
            const noise = Math.abs(Math.sin(hash + i * 0.15) * Math.cos(hash + i * 0.07));

            // Combine
            const val = (beat * 0.6 + noise * 0.4) * structure;

            // Clamp and ensure minimum visibility
            generated.push(Math.max(0.15, Math.min(0.95, val)));
        }
        return generated;
    }, [seed, bpm, data]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!onSeek) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newProgress = Math.max(0, Math.min(1, x / rect.width));
        onSeek(newProgress);
    };

    const renderBars = (color: string) => (
        <div className="flex items-center h-full w-full justify-between" style={{ gap: `${gap}px` }}>
            {bars.map((val, i) => (
                <div key={i} className="flex flex-col items-center justify-center h-full flex-1" style={{ maxWidth: `${barWidth}px` }}>
                    <div
                        className="w-full rounded-full transition-colors duration-300"
                        style={{
                            height: `${val * 100}%`,
                            backgroundColor: color
                        }}
                    />
                </div>
            ))}
        </div>
    );

    return (
        <div
            className={`relative cursor-pointer group select-none ${className}`}
            style={{ height: `${height}px` }}
            onClick={handleClick}
        >
            {/* Background Layer */}
            <div className="absolute inset-0">
                {renderBars(inactiveColor)}
            </div>

            {/* Progress Clipping Layer */}
            <div
                className="absolute inset-0 overflow-hidden pointer-events-none transition-[width] duration-300 ease-out"
                style={{ width: `${progress * 100}%` }}
            >
                <div className="absolute inset-0" style={{ width: `${(1 / (progress || 1)) * 100}%` }}>
                    {renderBars(activeColor)}
                </div>
            </div>

            {/* Hover Indicator Line */}
            <div className="absolute top-0 bottom-0 w-[1px] bg-white/40 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 left-[var(--hover-x,0)]" />
        </div>
    );
}
