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
    venues?: string[];
    vibes?: string[];
    genres?: string[];
    moods?: string[]; // Legacy fallback
    query?: string;
    onlyLikedBy?: string;
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
        // Search across title, artist, and genre
        queryBuilder = queryBuilder.or(`title.ilike.%${options.query}%,artist.ilike.%${options.query}%,genre.ilike.%${options.query}%`);
    }

    if (options?.venues && options.venues.length > 0) {
        queryBuilder = queryBuilder.overlaps('venue_tags', options.venues);
    }

    if (options?.vibes && options.vibes.length > 0) {
        queryBuilder = queryBuilder.overlaps('vibe_tags', options.vibes);
    }

    if (options?.genres && options.genres.length > 0) {
        // Genres is a bit complex since track has string `genre` and string[] `sub_genres`.
        // A simple overlaps on sub_genres is easiest, or an 'in' for primary genre.
        // We'll use 'overlaps' on sub_genres and 'in' for genre using an OR condition.
        // Since Supabase RPC/Or is a bit complex to chain dynamically, we'll try IN on genre to start,
        // or a raw textSearch if needed.
        queryBuilder = queryBuilder.in('genre', options.genres);
    }

    if (options?.moods && options.moods.length > 0) {
        queryBuilder = queryBuilder.overlaps('mood_tags', options.moods);
    }

    if (options?.onlyLikedBy) {
        const { data: likedData } = await supabase
            .from('likes')
            .select('track_id')
            .eq('user_id', options.onlyLikedBy);

        const trackIds = likedData?.map(l => l.track_id) || [];
        if (trackIds.length > 0) {
            queryBuilder = queryBuilder.in('id', trackIds);
        } else {
            // If user has no likes, return empty
            return [];
        }
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

export async function getCurationCounts_Action(options?: {
    userId?: string;
}): Promise<Record<string, number>> {
    const supabase = await createClient();
    const counts: Record<string, number> = {};

    try {
        // 1. Total Active Tracks (Recommended)
        const { count: totalCount } = await supabase
            .from('tracks')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');
        counts['Recommended tracks'] = totalCount || 0;
        counts['Trending in Venues'] = Math.floor((totalCount || 0) * 0.8); // Pseudo trending

        // 2. User Likes
        if (options?.userId) {
            const { count: likesCount } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', options.userId);
            counts['Liked Songs'] = likesCount || 0;
        } else {
            counts['Liked Songs'] = 0;
        }

        // 3. Vibe Counts
        const vibeTags = ['Chill', 'Dark', 'Dreamy', 'Epic', 'Euphoric', 'Focus', 'Happy', 'Hopeful', 'Romantic', 'Relaxing', 'Suspense', 'Melancholic', 'Mysterious', 'Peaceful', 'Workout', 'Smooth', 'Quirky'];

        // We can do individual counts for vibes
        await Promise.all(vibeTags.map(async (vibe) => {
            const { count } = await supabase
                .from('tracks')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active')
                .overlaps('vibe_tags', [vibe]);
            counts[vibe] = count || 0;
        }));

        // 4. Specific Curation Titles (Mapping some titles to vibes or genres)
        const categoryMapping: Record<string, string> = {
            'Championships': 'Epic',
            'Sports & Action': 'Workout',
            'Valentine\'s Day': 'Romantic',
            'Morning Coffee': 'Relaxing',
            'Deep Focus': 'Focus',
            'Late Night Jazz': 'Jazz',
            'Golden Hour': 'Dreamy',
            'Techno Bunker': 'Dark',
            'Aura Classics': 'Legacy',
            'Global Beats': 'World',
            'Cinematic Vibe': 'Cinematic'
        };

        for (const [title, tag] of Object.entries(categoryMapping)) {
            if (['Jazz', 'Legacy', 'World', 'Cinematic'].includes(tag)) {
                // Genre-based
                const { count } = await supabase
                    .from('tracks')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'active')
                    .eq('genre', tag);
                counts[title] = count || 0;
            } else {
                // Vibe-based (already counted in vibetags, but we map the title)
                counts[title] = counts[tag] || 0;
            }
        }

        // Some manual/special tags
        counts["Can's Essentials"] = 24; // Hardcoded static for now as requested or until we have playlist support
        counts["Creator's Picks"] = 117; // Static fallback

    } catch (err) {
        console.error('Error fetching curation counts:', err);
    }

    return counts;
}
