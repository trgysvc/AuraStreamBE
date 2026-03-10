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
    metadata?: any;
}

/**
 * Helper to map DB track to VenueTrack and ensure it's serializable for Server Actions
 */
async function mapTrackToVenueTrack(track: any): Promise<VenueTrack> {
    const availableTunings: Record<string, string> = {};
    let defaultSrc = '';

    // Track files logic
    const files = (track.track_files as unknown as { file_type: string, s3_key: string, tuning: string }[]) || [];
    const streamFiles = files.filter((f) => f.file_type === 'stream_aac' || f.file_type === 'stream_mp3');

    for (const file of streamFiles) {
        try {
            const url = await S3Service.getDownloadUrl(file.s3_key);
            if (file.tuning) {
                availableTunings[file.tuning] = url;
                if (file.tuning === '440hz') defaultSrc = url;
            }
        } catch (e) {
            console.error(`[venue] Failed to sign URL for file ${file.s3_key}:`, e);
        }
    }

    if (!defaultSrc) {
        const anyStream = Object.values(availableTunings)[0];
        if (anyStream) defaultSrc = anyStream;
    }

    if (!defaultSrc) {
        const rawFile = files.find((f) => f.file_type === 'raw');
        if (rawFile) {
            try {
                defaultSrc = await S3Service.getDownloadUrl(rawFile.s3_key);
            } catch { }
        }
    }

    // Cover image signing
    let finalCoverImage = track.cover_image_url;
    if (finalCoverImage && finalCoverImage.includes('amazonaws.com')) {
        try {
            const urlParts = finalCoverImage.split('.com/');
            if (urlParts.length > 1) {
                const s3Key = decodeURIComponent(urlParts[1]);
                finalCoverImage = await S3Service.getDownloadUrl(s3Key, process.env.AWS_S3_BUCKET_RAW!);
            }
        } catch (e) {
            console.error(`[venue] Failed to sign cover image for ${track.id}:`, e);
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
        lyrics_synced: track.lyrics_synced ? JSON.parse(JSON.stringify(track.lyrics_synced)) : undefined,
        src: defaultSrc,
        availableTunings,
        tags: track.mood_tags || [track.genre || "Music"],
        metadata: track.metadata ? JSON.parse(JSON.stringify(track.metadata)) : undefined
    };
}

export async function getVenueTracks_Action(options?: {
    bpmRange?: [number, number];
    venues?: string[];
    vibes?: string[];
    genres?: string[];
    moods?: string[]; // Legacy fallback
    query?: string;
    onlyLikedBy?: string;
    userId?: string;
    timeOfDay?: string[];
}): Promise<VenueTrack[]> {
    try {
        const supabase = await createClient();

        // 1. Build Base Query helper
        const buildBaseQuery = () => {
            let q = supabase
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
                    metadata,
                    track_files (
                        s3_key,
                        file_type,
                        tuning
                    )
                `)
                .eq('status', 'active');

            // Apply Filters
            if (options?.bpmRange) {
                q = q.or(`and(bpm.gte.${options.bpmRange[0]},bpm.lte.${options.bpmRange[1]}),bpm.is.null,bpm.eq.0`);
            }
            if (options?.query) {
                q = q.or(`title.ilike.%${options.query}%,artist.ilike.%${options.query}%,genre.ilike.%${options.query}%,album.ilike.%${options.query}%`);
            }
            if (options?.venues && options.venues.length > 0) {
                q = q.overlaps('venue_tags', options.venues);
            }
            if (options?.vibes && options.vibes.length > 0) {
                q = q.overlaps('vibe_tags', options.vibes);
            }
            if (options?.genres && options.genres.length > 0) {
                q = q.in('genre', options.genres);
            }
            if (options?.moods && options.moods.length > 0) {
                q = q.overlaps('mood_tags', options.moods);
            }
            if (options?.timeOfDay && options.timeOfDay.length > 0) {
                q = q.contains('metadata', { time_of_day: options.timeOfDay });
            }
            return q;
        };

        let tracks: any[] = [];
        let error: any = null;

        if (options?.onlyLikedBy) {
            const { data: likedData } = await supabase
                .from('likes')
                .select('track_id')
                .eq('user_id', options.onlyLikedBy);

            const trackIds = likedData?.map(l => l.track_id) || [];
            if (trackIds.length > 0) {
                const { data, error: qErr } = await buildBaseQuery().in('id', trackIds).limit(50);
                tracks = data || [];
                error = qErr;
            }
        }
        else if (options?.userId && !options.query) {
            const { data: playData } = await supabase
                .from('playback_sessions')
                .select('track_id')
                .eq('venue_id', options.userId)
                .order('played_at', { ascending: false })
                .limit(500);

            const allPlayedIds = playData?.map(p => p.track_id) || [];
            const frequencyMap: Record<string, number> = {};
            for (const id of allPlayedIds) {
                frequencyMap[id] = (frequencyMap[id] || 0) + 1;
            }

            const topPlayedIds = Object.entries(frequencyMap)
                .sort((a, b) => b[1] - a[1])
                .map(entry => entry[0])
                .slice(0, 25);

            let popularTracks: any[] = [];
            let unheardTracks: any[] = [];

            if (topPlayedIds.length > 0) {
                const { data: pData } = await buildBaseQuery().in('id', topPlayedIds);
                popularTracks = pData || [];
            }

            const slotsNeeded = 50 - popularTracks.length;
            let unheardQuery = buildBaseQuery()
                .order('created_at', { ascending: false })
                .limit(slotsNeeded > 0 ? slotsNeeded : 0);

            const uniquePlayedIds = Object.keys(frequencyMap);
            if (uniquePlayedIds.length > 0) {
                unheardQuery = unheardQuery.not('id', 'in', `(${uniquePlayedIds.slice(0, 50).join(',')})`);
            }

            const { data: uData, error: uErr } = await unheardQuery;
            unheardTracks = uData || [];
            error = uErr;

            const combined = [...popularTracks, ...unheardTracks];
            const uniqueCombined = Array.from(new Map(combined.map(item => [item['id'], item])).values());

            for (let i = uniqueCombined.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [uniqueCombined[i], uniqueCombined[j]] = [uniqueCombined[j], uniqueCombined[i]];
            }
            tracks = uniqueCombined;
        }
        else {
            const { data, error: qErr } = await buildBaseQuery()
                .order('created_at', { ascending: false })
                .limit(50);
            tracks = data || [];
            error = qErr;
        }

        if (error) {
            console.error('[venue] Tracks Fetch Error:', error);
            return [];
        }

        if (!tracks) return [];

        return await Promise.all(tracks.map(t => mapTrackToVenueTrack(t)));
    } catch (criticalErr) {
        console.error('[venue] Critical error in getVenueTracks_Action:', criticalErr);
        return [];
    }
}

export async function getTrendingTracks_Action(): Promise<VenueTrack[]> {
    try {
        const supabase = await createClient();

        // First, get the most played track IDs
        const { data: trendingData, error: trendingError } = await supabase
            .from('playback_sessions')
            .select('track_id')
            .order('played_at', { ascending: false })
            .limit(100);

        if (trendingError) {
            console.error('[trending] Error fetching trending IDs:', trendingError);
            return [];
        }

        const freq: Record<string, number> = {};
        trendingData?.forEach(p => {
            freq[p.track_id] = (freq[p.track_id] || 0) + 1;
        });

        const topIds = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(e => e[0]);

        if (topIds.length < 5) {
            const { data: latestTracks } = await supabase
                .from('tracks')
                .select('id')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(50);
            topIds.push(...(latestTracks?.map(t => t.id) || []));
        }

        const { data: tracks, error: tracksError } = await supabase
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
                metadata,
                track_files (
                    s3_key,
                    file_type,
                    tuning
                )
            `)
            .in('id', Array.from(new Set(topIds)).slice(0, 50))
            .eq('status', 'active');

        if (tracksError || !tracks) {
            console.error('[trending] Error fetching track details:', tracksError);
            return [];
        }

        const sortedTracks = topIds
            .map(id => tracks.find(t => t.id === id))
            .filter((t): t is typeof tracks[0] => !!t);

        return await Promise.all(sortedTracks.map(t => mapTrackToVenueTrack(t)));
    } catch (criticalErr) {
        console.error('[trending] Critical error:', criticalErr);
        return [];
    }
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
            'Showroom / Gallery': 'Venue_Showroom',
            'Global Beats': 'World',
            'Lobby': 'Hotel Lobby',
            'The Roastery': 'Coffee Shop'
        };

        // Album-based counts
        const albumQueries = [
            { title: "L'Opera del Caffè", album: "L'Opera del Caffè" }
        ];
        for (const aq of albumQueries) {
            const { count } = await supabase
                .from('tracks')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active')
                .eq('album', aq.album);
            counts[aq.title] = count || 0;
        }

        // Custom Artist / Query Counts
        const customQueries = [
            { title: "Can's Essentials", column: 'artist', match: 'sayonaramuse' },
            { title: "Velvet & Fire Album", column: 'title', match: 'Velvet & Fire', isIlike: true }
        ];

        for (const cq of customQueries) {
            let q = supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'active');
            if (cq.isIlike) {
                q = q.ilike(cq.column, `%${cq.match}%`);
            } else {
                q = q.eq(cq.column, cq.match);
            }
            const { count } = await q;
            counts[cq.title] = count || 0;
        }

        for (const [title, tag] of Object.entries(categoryMapping)) {
            if (['Jazz', 'Legacy', 'World', 'Cinematic'].includes(tag)) {
                // Genre-based
                const { count } = await supabase
                    .from('tracks')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'active')
                    .eq('genre', tag);
                counts[title] = count || 0;
            } else if (tag === 'Hotel Lobby' || tag === 'Coffee Shop' || tag === 'Venue_Showroom') {
                // Venue-based
                const overlapsTags = tag === 'Venue_Showroom' ? ['Showroom / Gallery'] : [tag];
                const { count } = await supabase
                    .from('tracks')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'active')
                    .overlaps('venue_tags', overlapsTags);
                counts[title] = count || 0;
            } else {
                // Vibe-based (already counted in vibetags, but we map the title)
                counts[title] = counts[tag] || 0;
            }
        }

        // Some manual/special tags
        counts["Creator's Picks"] = 117; // Static fallback

    } catch (err) {
        console.error('Error fetching curation counts:', err);
    }

    return counts;
}
