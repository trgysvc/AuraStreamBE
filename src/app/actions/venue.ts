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

        return {
            id: track.id,
            title: track.title,
            artist: track.artist || 'Sonaraura AI',
            bpm: track.bpm || 120,
            duration: track.duration_sec || 0,
            genre: track.genre || 'Music',
            coverImage: track.cover_image_url || undefined,
            lyrics: track.lyrics || undefined,
            lyrics_synced: track.lyrics_synced || undefined,
            src: defaultSrc,
            availableTunings,
            tags: track.mood_tags || [track.genre || "Music"]
        };
    }));

    return tracksWithUrls;
}
