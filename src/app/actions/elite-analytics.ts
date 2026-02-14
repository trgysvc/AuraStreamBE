'use server';

import { createClient } from '@/lib/db/server';
import { createAdminClient } from '@/lib/db/admin-client';
import { headers } from 'next/headers';

/**
 * Logs a search query for analytics and latency tracking
 */
export async function logSearchQuery_Action(query: string, filters: Record<string, unknown>, resultCount: number, latencyMs: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Extract region from headers (Cloudflare/Vercel standard headers)
    const headerList = headers();
    const region = headerList.get('x-vercel-ip-country') || headerList.get('cf-ipcountry') || 'Unknown';

    const adminClient = createAdminClient();
    
    await adminClient.from('search_logs').insert({
        user_id: user?.id || null,
        query_text: query,
        filters_used: { ...filters, region },
        result_count: resultCount,
        latency_ms: latencyMs
    });
}

/**
 * Logs UI interactions for A/B testing and UI evolution
 */
export async function logUIInteraction_Action(elementId: string, actionType: string, metadata: Record<string, unknown> = {}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const adminClient = createAdminClient();
    
    // Using search_logs with a specific prefix for UI interactions to keep schema clean
    // but ideally, we should use a dedicated 'interaction_logs' table.
    await adminClient.from('search_logs').insert({
        user_id: user?.id || null,
        query_text: `UI_INTERACTION: ${elementId}`,
        filters_used: { action: actionType, ...metadata },
        latency_ms: 0,
        result_count: 1
    });
}

/**
 * Updates the user's YouTube Channel ID for whitelisting
 */
export async function updateYoutubeChannel_Action(channelId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('profiles')
        .update({ youtube_channel_id: channelId })
        .eq('id', user.id);

    if (error) throw error;
    return { success: true };
}
