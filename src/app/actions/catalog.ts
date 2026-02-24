'use server'

import { createClient } from '@/lib/db/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { AITaxonomyService } from '@/lib/services/ai-taxonomy';

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
    vibe_tags?: string[];
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

/**
 * Automatically predicts and applies taxonomy tags to a track based on its metadata.
 */
export async function autoTagTrack_Action(trackId: string) {
    const supabase = await createClient();

    // 1. Fetch current metadata
    const { data: track, error: fetchError } = await supabase
        .from('tracks')
        .select('title, artist, genre, sub_genres')
        .eq('id', trackId)
        .single();

    if (fetchError || !track) {
        console.error('AutoTag Fetch Error:', fetchError);
        throw new Error('Track not found');
    }

    // 2. Predict Tags
    const predictions = AITaxonomyService.predictTags({
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Sonaraura Studio',
        genre: track.genre || 'Ambient',
        sub_genres: track.sub_genres || []
    });

    // 3. Update Track
    const { error: updateError } = await supabase
        .from('tracks')
        .update({
            vibe_tags: predictions.vibe_tags,
            theme_tags: predictions.theme_tags,
            character_tags: predictions.character_tags,
            venue_tags: predictions.venue_tags,
            sub_genres: predictions.sub_genres,
            updated_at: new Date().toISOString()
        })
        .eq('id', trackId);

    if (updateError) {
        console.error('AutoTag Update Error:', updateError);
        throw updateError;
    }

    revalidatePath('/admin/catalog');
    return { success: true, predictions };
}

/**
 * Bulk updates the entire active catalog using the AI Ingestion Engine.
 * Only tags tracks that are missing taxonomy data (theme, character, vibe, venue).
 */
export async function batchAutoTagTracks_Action() {
    const supabase = await createClient();

    // 1. Fetch all active tracks
    const { data: tracks, error: fetchError } = await supabase
        .from('tracks')
        .select('id, title, artist, genre, sub_genres')
        .eq('status', 'active');

    if (fetchError || !tracks) {
        console.error('Batch AutoTag Fetch Error:', fetchError);
        throw new Error('Could not fetch catalog');
    }

    console.log(`Starting Batch AI Tagging for ${tracks.length} tracks...`);

    const results = {
        total: tracks.length,
        updated: 0,
        errors: 0
    };

    // 2. Process in batches or parallel
    await Promise.all(tracks.map(async (track) => {
        try {
            const predictions = AITaxonomyService.predictTags({
                title: track.title || 'Unknown',
                artist: track.artist || 'Sonaraura Studio',
                genre: track.genre || 'Ambient',
                sub_genres: track.sub_genres || []
            });

            const { error: updateError } = await supabase
                .from('tracks')
                .update({
                    vibe_tags: predictions.vibe_tags,
                    theme_tags: predictions.theme_tags,
                    character_tags: predictions.character_tags,
                    venue_tags: predictions.venue_tags,
                    sub_genres: predictions.sub_genres,
                    updated_at: new Date().toISOString()
                })
                .eq('id', track.id);

            if (updateError) throw updateError;
            results.updated++;
        } catch (e) {
            console.error(`Error auto-tagging track ${track.id}:`, e);
            results.errors++;
        }
    }));

    revalidatePath('/admin/catalog');
    return { success: true, results };
}

/**
 * One-time action to migrate existing tracks with 'turgaysavaci' artist
 * to the new 'Sonaraura Studio' branding for corporate consistency.
 */
export async function fixBranding_Action() {
    const supabase = await createClient();

    const { error, count } = await supabase
        .from('tracks')
        .update({ artist: 'Sonaraura Studio' })
        .eq('artist', 'turgaysavaci');

    if (error) {
        console.error('Branding Fix Error:', error);
        throw error;
    }

    revalidatePath('/admin/catalog');
    revalidatePath('/dashboard/venue');
    return { success: true, count };
}
