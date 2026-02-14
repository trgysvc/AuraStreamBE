'use server'

import { createAdminClient } from '@/lib/db/admin-client';

export async function getTelemetryData_Action() {
    const supabase = createAdminClient();

    try {
        // 1. Fetch Playback Sessions (Last 100)
        const { data: playbackSessions } = await supabase
            .from('playback_sessions')
            .select(`
                *,
                tracks (title)
            `)
            .order('played_at', { ascending: false })
            .limit(100);

        // 2. Fetch Search Logs (Last 100)
        const { data: searchLogs } = await supabase
            .from('search_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        // 3. Aggregate Stats
        const totalPlays = playbackSessions?.length || 0;
        const totalSkips = playbackSessions?.filter(s => s.skipped).length || 0;
        const skipRate = totalPlays > 0 ? (totalSkips / totalPlays) * 100 : 0;
        
        const tuningStats = {
            '440hz': playbackSessions?.filter(s => s.tuning_used === '440hz').length || 0,
            '432hz': playbackSessions?.filter(s => s.tuning_used === '432hz').length || 0,
            '528hz': playbackSessions?.filter(s => s.tuning_used === '528hz').length || 0,
        };

        const regionStats: Record<string, number> = {};
        playbackSessions?.forEach(s => {
            const reg = s.region || 'Unknown';
            regionStats[reg] = (regionStats[reg] || 0) + 1;
        });

        return {
            playbackSessions: playbackSessions || [],
            searchLogs: searchLogs || [],
            summary: {
                totalPlays,
                skipRate: skipRate.toFixed(1),
                tuningStats,
                regionStats
            }
        };
    } catch (e) {
        console.error('Telemetry Fetch Error:', e);
        throw e;
    }
}
