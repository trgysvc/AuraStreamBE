'use server'

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';

export async function createVenue_Action(data: {
    tenant_id: string;
    business_name: string;
    city?: string;
    description?: string;
    mood_tags?: string[];
}) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: venue, error } = await supabase
        .from('venues')
        .insert({
            tenant_id: data.tenant_id,
            owner_id: user.id,
            business_name: data.business_name,
            name: data.business_name, // Sync name and business_name
            city: data.city || 'Standard',
            verification_status: 'verified' as any, // Auto-verify for enterprise-added venues
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

export async function updateStaffRole_Action(userId: string, role: string, locationId?: string | null) {
    const supabase = createClient();

    const { error } = await supabase
        .from('profiles')
        .update({
            role: role as any,
            location_id: locationId,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) throw error;

    revalidatePath('/dashboard/enterprise/staff');
    return { success: true };
}
