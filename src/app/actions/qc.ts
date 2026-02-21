'use server'

import { createClient } from '@/lib/db/server';
import { searchClient } from '@/lib/search/client';
import { revalidatePath } from 'next/cache';
import { S3Service } from '@/lib/services/s3';

/**
 * Approves a track, makes it live in the catalog and syncs to Meilisearch.
 */
export async function approveTrack_Action(trackId: string) {
    const supabase = await createClient();

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
    }

    revalidatePath('/admin/qc');
    revalidatePath('/admin/catalog');
    revalidatePath('/dashboard/venue');

    return { success: true };
}

/**
 * Rejects and Purges a track (Deletes from DB and S3)
 */
export async function rejectTrack_Action(trackId: string) {
    const supabase = await createClient();

    // 1. Get associated files from S3 before deleting records
    const { data: files } = await supabase
        .from('track_files')
        .select('s3_key')
        .eq('track_id', trackId);

    // 2. Delete from S3
    if (files && files.length > 0) {
        for (const file of files) {
            try {
                await S3Service.deleteFile(file.s3_key, process.env.AWS_S3_BUCKET_RAW!);
            } catch (e) {
                console.error(`S3 Deletion failed for ${file.s3_key}:`, e);
            }
        }
    }

    // 3. Delete from Database (Cascades to track_files and others)
    const { error } = await supabase
        .from('tracks')
        .delete()
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
    lyrics?: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('tracks')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', trackId);

    if (error) throw error;

    revalidatePath('/admin/qc');
    return { success: true };
}
