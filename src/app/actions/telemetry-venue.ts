'use server'

import { createAdminClient } from '@/lib/db/admin-client';

/**
 * Fetches B2B analytics for venues, including engagement and churn risk.
 */
export async function getVenueTelemetry_Action() {
    const supabase = createAdminClient();

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    try {
        // 1. Fetch All Venues and their Tenant info
        const { data: allVenues, error: venuesError } = await supabase
            .from('venues')
            .select(`
                id,
                business_name,
                tenant_id,
                tenants (
                    current_plan,
                    plan_status
                )
            `);

        if (venuesError) throw venuesError;

        // 2. Fetch Playback Sessions (Last 72h to detect churn risk)
        const { data: playbackData, error: playbackError } = await supabase
            .from('playback_sessions')
            .select('venue_id, played_at, duration_listened')
            .gte('played_at', seventyTwoHoursAgo.toISOString());

        if (playbackError) throw playbackError;

        // --- KPI Calculations ---
        const activeVenues24h = new Set(
            playbackData?.filter(s => new Date(s.played_at!) >= twentyFourHoursAgo).map(s => s.venue_id)
        ).size;

        const totalPlaytime24h = playbackData
            ?.filter(s => new Date(s.played_at!) >= twentyFourHoursAgo)
            .reduce((acc, curr) => acc + curr.duration_listened, 0) || 0;

        const avgDailyPlaytimeHours = activeVenues24h > 0 ? (totalPlaytime24h / activeVenues24h / 3600) : 0;

        // Map latest activity per venue
        const lastActiveMap: Record<string, string> = {};
        playbackData?.forEach(s => {
            const venueId = s.venue_id!;
            if (!lastActiveMap[venueId] || new Date(s.played_at!) > new Date(lastActiveMap[venueId])) {
                lastActiveMap[venueId] = s.played_at!;
            }
        });

        const atRiskCount = allVenues.filter(v => {
            const lastActive = lastActiveMap[v.id];
            return !lastActive || new Date(lastActive) < fortyEightHoursAgo;
        }).length;

        const activeSubs = allVenues.filter(v => {
            const tenant = Array.isArray(v.tenants) ? v.tenants[0] : v.tenants;
            return tenant?.plan_status === 'active';
        }).length;

        // --- Peak Operating Hours (Last 72h for sample size) ---
        const hourlyDistribution: Record<number, number> = {};
        for (let i = 0; i < 24; i++) hourlyDistribution[i] = 0;

        playbackData?.forEach(s => {
            const hour = new Date(s.played_at!).getHours();
            hourlyDistribution[hour]++;
        });

        const peakHours = Object.entries(hourlyDistribution).map(([hour, count]) => ({
            hour: `${hour.padStart(2, '0')}:00`,
            volume: count
        }));

        // --- Top Power Users (Last 7 Days - will fetch more for this) ---
        const { data: weekPlayback } = await supabase
            .from('playback_sessions')
            .select('venue_id, duration_listened')
            .gte('played_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const venuePlaytime: Record<string, number> = {};
        weekPlayback?.forEach(s => {
            const venueId = s.venue_id!;
            venuePlaytime[venueId] = (venuePlaytime[venueId] || 0) + s.duration_listened;
        });

        const topPowerUsers = Object.entries(venuePlaytime)
            .map(([id, duration]) => {
                const venue = allVenues.find(v => v.id === id);
                return {
                    name: venue?.business_name || 'Unknown Venue',
                    hours: (duration / 3600).toFixed(1),
                    raw: duration
                };
            })
            .sort((a, b) => b.raw - a.raw)
            .slice(0, 5);

        // --- Churn Risk Watchlist (48h - 72h inactivity) ---
        const churnWatchlist = allVenues
            .filter(v => {
                const lastActive = lastActiveMap[v.id];
                if (!lastActive) return true; // Never active
                const lastDate = new Date(lastActive);
                return lastDate < fortyEightHoursAgo;
            })
            .map(v => ({
                name: v.business_name,
                lastPlayed: lastActiveMap[v.id] ? new Date(lastActiveMap[v.id]).toLocaleDateString() : 'Never',
                status: 'High risk'
            }))
            .slice(0, 5);

        return {
            kpis: {
                activeVenues24h,
                avgDailyPlaytimeHours: avgDailyPlaytimeHours.toFixed(1),
                atRiskCount,
                activeSubs
            },
            peakHours,
            topPowerUsers,
            churnWatchlist
        };
    } catch (e) {
        console.error('Venue Telemetry Error:', e);
        throw e;
    }
}
