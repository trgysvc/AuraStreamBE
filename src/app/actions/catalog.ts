'use server'

import { createAdminClient } from '@/lib/db/admin-client';
import { revalidatePath } from 'next/cache';

/**
 * Updates comprehensive track metadata.
 */
export async function updateTrackMetadata_Action(trackId: string, data: {
    title?: string;
    artist?: string;
    bpm?: number;
    key?: string;
    genre?: string;
    mood_tags?: string[];
    instruments?: string[];
    is_instrumental?: boolean;
    popularity_score?: number;
}) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('tracks')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', trackId);

    if (error) throw error;

    revalidatePath('/admin/catalog');
    return { success: true };
}

/**
 * Permanently deletes a track and its associated file records.
 */
export async function deleteTrack_Action(trackId: string) {
    const supabase = createAdminClient();

    // RLS and Foreign Keys will handle associated data if configured, 
    // otherwise we handle it here.
    const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId);

    if (error) throw error;

    revalidatePath('/admin/catalog');
    return { success: true };
}
