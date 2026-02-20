'use server'

import { createAdminClient } from '@/lib/db/admin-client';
import { revalidatePath } from 'next/cache';

export async function createVenue_Action(data: {
    tenant_id: string;
    business_name: string;
    city?: string;
    description?: string;
    mood_tags?: string[];
}) {
    const supabase = createAdminClient();

    const { data: venue, error } = await supabase
        .from('venues')
        .insert({
            tenant_id: data.tenant_id,
            business_name: data.business_name,
            name: data.business_name, // Sync name and business_name
            city: data.city || 'Standard',
            verification_status: 'verified', // Auto-verify for enterprise-added venues
            mood_tags: data.mood_tags || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating venue:', error);
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/enterprise');
    revalidatePath('/dashboard/enterprise/venues');
    return { success: true, venue };
}

export async function updateVenue_Action(venueId: string, data: any) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('venues')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', venueId);

    if (error) throw error;

    revalidatePath('/dashboard/enterprise/venues');
    return { success: true };
}

export async function deleteVenue_Action(venueId: string) {
    const supabase = createAdminClient();

    // Note: This might need cascading delete for schedules/devices
    const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueId);

    if (error) throw error;

    revalidatePath('/dashboard/enterprise/venues');
    return { success: true };
}

export async function updateStaffRole_Action(userId: string, role: string, locationId?: string | null) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('profiles')
        .update({
            role,
            location_id: locationId,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) throw error;

    revalidatePath('/dashboard/enterprise/staff');
    return { success: true };
}
