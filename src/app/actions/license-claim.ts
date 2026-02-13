'use server';

import { createClient } from '@/lib/db/server';
import { createAdminClient } from '@/lib/db/admin-client';
import crypto from 'crypto';

/**
 * Allows active subscribers to generate a license record for a specific project
 */
export async function claimLicense_Action(trackId: string, projectName: string, usageType: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // 1. Check Subscription Tier & Role
    const { data: profile } = await supabase.from('profiles').select('subscription_tier, role').eq('id', user.id).single();
    
    if (!profile || (profile.subscription_tier === 'free' && profile.role !== 'admin')) {
        throw new Error('Active subscription required to claim licenses.');
    }

    const adminClient = createAdminClient();

    // 2. Generate Unique License
    const licenseKey = `AS-SUBS-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    const { data, error } = await adminClient
        .from('licenses')
        .insert({
            track_id: trackId,
            user_id: user.id,
            project_name: projectName || 'Subscribed Project',
            usage_type: usageType as any,
            license_key: licenseKey,
            price_paid: 0, // Subscription covered
            platform_id: `subscription:${user.id}:${Date.now()}`
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}
