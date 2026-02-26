'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

interface InteractiveWaveformProps {
    duration: number; // in seconds
    peakData?: number[];
    isReference?: boolean;
    // Selection state for Reference Track
    selectionStartMs?: number;
    selectionEndMs?: number;
    onSelectionChange?: (startMs: number, endMs: number) => void;
    onSelectionDragEnd?: (startMs: number, endMs: number) => void;
    // Static highlight state for Result Tracks
    highlightStartMs?: number;
    highlightEndMs?: number;
    // Base styles
    className?: string;
    barWidth?: number;
    gap?: number;
    minHeight?: number;
    baseColor?: string;
    onSeek?: (time: number) => void;
    currentTime?: number;
}

// Resampling logic matching the main WaveformSeekbar
const resampleArray = (data: number[], targetLength: number): number[] => {
    if (!data || data.length === 0) return [];
    const result = new Array(targetLength);
    const ratio = data.length / targetLength;
    for (let i = 0; i < targetLength; i++) {
        const start = Math.floor(i * ratio);
        let end = Math.floor((i + 1) * ratio);
        if (end === start) end = start + 1;
        let max = 0;
        for (let j = start; j < end && j < data.length; j++) {
            if (data[j] > max) max = data[j];
        }
        result[i] = max;
    }
    return result;
};

export function InteractiveWaveform({
    duration,
    peakData,
    isReference = false,
    selectionStartMs = 0,
    selectionEndMs = 15000,
    onSelectionChange,
    onSelectionDragEnd,
    highlightStartMs,
    highlightEndMs,
    className = "",
    barWidth = 2,
    gap = 1,
    minHeight = 4,
    baseColor = "rgba(255, 255, 255, 0.2)",
    onSeek = () => { },
    currentTime = 0
}: InteractiveWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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

    // Calculate processed peaks
    const processedPeaks = useMemo(() => {
        if (!peakData) return [];
        let parsedData = Array.isArray(peakData) ? peakData : [];
        if (typeof peakData === 'string') {
            try { parsedData = JSON.parse(peakData); } catch (e) { return []; }
        }
        if (!parsedData || parsedData.length === 0) return [];

        const totalBars = Math.floor(dimensions.width / (barWidth + gap));
        if (totalBars <= 0) return [];

        const resampled = resampleArray(parsedData, totalBars);
        const maxPeak = Math.max(...resampled, 0.1);
        return resampled.map(v => v / maxPeak);
    }, [peakData, dimensions.width, barWidth, gap]);

    // Canvas Render
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.width === 0 || dimensions.height === 0 || processedPeaks.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        // Draw Base Array
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        processedPeaks.forEach((val, i) => {
            const x = i * (barWidth + gap);
            const calculatedHeight = val * dimensions.height;
            const finalHeight = Math.max(minHeight, calculatedHeight);
            const y = (dimensions.height - finalHeight) / 2;
            ctx.roundRect(x, y, barWidth, finalHeight, barWidth / 2);
        });
        ctx.fill();

        // If not reference, maybe draw standard playback progress?
        if (!isReference && currentTime > 0) {
            const progressPercent = duration > 0 ? (currentTime / duration) : 0;
            const progressX = dimensions.width * progressPercent;
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = '#A855F7'; // Played color
            ctx.fillRect(0, 0, progressX, dimensions.height);
            ctx.globalCompositeOperation = 'source-over';
        }

    }, [dimensions, processedPeaks, barWidth, gap, minHeight, baseColor, isReference, currentTime, duration]);

    // --- Interactive Dragging Logic ---
    const MIN_DURATION_MS = 5000; // 5 seconds constraint
    const durationMs = duration * 1000;

    // Convert ms to percentage (0 - 100)
    const startPct = durationMs > 0 ? (selectionStartMs / durationMs) * 100 : 0;
    const endPct = durationMs > 0 ? (selectionEndMs / durationMs) * 100 : 0;

    const dragState = useRef<{
        isDragging: boolean;
        type: 'move' | 'resize-left' | 'resize-right' | null;
        startX: number;
        initStartMs: number;
        initEndMs: number;
    }>({ isDragging: false, type: null, startX: 0, initStartMs: 0, initEndMs: durationMs > 0 ? 15000 : 0 });

    const currentSelection = useRef({ start: selectionStartMs, end: selectionEndMs });
    useEffect(() => {
        if (!dragState.current.isDragging) {
            currentSelection.current = { start: selectionStartMs, end: selectionEndMs };
        }
    }, [selectionStartMs, selectionEndMs]);

    const handlePointerDown = (e: React.PointerEvent, type: 'move' | 'resize-left' | 'resize-right') => {
        e.stopPropagation();
        if (!isReference || !containerRef.current || durationMs <= 0) return;

        containerRef.current.setPointerCapture(e.pointerId);
        dragState.current = {
            isDragging: true,
            type,
            startX: e.clientX,
            initStartMs: selectionStartMs,
            initEndMs: selectionEndMs
        };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragState.current.isDragging || !containerRef.current) return;
        e.stopPropagation();

        const rect = containerRef.current.getBoundingClientRect();
        // Calculate delta entirely in MS scale
        const deltaX = e.clientX - dragState.current.startX;
        const deltaPct = deltaX / rect.width;
        const deltaMs = deltaPct * durationMs;

        let newStart = dragState.current.initStartMs;
        let newEnd = dragState.current.initEndMs;

        const ACTUAL_MIN_DURATION = Math.min(MIN_DURATION_MS, Math.max(0, durationMs));

        if (dragState.current.type === 'move') {
            newStart += deltaMs;
            newEnd += deltaMs;

            // Constrain move to bounds
            if (newStart < 0) {
                newEnd = (newEnd - newStart);
                newStart = 0;
            }
            if (newEnd > durationMs) {
                newStart -= (newEnd - durationMs);
                newEnd = durationMs;
                if (newStart < 0) newStart = 0;
            }
        } else if (dragState.current.type === 'resize-left') {
            newStart += deltaMs;
            if (newStart < 0) newStart = 0;
            if (newEnd - newStart < ACTUAL_MIN_DURATION) newStart = newEnd - ACTUAL_MIN_DURATION;
        } else if (dragState.current.type === 'resize-right') {
            newEnd += deltaMs;
            if (newEnd > durationMs) newEnd = durationMs;
            if (newEnd - newStart < ACTUAL_MIN_DURATION) newEnd = newStart + ACTUAL_MIN_DURATION;
        }

        // Ultimate safety guard locks
        if (newStart < 0) newStart = 0;
        if (newEnd > durationMs) newEnd = durationMs;
        if (newStart > newEnd) newStart = newEnd;

        currentSelection.current = { start: newStart, end: newEnd };
        if (onSelectionChange) {
            onSelectionChange(newStart, newEnd);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!dragState.current.isDragging) {
            // It was a click on the waveform itself (outside the box maybe?)
            if (containerRef.current && onSeek) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const newTime = (x / rect.width) * duration;
                onSeek(newTime);
            }
        } else {
            e.stopPropagation();
            if (onSelectionDragEnd) {
                onSelectionDragEnd(currentSelection.current.start, currentSelection.current.end);
            }
            dragState.current.isDragging = false;
            dragState.current.type = null;
            if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full select-none touch-none ${className}`}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Reference Track: Draggable/Resizable Yellow Overlay */}
            {isReference && durationMs > 0 && (
                <div
                    className="absolute top-0 bottom-0 bg-[#FACC15] mix-blend-screen"
                    style={{
                        left: `${startPct}%`,
                        width: `${endPct - startPct}%`,
                        opacity: 0.35 // Z-Index Visual Hierarchy requirement
                    }}
                >
                    {/* Drag Handle (Center) */}
                    <div
                        className="absolute inset-0 cursor-grab active:cursor-grabbing"
                        onPointerDown={(e) => handlePointerDown(e, 'move')}
                    />
                    {/* Edge Resizers (UX Requirement: col-resize) */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-3 cursor-col-resize -translate-x-1/2 z-10"
                        onPointerDown={(e) => handlePointerDown(e, 'resize-left')}
                    />
                    <div
                        className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize translate-x-1/2 z-10"
                        onPointerDown={(e) => handlePointerDown(e, 'resize-right')}
                    />

                    {/* Subtle border to frame the selection */}
                    <div className="absolute inset-y-0 left-0 w-px bg-[#FACC15] opacity-80 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-px bg-[#FACC15] opacity-80 pointer-events-none" />
                </div>
            )}

            {/* Result Track: Static Highlight Overlay */}
            {!isReference && highlightStartMs !== undefined && highlightEndMs !== undefined && durationMs > 0 && (
                <div
                    className="absolute top-0 bottom-0 bg-[#FACC15] mix-blend-screen pointer-events-none"
                    style={{
                        left: `${(highlightStartMs / durationMs) * 100}%`,
                        width: `${((highlightEndMs - highlightStartMs) / durationMs) * 100}%`,
                        opacity: 0.35
                    }}
                >
                    <div className="absolute inset-y-0 left-0 w-px bg-[#FACC15] opacity-50 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-px bg-[#FACC15] opacity-50 pointer-events-none" />
                </div>
            )}
        </div>
    );
}
