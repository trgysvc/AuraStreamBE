'use server'

import { createAdminClient } from '@/lib/db/admin-client';
import { revalidatePath } from 'next/cache';

/**
 * Updates a custom music request status and sets final pricing.
 */
export async function updateRequestStatus_Action(
    requestId: string, 
    status: 'pending' | 'processing' | 'review' | 'completed' | 'rejected', 
    price?: number
) {
    const supabase = createAdminClient();

    interface UpdatePayload {
        status: string;
        updated_at: string;
        price_paid?: number;
    }

    const updateData: UpdatePayload = { status, updated_at: new Date().toISOString() };
    if (price) updateData.price_paid = price;

    const { error } = await supabase
        .from('custom_requests')
        .update(updateData)
        .eq('id', requestId);

    if (error) throw error;

    revalidatePath('/admin/requests');
    return { success: true };
}

/**
 * Adds admin notes to a custom request.
 */
export async function updateRequestNotes_Action(requestId: string, notes: string) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('custom_requests')
        .update({ admin_notes: notes, updated_at: new Date().toISOString() })
        .eq('id', requestId);

    if (error) throw error;

    revalidatePath('/admin/requests');
    return { success: true };
}
