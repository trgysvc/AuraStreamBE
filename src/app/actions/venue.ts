'use server'

import { createClient } from '@/lib/db/server';
import { S3Service } from '@/lib/services/s3';

export interface VenueTrack {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    duration: number;
    genre: string;
    sub_genres: string[];
    character_tags: string[];
    theme_tags: string[];
    venue_tags: string[];
    vocal_type?: string;
    coverImage?: string;
    lyrics?: string;
    lyrics_synced?: any;
    src: string;
    availableTunings: Record<string, string>;
    tags: string[];
}

export async function getVenueTracks_Action(options?: {
    bpmRange?: [number, number];
    moods?: string[];
    query?: string;
}): Promise<VenueTrack[]> {
    const supabase = await createClient();

    // 1. Build Query
    let queryBuilder = supabase
        .from('tracks')
        .select(`
            id,
            title,
            artist,
            status,
            bpm,
            duration_sec,
            genre,
            sub_genres,
            character_tags,
            theme_tags,
            venue_tags,
            vocal_type,
            mood_tags,
            lyrics,
            lyrics_synced,
            cover_image_url,
            track_files (
                s3_key,
                file_type,
                tuning
            )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    // 2. Apply Filters
    if (options?.bpmRange) {
        queryBuilder = queryBuilder.gte('bpm', options.bpmRange[0]).lte('bpm', options.bpmRange[1]);
    }

    if (options?.query) {
        queryBuilder = queryBuilder.ilike('title', `%${options.query}%`);
    }

    if (options?.moods && options.moods.length > 0) {
        queryBuilder = queryBuilder.overlaps('mood_tags', options.moods);
    }

    const { data: tracks, error } = await queryBuilder.limit(50); // Limit for performance

    if (error) {
        console.error('Venue Tracks Fetch Error:', error);
        return [];
    }

    if (!tracks) return [];

    // 3. Generate Signed URLs
    const tracksWithUrls = await Promise.all(tracks.map(async (track) => {
        const availableTunings: Record<string, string> = {};
        let defaultSrc = '';

        // Generate signed URLs for all streamable files
        const files = (track.track_files as unknown as { file_type: string, s3_key: string, tuning: string }[]) || [];
        const streamFiles = files.filter((f) => f.file_type === 'stream_aac' || f.file_type === 'stream_mp3');

        for (const file of streamFiles) {
            try {
                const url = await S3Service.getDownloadUrl(file.s3_key);
                if (file.tuning) {
                    availableTunings[file.tuning] = url;
                    // Default to 440hz
                    if (file.tuning === '440hz') defaultSrc = url;
                }
            } catch (e) {
                console.error(`Failed to sign URL for file ${file.s3_key}`, e);
            }
        }

        // Fallback: If no 440hz stream, try any stream key or raw file
        if (!defaultSrc) {
            const anyStream = Object.values(availableTunings)[0];
            if (anyStream) defaultSrc = anyStream;
        }

        // Final Fallback: Raw file
        if (!defaultSrc) {
            const rawFile = files.find((f) => f.file_type === 'raw');
            if (rawFile) {
                try {
                    defaultSrc = await S3Service.getDownloadUrl(rawFile.s3_key);
                } catch { }
            }
        }

        // 4. Handle Cover Image Signing
        let finalCoverImage = track.cover_image_url;
        if (finalCoverImage && finalCoverImage.includes('amazonaws.com')) {
            try {
                // Extract key from URL: https://bucket.s3.region.amazonaws.com/KEY
                const urlParts = finalCoverImage.split('.com/');
                if (urlParts.length > 1) {
                    const s3Key = decodeURIComponent(urlParts[1]);
                    finalCoverImage = await S3Service.getDownloadUrl(s3Key, process.env.AWS_S3_BUCKET_RAW!);
                }
            } catch (e) {
                console.error("Failed to sign cover image URL", e);
            }
        }

        if (track.title === 'A Veiled Spotlight') {
            try {
                const fs = require('fs');
                const path = require('path');
                const logPath = path.join(process.cwd(), 'debug-venue.log');
                const logData = `[${new Date().toISOString()}] Track: ${track.title} (${track.id})\nFiles: ${JSON.stringify(files)}\nDefault Src: ${defaultSrc}\n\n`;
                fs.appendFileSync(logPath, logData);
            } catch (e) {
                console.error('Failed to log to file', e);
            }
        }

        return {
            id: track.id,
            title: track.title,
            artist: track.artist || 'Sonaraura AI',
            bpm: track.bpm || 120,
            duration: track.duration_sec || 0,
            genre: track.genre || 'Music',
            sub_genres: track.sub_genres || [],
            character_tags: track.character_tags || [],
            theme_tags: track.theme_tags || [],
            venue_tags: track.venue_tags || [],
            vocal_type: track.vocal_type || undefined,
            coverImage: finalCoverImage || undefined,
            lyrics: track.lyrics || undefined,
            lyrics_synced: track.lyrics_synced || undefined,
            src: defaultSrc,
            availableTunings,
            tags: track.mood_tags || [track.genre || "Music"]
        };
    }));

    return tracksWithUrls;
}
