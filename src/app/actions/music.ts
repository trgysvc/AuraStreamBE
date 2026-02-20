'use server'

import { createAdminClient } from '@/lib/db/admin-client';

export async function searchTracks_Action(query: string, limit: number = 20) {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('tracks')
        .select('id, title, artist, duration_sec, cover_image_url')
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
        .limit(limit)
        .order('popularity_score', { ascending: false });

    if (error) {
        console.error('Error searching tracks:', error);
        return [];
    }

    return data;
}
