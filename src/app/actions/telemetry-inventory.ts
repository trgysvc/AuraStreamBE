'use server'

import { createAdminClient } from '@/lib/db/admin-client';

export interface CatalogStats {
    totalTracks: number;
    totalDurationSec: number;
    formattedTotalDuration: string;
    genreDistribution: { name: string, duration: number, formatted: string }[];
    venueDistribution: { name: string, duration: number, formatted: string }[];
    vibeDistribution: { name: string, duration: number, formatted: string }[];
}

/**
 * Fetches consolidated catalog statistics for inventory management.
 */
export async function getCatalogStats_Action(): Promise<CatalogStats> {
    const supabase = createAdminClient();

    try {
        // Fetch all tracks with relevant columns
        // Note: For larger catalogs, this should be moved to a Postgres RPC/View
        const { data: tracks, error } = await supabase
            .from('tracks')
            .select('duration_sec, genre, venue_tags, vibe_tags')
            .eq('status', 'active');

        if (error) throw error;

        let totalTracks = 0;
        let totalDurationSec = 0;
        const genres: Record<string, number> = {};
        const venues: Record<string, number> = {};
        const vibes: Record<string, number> = {};

        tracks?.forEach(track => {
            totalTracks++;
            totalDurationSec += (track.duration_sec || 0);

            // Genre
            const genre = track.genre || 'Unknown';
            genres[genre] = (genres[genre] || 0) + (track.duration_sec || 0);

            // Venues (Array)
            if (Array.isArray(track.venue_tags)) {
                track.venue_tags.forEach((v: string) => {
                    venues[v] = (venues[v] || 0) + (track.duration_sec || 0);
                });
            }

            // Vibes (Array)
            if (Array.isArray(track.vibe_tags)) {
                track.vibe_tags.forEach((v: string) => {
                    vibes[v] = (vibes[v] || 0) + (track.duration_sec || 0);
                });
            }
        });

        const formatDuration = (seconds: number) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            return h > 0 ? `${h}h ${m}m` : `${m}m`;
        };

        return {
            totalTracks,
            totalDurationSec,
            formattedTotalDuration: formatDuration(totalDurationSec),
            genreDistribution: Object.entries(genres)
                .map(([name, duration]) => ({ name, duration, formatted: formatDuration(duration) }))
                .sort((a, b) => b.duration - a.duration),
            venueDistribution: Object.entries(venues)
                .map(([name, duration]) => ({ name, duration, formatted: formatDuration(duration) }))
                .sort((a, b) => b.duration - a.duration),
            vibeDistribution: Object.entries(vibes)
                .map(([name, duration]) => ({ name, duration, formatted: formatDuration(duration) }))
                .sort((a, b) => b.duration - a.duration)
        };
    } catch (e) {
        console.error('Catalog Stats Error:', e);
        throw e;
    }
}
