'use server'

import { createAdminClient } from '@/lib/db/admin-client';

export interface Dispute {
    id: string;
    user_id: string;
    license_id: string;
    video_url: string;
    status: 'pending' | 'resolved' | 'rejected';
    dispute_text: string;
    created_at: string;
}

export async function createDispute_Action(data: {
    licenseId: string;
    videoUrl: string;
}) {
    const supabase = createAdminClient();
    
    // 1. Fetch license and track details to generate text
    const { data: license, error: lError } = await supabase
        .from('licenses')
        .select('*, tracks(*)')
        .eq('id', data.licenseId)
        .single();

    if (lError) throw lError;

    const disputeText = `
        I have a valid commercial license for the track "${license.tracks.title}" by "${license.tracks.artist}".
        License Key: ${license.license_key}
        Project Name: ${license.project_name}
        This video is covered under the Sonaraura Commercial License. Please release the claim.
    `.trim();

    // 2. Insert dispute record
    const { data: dispute, error: dError } = await supabase
        .from('disputes')
        .insert({
            user_id: license.user_id,
            license_id: data.licenseId,
            video_url: data.videoUrl,
            dispute_text: disputeText
        })
        .select()
        .single();

    if (dError) throw dError;

    return dispute as Dispute;
}

export async function getMyDisputes_Action() {
    const supabase = createAdminClient();
    // Assuming auth context is available or passing userId
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('disputes')
        .select('*, licenses(*, tracks(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}
