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
    src: string; // Signed URL
}

export async function getStoreTracks_Action(options?: {
    genres?: string[];
    moods?: string[];
    query?: string;
}): Promise<StoreTrack[]> {
    const supabase = createAdminClient();

    // 1. Fetch Active Tracks with their Files
    let query = supabase
        .from('tracks')
        .select(`
      id,
      title,
      artist,
      status,
      bpm,
      duration_sec,
      genre,
      cover_image_url,
      track_files (
        s3_key,
        file_type
      )
    `)
        .in('status', ['active', 'processing'])
        .order('created_at', { ascending: false });

    // Apply Filters
    if (options?.genres && options.genres.length > 0) {
        query = query.in('genre', options.genres);
    }

    if (options?.query) {
        query = query.ilike('title', `%${options.query}%`);
    }

    // Note: Moods filtering would go here if we had a moods column or junction table


    const { data: tracks, error } = await query;

    if (error) {
        console.error('Store Fetch Error:', error);
        return [];
    }

    // 2. Generate Signed URLs for each track
    const tracksWithUrls = await Promise.all(tracks.map(async (track: any) => {
        // Find the audio file (prefer stream_aac, fallback to raw)
        const audioFile = track.track_files.find((f: any) => f.file_type === 'stream_aac')
            || track.track_files.find((f: any) => f.file_type === 'raw');

        let signedUrl = '';
        if (audioFile) {
            try {
                // Generate a 1-hour signed URL for playback
                signedUrl = await S3Service.getDownloadUrl(audioFile.s3_key);
            } catch (e) {
                console.error(`Failed to sign URL for track ${track.id}`, e);
            }
        }

        return {
            id: track.id,
            title: track.title,
            artist: track.artist || 'AuraStream Artist',
            bpm: track.bpm,
            duration: track.duration_sec,
            genre: track.genre,
            coverImage: track.cover_image_url,
            src: signedUrl
        };
    }));

    return tracksWithUrls;
}
