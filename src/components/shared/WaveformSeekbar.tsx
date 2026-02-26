'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

interface WaveformSeekbarProps {
    duration: number;
    currentTime: number;
    peakData?: number[];
    acousticMatrixUrl?: string;
    onSeek: (time: number) => void;
    isPlaying: boolean;
    className?: string;
    // Styling overrides
    barWidth?: number;
    gap?: number;
    minHeight?: number;
    playedColor?: string;
    unplayedColor?: string;
    previewColor?: string;
}

// Utility: Resample a large or small array of numbers into an exact targetLength
const resampleArray = (data: number[], targetLength: number): number[] => {
    if (!data || data.length === 0) return [];

    const result = new Array(targetLength);
    const ratio = data.length / targetLength;

    for (let i = 0; i < targetLength; i++) {
        const start = Math.floor(i * ratio);
        let end = Math.floor((i + 1) * ratio);

        // Ensure we sample at least one point (critical for upsampling)
        if (end === start) {
            end = start + 1;
        }

        // Find max in this block to preserve powerful peaks
        let max = 0;
        for (let j = start; j < end && j < data.length; j++) {
            if (data[j] > max) max = data[j];
        }
        result[i] = max;
    }

    return result;
};

// Utility: Format time (seconds) to mm:ss format
const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function WaveformSeekbar({
    duration,
    currentTime,
    peakData,
    acousticMatrixUrl,
    onSeek,
    isPlaying,
    className = "",
    barWidth = 2,
    gap = 1,
    minHeight = 4,
    playedColor = "#FFFFFF",
    unplayedColor = "#A855F7",
    previewColor = "rgba(255, 255, 255, 0.4)"
}: WaveformSeekbarProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse state for interaction
    const [isHovering, setIsHovering] = useState(false);
    const [hoverX, setHoverX] = useState<number | null>(null);
    const [isScrubbing, setIsScrubbing] = useState(false);

    // Canvas dimensions (CSS pixels)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const handleResize = useCallback(() => {
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            setDimensions({ width: clientWidth, height: clientHeight });
        }
    }, []);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    const [fetchedPeaks, setFetchedPeaks] = useState<number[] | null>(null);

    // Fetch acoustic JSON matrix if URL present
    useEffect(() => {
        if (!acousticMatrixUrl) return;

        let isMounted = true;
        const fetchMatrix = async () => {
            try {
                const res = await fetch(acousticMatrixUrl);
                if (!res.ok) throw new Error('Network error');
                const data = await res.json();

                if (isMounted && Array.isArray(data)) {
                    // Extract RMS values from the 5000-frame flat parameter array
                    const rmsValues = data.map((frame: any) => frame.rms || 0);
                    setFetchedPeaks(rmsValues);
                }
            } catch (err) {
                console.warn("[Waveform] Failed to fetch high-res matrix, falling back:", err);
                if (isMounted) setFetchedPeaks([]); // Empty array triggers fallback
            }
        };

        fetchMatrix();

        return () => { isMounted = false; };
    }, [acousticMatrixUrl]);

    // Calculate processed peaks
    const processedPeaks = useMemo(() => {
        let dataSource: number[] = [];

        // 1. Prioritize fetched high-res matrix RMS points
        if (fetchedPeaks && fetchedPeaks.length > 0) {
            dataSource = fetchedPeaks;
        }
        // 2. Fall back to legacy inline arrays in DB
        else if (peakData) {
            let parsedData = Array.isArray(peakData) ? peakData : [];
            if (typeof peakData === 'string') {
                try {
                    parsedData = JSON.parse(peakData);
                } catch (e) {
                    console.error("Failed to parse peakData:", e);
                }
            }
            dataSource = parsedData;
        }

        if (!dataSource || dataSource.length === 0) return [];

        // We need 1 bar per (barWidth + gap) pixels
        const totalBars = Math.floor(dimensions.width / (barWidth + gap));
        if (totalBars <= 0) return [];

        const resampled = resampleArray(dataSource, totalBars);

        // Normalize against highest peak to use full height
        const maxPeak = Math.max(...resampled, 0.1); // Prevent div by 0

        return resampled.map(v => {
            // Normalize (0.0 - 1.0)
            const normalized = v / maxPeak;
            // Apply Energy Curve: non-linear scaling (x^1.8) exaggerates loud vs quiet
            const energy = Math.pow(normalized, 1.8);
            return energy;
        });
    }, [peakData, fetchedPeaks, dimensions.width, barWidth, gap]);

    // Synthetic data for buffering/fallback state if no peak data
    const syntheticPeaks = useMemo(() => {
        if (processedPeaks.length > 0) return [];
        const totalBars = Math.floor(dimensions.width / (barWidth + gap));
        if (totalBars <= 0) return [];

        const arr = new Array(totalBars).fill(0);
        return arr.map((_, i) => {
            return 0.2 + Math.abs(Math.sin(i * 0.2)) * 0.3; // Gentle sine wave
        });
    }, [processedPeaks.length, dimensions.width, barWidth, gap]);

    const activePeaks = processedPeaks.length > 0 ? processedPeaks : syntheticPeaks;

    // --- Main Rendering Engine ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.width === 0 || dimensions.height === 0 || activePeaks.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // --- High-DPI (Retina) Canvas Scaling ---
        // 1. Get exact pixel ratio
        const dpr = window.devicePixelRatio || 1;

        // 2. Scale internal canvas resolution
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;

        // 3. Reset transform before scaling to prevent accumulation
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        const progressPercent = duration > 0 ? (currentTime / duration) : 0;
        const progressX = dimensions.width * progressPercent;

        // 1. Draw all bars in unplayed color
        ctx.fillStyle = unplayedColor;
        ctx.beginPath();
        activePeaks.forEach((val, i) => {
            const x = i * (barWidth + gap);
            // Height calculation: scale to available height, ensure minHeight
            const calculatedHeight = val * dimensions.height;
            const finalHeight = Math.max(minHeight, calculatedHeight);

            // Vertical centering
            const y = (dimensions.height - finalHeight) / 2;

            ctx.roundRect(x, y, barWidth, finalHeight, barWidth / 2);
        });
        ctx.fill();

        // 2. Playhead Progress Overlay (Source-Atop Masking)
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = playedColor;
        ctx.fillRect(0, 0, progressX, dimensions.height);

        // 3. Hover Preview Scrubbing Region
        if ((isHovering || isScrubbing) && hoverX !== null && hoverX > progressX) {
            ctx.fillStyle = previewColor;
            ctx.fillRect(progressX, 0, hoverX - progressX, dimensions.height);
        }

        // Restore composite op
        ctx.globalCompositeOperation = 'source-over';

        // Optional: Loading Shimmer Overlay on Synthetic Data
        if (processedPeaks.length === 0) {
            const time = Date.now() / 1000;
            const shimmerX = (time % 2) * dimensions.width - 50; // Sweep left to right every 2s

            // Create gradient
            const grad = ctx.createLinearGradient(shimmerX, 0, shimmerX + 100, 0);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');

            // Clip to drawing area (Optional: requires filling all bars as a mask)
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, dimensions.width, dimensions.height);
        }

    }, [
        dimensions,
        activePeaks,
        currentTime,
        duration,
        isHovering,
        hoverX,
        isScrubbing,
        barWidth,
        gap,
        minHeight,
        playedColor,
        unplayedColor,
        previewColor,
        processedPeaks.length
    ]);

    // Auto-re-render for shimmer effect if buffering
    useEffect(() => {
        if (processedPeaks.length > 0) return;
        let animationFrame: number;
        const animate = () => {
            // Dummy state tick to trigger redraw
            setHoverX(prev => prev);
            animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [processedPeaks.length]);

    // --- Interaction Handlers ---
    const updateScrubTime = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setHoverX(x);

        if (isScrubbing) {
            const newTime = (x / rect.width) * duration;
            onSeek(newTime);
        }
    }, [duration, isScrubbing, onSeek]);

    const handlePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        setIsScrubbing(true);
        containerRef.current?.setPointerCapture(e.pointerId);
        updateScrubTime(e.clientX);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setHoverX(x);

        if (isScrubbing) {
            updateScrubTime(e.clientX);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        e.stopPropagation();
        setIsScrubbing(false);
        containerRef.current?.releasePointerCapture(e.pointerId);

        // Final seek on release to ensure exact landing
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const newTime = (x / rect.width) * duration;
        onSeek(newTime);
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
        setIsHovering(false);
        if (!isScrubbing) setHoverX(null);
    };

    const previewTime = (hoverX !== null && dimensions.width > 0)
        ? (hoverX / dimensions.width) * duration
        : 0;

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full cursor-pointer touch-none group ${className}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {/* The main drawing surface */}
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
                style={{ width: '100%', height: '100%' }}
            />

            {/* Hover Tooltip - Float exactly over cursor X */}
            {(isHovering || isScrubbing) && hoverX !== null && (
                <div
                    className="absolute bottom-full mb-2 pointer-events-none z-[100]"
                    style={{ left: hoverX, transform: 'translateX(-50%)' }}
                >
                    <div className="bg-zinc-800 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-white shadow-2xl border border-white/10 whitespace-nowrap">
                        {formatTime(previewTime)}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                    </div>
                </div>
            )}

            {/* Playhead Hover Cursor Indicator (Thin line) */}
            {(isHovering || isScrubbing) && hoverX !== null && (
                <div
                    className="absolute top-0 bottom-0 w-[1px] bg-white/50 pointer-events-none z-10"
                    style={{ left: hoverX }}
                />
            )}
        </div>
    );
}
