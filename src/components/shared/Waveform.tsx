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
 * Epidemic Sound Style Waveform (Mirrored/Symmetrical)
 */
export function Waveform({
    seed = 'default',
    progress = 0,
    height = 40,
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
            // Generate values that look like a real waveform (clumped energy)
            const noise = Math.abs(Math.sin(hash + i * 0.1) * Math.cos(hash + i * 0.05));
            const base = Math.abs(Math.sin(i * 0.02)) * 0.3;
            const val = Math.min(0.9, noise * 0.7 + base + 0.1);
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
                <div key={i} className="flex flex-col items-center justify-center h-full" style={{ width: `${barWidth}px` }}>
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
            {/* Background */}
            <div className="absolute inset-0">
                {renderBars(inactiveColor)}
            </div>

            {/* Progress Clipping */}
            <div 
                className="absolute inset-0 overflow-hidden pointer-events-none transition-[width] duration-300 ease-out"
                style={{ width: `${progress * 100}%` }}
            >
                <div className="absolute inset-0" style={{ width: `${(1 / (progress || 1)) * 100}%` }}>
                    {renderBars(activeColor)}
                </div>
            </div>

            {/* Selection/Hover Area */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute top-0 bottom-0 w-px bg-white/30 z-20" style={{ left: 'var(--hover-x, 0)' }} />
            </div>
        </div>
    );
}
