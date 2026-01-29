'use server'

import { createAdminClient } from '@/lib/db/admin-client';
import { QueueService } from '@/lib/queue/client';

export interface QCState {
    message?: string;
    error?: string;
    success?: boolean;
}

/**
 * Fetch tracks waiting for QC
 */
export async function getPendingTracks_Action() {
    // Use Admin Client to bypass RLS (Anon users can't see pending tracks)
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('status', 'pending_qc')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Fetch Error:', error);
        return [];
    }

    return data;
}

/**
 * Approve a track and send to processing pipeline
 */
export async function approveTrack_Action(trackId: string): Promise<QCState> {
    const supabase = createAdminClient();

    // 1. Update status in DB
    const { error } = await supabase
        .from('tracks')
        .update({ status: 'processing' })
        .eq('id', trackId);

    if (error) {
        return { error: 'Failed to update track status' };
    }

    // 2. Trigger SQS for processing
    try {
        await QueueService.triggerProcessing(trackId);
    } catch (err) {
        console.error('Queue Error:', err);
        // If queue fails, revert DB status (optimistic constraint)
        await supabase.from('tracks').update({ status: 'pending_qc' }).eq('id', trackId);
        return { error: 'Failed to queue processing job' };
    }

    return { success: true, message: 'Track approved and queued for processing.' };
}

/**
 * Reject a track
 */
export async function rejectTrack_Action(trackId: string, reason: string): Promise<QCState> {
    const supabase = createAdminClient();

    console.log('Rejecting track', trackId, 'Reason:', reason);

    const { error } = await supabase
        .from('tracks')
        .update({
            status: 'rejected',
        })
        .eq('id', trackId);

    if (error) {
        return { error: 'Failed to reject track' };
    }

    return { success: true, message: 'Track rejected.' };
}
