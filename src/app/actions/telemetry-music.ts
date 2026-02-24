'use server'

import { createAdminClient } from '@/lib/db/admin-client';

/**
 * Fetches real-time music telemetry including streams, skips, and engagement.
 */
export async function getMusicTelemetry_Action() {
    const supabase = createAdminClient();

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
        // 1. Fetch Playback Sessions for last 24h and last 7 days
        const { data: recentSessions, error: sessionsError } = await supabase
            .from('playback_sessions')
            .select(`
                *,
                tracks (title, artist, genre, mood_tags)
            `)
            .gte('played_at', sevenDaysAgo.toISOString());

        if (sessionsError) throw sessionsError;

        // 2. Fetch Search Logs (24h)
        const { data: recentSearches, error: searchError } = await supabase
            .from('search_logs')
            .select('result_count, created_at')
            .gte('created_at', twentyFourHoursAgo.toISOString());

        if (searchError) throw searchError;

        // 3. Fetch Likes (7 days)
        const { data: recentLikes, error: likesError } = await supabase
            .from('likes')
            .select('created_at')
            .gte('created_at', sevenDaysAgo.toISOString());

        if (likesError) throw likesError;

        // --- KPI Calculations ---
        const sessions24h = recentSessions?.filter(s => new Date(s.played_at!) >= twentyFourHoursAgo) || [];
        const totalStreams24h = sessions24h.length;

        const skipped24h = sessions24h.filter(s => s.skipped || s.duration_listened < 10).length;
        const skipRate = totalStreams24h > 0 ? (skipped24h / totalStreams24h) * 100 : 0;

        const zeroResultSearches24h = recentSearches?.filter(r => r.result_count === 0).length || 0;

        // --- Top Mood / Genre (24h) ---
        const genreCounts: Record<string, number> = {};
        sessions24h.forEach(s => {
            const genre = s.tracks?.genre || 'Unknown';
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
        const topGenreEntry = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];
        const topGenre = topGenreEntry ? topGenreEntry[0] : 'None';

        const genrePopularity = Object.entries(genreCounts)
            .map(([name, plays]) => ({ name, plays }))
            .sort((a, b) => b.plays - a.plays)
            .slice(0, 5);

        // --- Skip Analytics (24h) ---
        const skipAnalyticsRaw: Record<string, { name: string, artist: string, skips: number, total: number }> = {};
        sessions24h.forEach(s => {
            if (!s.track_id) return;
            if (!skipAnalyticsRaw[s.track_id]) {
                skipAnalyticsRaw[s.track_id] = {
                    name: s.tracks?.title || 'Unknown',
                    artist: s.tracks?.artist || 'Unknown',
                    skips: 0,
                    total: 0
                };
            }
            skipAnalyticsRaw[s.track_id].total++;
            if (s.skipped || s.duration_listened < 10) {
                skipAnalyticsRaw[s.track_id].skips++;
            }
        });

        const highlySkippedTracks = Object.values(skipAnalyticsRaw)
            .map(t => ({
                name: t.name,
                artist: t.artist,
                count: t.skips,
                rate: `${((t.skips / t.total) * 100).toFixed(0)}%`
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // --- 7-Day Engagement Trends ---
        const engagementTrends = [];
        for (let i = 6; i >= 0; i--) {
            const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'short' });

            const dayStart = new Date(dayDate.setHours(0, 0, 0, 0));
            const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999));

            const dayStreams = recentSessions?.filter(s => {
                const d = new Date(s.played_at!);
                return d >= dayStart && d <= dayEnd;
            }).length || 0;

            const daySkips = recentSessions?.filter(s => {
                const d = new Date(s.played_at!);
                return (d >= dayStart && d <= dayEnd) && (s.skipped || s.duration_listened < 10);
            }).length || 0;

            const dayFaves = recentLikes?.filter(l => {
                const d = new Date(l.created_at!);
                return d >= dayStart && d <= dayEnd;
            }).length || 0;

            engagementTrends.push({
                day: dayLabel,
                streams: dayStreams,
                skips: daySkips,
                faves: dayFaves
            });
        }

        return {
            kpis: {
                totalStreams24h,
                skipRate: skipRate.toFixed(1),
                topGenre,
                zeroResultSearches24h
            },
            genrePopularity,
            highlySkippedTracks,
            engagementTrends
        };
    } catch (e) {
        console.error('Music Telemetry Error:', e);
        throw e;
    }
}
