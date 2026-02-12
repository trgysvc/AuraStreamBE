'use server';

import { createAdminClient } from '@/lib/db/admin-client';
import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';

export async function getTenantAction() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // If profile doesn't exist yet (unlikely with trigger, but possible), or is missing tenant_id
    if (!profile) {
        // Force create profile via admin client if something went wrong with trigger
        const adminClient = createAdminClient();
        const { data: newProfile } = await adminClient.from('profiles').upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name
        }).select().single();
        profile = newProfile;
    }

    if (!profile?.tenant_id) {
        const adminClient = createAdminClient();

        // 1. Check if user already owns a tenant that isn't linked
        let { data: tenant } = await adminClient
            .from('tenants')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (!tenant) {
            // 2. Create new tenant
            const { data: newTenant } = await adminClient
                .from('tenants')
                .insert({
                    owner_id: user.id,
                    display_name: profile?.full_name || 'My Workspace',
                    current_plan: 'free',
                    plan_status: 'active'
                })
                .select()
                .single();
            tenant = newTenant;
        }

        // 3. Link profile to tenant (only if tenant creation succeeded)
        if (tenant && profile) {
            await adminClient
                .from('profiles')
                .update({ tenant_id: tenant.id })
                .eq('id', user.id);

            profile.tenant_id = tenant.id;
        }

        return { profile, tenant };
    }

    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

    return { profile, tenant };
}

export async function updateTenantAction(formData: any) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single();

        const adminClient = createAdminClient();

        // 1. Update Profile (Personal Info)
        const profileUpdate: any = {};
        if (formData.full_name !== undefined) profileUpdate.full_name = formData.full_name;
        if (formData.avatar_url !== undefined) profileUpdate.avatar_url = formData.avatar_url;

        if (Object.keys(profileUpdate).length > 0) {
            await adminClient
                .from('profiles')
                .update(profileUpdate)
                .eq('id', user.id);
        }

        // 2. Update or Create Tenant
        const tenantData: any = {
            legal_name: formData.legal_name,
            display_name: formData.display_name,
            industry: formData.industry,
            website: formData.website,
            tax_office: formData.tax_office,
            vkn: formData.vkn,
            billing_address: formData.billing_address,
            invoice_email: formData.invoice_email,
            phone: formData.phone,
            authorized_person_name: formData.authorized_person_name,
            authorized_person_phone: formData.authorized_person_phone,
            brand_color: formData.brand_color,
            volume_limit: formData.volume_limit,
            logo_url: formData.logo_url
        };

        // Filter out undefined/null values to allow partial updates
        const cleanTenantData = Object.fromEntries(
            Object.entries(tenantData).filter(([_, v]) => v !== undefined && v !== null)
        );

        if (!profile?.tenant_id) {
            // Create new tenant if not exists
            const { data: newTenant, error: createError } = await adminClient
                .from('tenants')
                .insert({
                    owner_id: user.id,
                    ...cleanTenantData
                })
                .select()
                .single();

            if (createError) throw createError;

            // Link profile to tenant
            await adminClient
                .from('profiles')
                .update({ tenant_id: newTenant.id })
                .eq('id', user.id);
        } else {
            // Update existing tenant
            if (Object.keys(cleanTenantData).length > 0) {
                const { error: updateError } = await adminClient
                    .from('tenants')
                    .update(cleanTenantData)
                    .eq('id', profile.tenant_id);

                if (updateError) throw updateError;
            }
        }
    } catch (error: any) {
        console.error("UpdateTenantAction Error:", error);
        throw error;
    }

    revalidatePath('/account');
}

export async function getBillingHistoryAction() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) return [];

    const { data: history } = await supabase
        .from('billing_history')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

    return history || [];
}
