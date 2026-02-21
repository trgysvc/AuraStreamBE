'use server'

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';

/**
 * Verifies a commercial venue.
 */
export async function verifyVenue_Action(venueId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('venues')
        .update({ verification_status: 'verified', updated_at: new Date().toISOString() } as any)
        .eq('id', venueId);

    if (error) throw error;

    revalidatePath('/admin/users');
    revalidatePath('/admin');
    return { success: true };
}

/**
 * Manually updates a user's subscription tier.
 */
export async function updateUserTier_Action(userId: string, tier: 'free' | 'pro' | 'business' | 'enterprise') {
    const supabase = await createClient();

    const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) throw error;

    revalidatePath('/admin/users');
    return { success: true };
}

/**
 * Bans or suspends a user profile.
 */
export async function toggleUserStatus_Action(userId: string, isBanned: boolean) {
    // This could involve setting a 'is_banned' flag or similar in profiles.
    // For now, let's assume we update a role or specific status field.
    const supabase = await createClient();

    const { error } = await supabase
        .from('profiles')
        .update({ role: isBanned ? 'creator' : 'creator', updated_at: new Date().toISOString() }) // Placeholder logic
        .eq('id', userId);

    if (error) throw error;

    revalidatePath('/admin/users');
    return { success: true };
}
