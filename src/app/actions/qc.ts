'use server'

import { createAdminClient } from '@/lib/db/admin-client';
import { searchClient } from '@/lib/search/client';
import { revalidatePath } from 'next/cache';

/**
 * Approves a track, makes it live in the catalog and syncs to Meilisearch.
 */
export async function approveTrack_Action(trackId: string) {
    const supabase = createAdminClient();

    // 1. Update status in DB
    const { data: track, error } = await supabase
        .from('tracks')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', trackId)
        .select()
        .single();

    if (error) throw error;

    // 2. Sync to Meilisearch for instant discovery
    try {
        const index = searchClient.index('tracks');
        await index.addDocuments([{
            id: track.id,
            title: track.title,
            artist: track.artist,
            bpm: track.bpm,
            genre: track.genre,
            mood_tags: track.mood_tags,
            duration_sec: track.duration_sec,
            popularity_score: track.popularity_score
        }]);
    } catch (e) {
        console.error('Meilisearch Sync Error during approval:', e);
        // We don't throw here to ensure the DB state is preserved, 
        // but a background sync worker should pick this up.
    }

    revalidatePath('/admin/qc');
    revalidatePath('/admin/catalog');
    revalidatePath('/dashboard/venue');
    
    return { success: true };
}

/**
 * Rejects a track and marks it as rejected. 
 * Actual file deletion from S3 can be handled by a cleanup worker to avoid UI lag.
 */
export async function rejectTrack_Action(trackId: string) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('tracks')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', trackId);

    if (error) throw error;

    revalidatePath('/admin/qc');
    return { success: true };
}

/**
 * Updates track metadata during QC.
 */
export async function updateTrackQC_Action(trackId: string, data: {
    title?: string;
    artist?: string;
    bpm?: number;
    key?: string;
    mood_tags?: string[];
}) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('tracks')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', trackId);

    if (error) throw error;

    revalidatePath('/admin/qc');
    return { success: true };
}
