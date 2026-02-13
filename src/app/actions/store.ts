'use server'

import { createAdminClient } from '@/lib/db/admin-client';
import { S3Service } from '@/lib/services/s3';

export interface StoreTrack {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    duration: number;
    genre: string;
    coverImage?: string;
    lyrics?: string;
    src: string; // Default Signed URL
    availableTunings: Record<string, string>;
}

export async function getStoreTracks_Action(options?: {
    genres?: string[];
    moods?: string[];
    query?: string;
}): Promise<StoreTrack[]> {
    const supabase = createAdminClient();

    // 1. Fetch Active Tracks with their Files
    const queryBuilder = supabase
        .from('tracks')
        .select(`
      id,
      title,
      artist,
      status,
      bpm,
      duration_sec,
      genre,
      lyrics,
      cover_image_url,
      track_files (
        s3_key,
        file_type,
        tuning
      )
    `)
        .in('status', ['active', 'processing'])
        .order('created_at', { ascending: false });

    // Apply Filters
    if (options?.genres && options.genres.length > 0) {
        queryBuilder.in('genre', options.genres);
    }

    if (options?.query) {
        queryBuilder.ilike('title', `%${options.query}%`);
    }

    const { data: tracks, error } = await queryBuilder;

    if (error) {
        console.error('Store Fetch Error:', error);
        return [];
    }

    if (!tracks) return [];

    // 2. Generate Signed URLs for each track and its tunings
    const tracksWithUrls = await Promise.all(tracks.map(async (track) => {
        const availableTunings: Record<string, string> = {};
        let defaultSrc = '';

        // Generate signed URLs for all streamable files
        const files = (track.track_files as unknown as { file_type: string, s3_key: string, tuning: string }[]) || [];
        const streamFiles = files.filter((f) => f.file_type === 'stream_aac');
        
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

        // Fallback for defaultSrc if 440hz stream not found
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
            bpm: track.bpm || 0,
            duration: track.duration_sec || 0,
            genre: track.genre || 'Ambient',
            coverImage: track.cover_image_url || undefined,
            lyrics: track.lyrics || undefined,
            src: defaultSrc,
            availableTunings
        };
    }));

    return tracksWithUrls;
}
