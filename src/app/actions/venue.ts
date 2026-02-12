'use server'

import { createAdminClient } from '@/lib/db/admin-client';
import { S3Service } from '@/lib/services/s3';

export interface VenueTrack {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    duration: number;
    genre: string;
    coverImage?: string;
    src: string;
    availableTunings: Record<string, string>;
    tags: string[];
}

export async function getVenueTracks_Action(options?: {
    bpmRange?: [number, number];
    moods?: string[];
    query?: string;
}): Promise<VenueTrack[]> {
    const supabase = createAdminClient();

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
            mood_tags,
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

    // Note: 'mood_tags' filtering might need specific logic if it's an array column or similar.
    // Assuming simple text search or intersection if Postgres array. 
    // For now, if moods are provided, we filter in memory or Use 'cs' (contains) if array
    if (options?.moods && options.moods.length > 0) {
        // Filter logic for array column:
        // queryBuilder = queryBuilder.contains('mood_tags', options.moods); 
        // Depending on how strict we want to be. 'overlaps' is &&
        queryBuilder = queryBuilder.overlaps('mood_tags', options.moods);
    }

    const { data: tracks, error } = await queryBuilder.limit(50); // Limit for performance

    if (error) {
        console.error('Venue Tracks Fetch Error:', error);
        return [];
    }

    // 3. Generate Signed URLs
    const tracksWithUrls = await Promise.all(tracks.map(async (track: any) => {
        const availableTunings: Record<string, string> = {};
        let defaultSrc = '';

        // Generate signed URLs for all streamable files
        const streamFiles = track.track_files.filter((f: any) => f.file_type === 'stream_aac' || f.file_type === 'stream_mp3');

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
            const rawFile = track.track_files.find((f: any) => f.file_type === 'raw');
            if (rawFile) {
                try {
                    defaultSrc = await S3Service.getDownloadUrl(rawFile.s3_key);
                } catch (e) { }
            }
        }

        return {
            id: track.id,
            title: track.title,
            artist: track.artist || 'AuraStream AI',
            bpm: track.bpm,
            duration: track.duration_sec || 0,
            genre: track.genre,
            coverImage: track.cover_image_url,
            src: defaultSrc,
            availableTunings,
            tags: track.mood_tags || [track.genre || "Music"]
        };
    }));

    return tracksWithUrls;
}
