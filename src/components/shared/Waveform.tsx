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
    onSeek
}: WaveformProps) {
    const bars = useMemo(() => {
        const count = 100;
        const data = [];
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }

        for (let i = 0; i < count; i++) {
            // Generate values that look like a real audio waveform
            // Using multiple sin/cos waves for a more "organic" sound-like look
            const noise = Math.abs(Math.sin(hash + i * 0.15) * Math.cos(hash + i * 0.07));
            const base = Math.abs(Math.sin(i * 0.03)) * 0.4;
            const spikes = i % 10 === 0 ? 0.3 : 0; // Add some rhythmic spikes
            const val = Math.max(0.15, Math.min(0.95, noise * 0.6 + base + spikes));
            data.push(val);
        }
        return data;
    }, [seed]);

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
