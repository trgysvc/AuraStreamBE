'use client';

import React, { useMemo } from 'react';

interface WaveformProps {
    data: number[];
    progress?: number; // 0 to 1
    height?: number;
    barWidth?: number;
    gap?: number;
    activeColor?: string;
    inactiveColor?: string;
    className?: string;
    onSeek?: (progress: number) => void;
}

/**
 * Epidemic Sound Style Waveform
 * Renders normalized bars with a progress overlay.
 */
export function Waveform({
    data = [],
    progress = 0,
    height = 40,
    barWidth = 2,
    gap = 2,
    activeColor = '#7C3AED', // Aura Violet
    inactiveColor = '#27272a', // Zinc 800
    className = '',
    onSeek
}: WaveformProps) {
    // Ensure we have data
    const points = useMemo(() => {
        if (!data || data.length === 0) return Array.from({ length: 100 }, () => 0.1);
        return data;
    }, [data]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!onSeek) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newProgress = Math.max(0, Math.min(1, x / rect.width));
        onSeek(newProgress);
    };

    return (
        <div 
            className={`relative flex items-end cursor-pointer group ${className}`}
            style={{ height: `${height}px`, gap: `${gap}px` }}
            onClick={handleClick}
        >
            {points.map((val, i) => {
                const pointProgress = i / points.length;
                const isActive = pointProgress <= progress;
                
                return (
                    <div
                        key={i}
                        className="transition-all duration-200"
                        style={{
                            width: `${barWidth}px`,
                            height: `${Math.max(10, val * 100)}%`,
                            backgroundColor: isActive ? activeColor : inactiveColor,
                            borderRadius: '1px'
                        }}
                    />
                );
            })}
            
            {/* Hover Indicator */}
            <div className="absolute top-0 bottom-0 w-px bg-white/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
        </div>
    );
}
