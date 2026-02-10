'use server';

import { createClient } from '@/lib/db/server';
import { createAdminClient } from '@/lib/db/admin-client';

/**
 * Logs a search query for analytics and latency tracking
 */
export async function logSearchQuery_Action(query: string, filters: any, resultCount: number, latencyMs: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminClient = createAdminClient();
    
    await adminClient.from('search_logs').insert({
        user_id: user?.id || null,
        query_text: query,
        filters_used: filters,
        result_count: resultCount,
        latency_ms: latencyMs
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
