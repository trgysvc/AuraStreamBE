'use server'

import { createClient } from '@/lib/db/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

/**
 * Updates comprehensive track metadata including the new Sonaraura Taxonomy.
 */
export async function updateTrackMetadata_Action(trackId: string, data: {
    title?: string;
    artist?: string;
    bpm?: number;
    key?: string;
    genre?: string;
    sub_genres?: string[];
    mood_tags?: string[];
    theme_tags?: string[];
    character_tags?: string[];
    venue_tags?: string[];
    vocal_type?: string;
    is_instrumental?: boolean;
    popularity_score?: number;
    lyrics?: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('tracks')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', trackId);

    if (error) {
        console.error('Metadata Update Error:', error);
        throw error;
    }

    revalidatePath('/admin/catalog');
    return { success: true };
}

/**
 * Permanently deletes a track and its associated file records.
 * Also cleans up any foreign key references (playback_sessions, playlist_items, likes, etc.)
 */
export async function deleteTrack_Action(trackId: string) {
    // We must use the service role key to bypass RLS policies.
    // Otherwise, an admin cannot delete playback_sessions or likes created by other users,
    // which then triggers a Postgres foreign key violation (23503) when deleting the track.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase environment variables');
    }

    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        }
    );

    // 1. Delete from playback_sessions (uses Admin client to bypass RLS)
    await supabaseAdmin.from('playback_sessions').delete().eq('track_id', trackId);

    // 2. Delete from playlist_items
    await supabaseAdmin.from('playlist_items').delete().eq('track_id', trackId);

    // 3. Delete from likes
    await supabaseAdmin.from('likes').delete().eq('track_id', trackId);

    // 4. Delete from track_reviews
    await supabaseAdmin.from('track_reviews').delete().eq('track_id', trackId);

    // 5. Delete from track_files (even though it has cascade, better to be explicit)
    await supabaseAdmin.from('track_files').delete().eq('track_id', trackId);

    // 6. Delete licenses (this will cascade to disputes if any)
    await supabaseAdmin.from('licenses').delete().eq('track_id', trackId);

    // 7. Nullify custom_requests (since delivery_track_id is nullable)
    await supabaseAdmin.from('custom_requests').update({ delivery_track_id: null } as any).eq('delivery_track_id', trackId);

    // 8. Finally delete the track itself
    const { error } = await supabaseAdmin
        .from('tracks')
        .delete()
        .eq('id', trackId);

    if (error) {
        console.error('Delete Track Error:', error);
        throw error;
    }

    revalidatePath('/admin/catalog');
    return { success: true };
}
