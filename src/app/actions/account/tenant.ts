'use server'

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';

/**
 * Interface for Tenant Identity
 */
export interface TenantIdentity {
    legal_name?: string;
    display_name?: string;
    industry?: string;
    website?: string;
    logo_url?: string;
    brand_color?: string;
    volume_limit?: number;
}

/**
 * Fetches the current user's profile and linked tenant.
 * Uses the server client for secure server-side fetching.
 */
export async function getMyProfileWithTenant_Action() {
    const supabase = await createClient();

    // 1. Get Session User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    // 2. Fetch Profile with joined Tenant
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            tenants (*)
        `)
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Profile fetch error:', error);
        return null;
    }

    return data;
}

/**
 * Updates the current user's tenant identity.
 * Restricted by RLS.
 */
export async function updateTenantIdentity_Action(tenantId: string, formData: TenantIdentity) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tenants')
        .update({
            legal_name: formData.legal_name,
            display_name: formData.display_name,
            industry: formData.industry,
            website: formData.website,
            logo_url: formData.logo_url,
            brand_color: formData.brand_color,
            volume_limit: formData.volume_limit,
            updated_at: new Date().toISOString()
        })
        .eq('id', tenantId)
        .select()
        .single();

    if (error) {
        console.error('Tenant update error:', error);
        throw new Error(error.message);
    }

    revalidatePath('/account');
    return data;
}

/**
 * Admin Only: Verifies a venue's commercial status.
 * Now using the authenticated client; RLS allows this for 'admin' or 'enterprise_admin' roles.
 */
export async function adminVerifyVenue_Action(venueId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('venues')
        .update({
            verification_status: 'verified' as any,
            updated_at: new Date().toISOString()
        })
        .eq('id', venueId);

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true };
}

/**
 * Onboards a new venue under a tenant.
 */
export async function createVenue_Action(venueData: {
    business_name: string;
    address_line1?: string;
    city?: string;
    country?: string;
    tenant_id: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('venues')
        .insert({
            ...venueData,
            owner_id: user.id,
            verification_status: 'pending' as any
        })
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/dashboard/venue');
    return data;
}
