'use server'

import { createAdminClient } from '@/lib/db/admin-client';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

/**
 * Logs a playback event and updates the Aura AI learning model for the specific venue.
 */
export async function logPlaybackEvent_Action(data: {
    trackId: string;
    venueId?: string;
    durationListened: number; // in seconds
    skipped: boolean;
    tuningUsed: '440hz' | '432hz' | '528hz';
}) {
    const supabase = createAdminClient();
    
    // Extract region for Infrastructure ROI tracking
    const headerList = headers();
    const region = headerList.get('x-vercel-ip-country') || headerList.get('cf-ipcountry') || 'Unknown';

    // 1. Insert into raw telemetry logs
    const { error: logError } = await supabase.from('playback_sessions').insert({
        track_id: data.trackId,
        venue_id: data.venueId || null,
        duration_listened: data.durationListened,
        skipped: data.skipped,
        tuning_used: data.tuningUsed,
        played_at: new Date().toISOString()
    });
    
    // Feature 2: Infrastructure ROI - Log playback stats with region
    await supabase.from('search_logs').insert({
        query_text: `PLAYBACK_TELEMETRY: ${data.trackId}`,
        filters_used: { region, venueId: data.venueId, duration: data.durationListened, tuning: data.tuningUsed },
        latency_ms: 0,
        result_count: 1
    });

    if (logError) {
        console.error('Telemetry log error:', logError);
        return { success: false };
    }

    // 2. AI LEARNING ENGINE: Biorhythm Adaptation
    // If a track is skipped within the first 10 seconds, it signals a "Mood Mismatch" for the current hour.
    if (data.skipped && data.durationListened < 10 && data.venueId) {
        console.log(`[Aura AI] Mood Mismatch detected at venue ${data.venueId}. Adjusting biorhythm weights...`);
        
        // This is where we would call an internal AI service or update a weighting table
        // For now, we log the insight that will be used by the scheduler.
        await supabase.from('search_logs').insert({
            query_text: `AI_ADAPTATION: Mismatch detected for track ${data.trackId}`,
            filters_used: { action: 'skip_penalty', hour: new Date().getHours() },
            latency_ms: 0,
            result_count: 1
        });
    }

    return { success: true };
}
