'use server';

import { createClient } from '@/lib/db/server';
import { createAdminClient } from '@/lib/db/admin-client';
import { PDFService } from '@/lib/services/license/pdf';

export async function generateLicensePDF_Action(licenseId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();
    const { data: license, error } = await adminClient
        .from('licenses')
        .select(`
            *,
            profiles!licenses_user_id_fkey (full_name, email),
            tracks!licenses_track_id_fkey (title, artist)
        `)
        .eq('id', licenseId)
        .eq('user_id', user.id)
        .single();

    if (error || !license) throw new Error('License not found');

    const pdfBytes = await PDFService.generateLicensePDF({
        licenseKey: license.license_key,
        projectName: license.project_name,
        userName: (license.profiles as any).full_name || (license.profiles as any).email,
        trackTitle: (license.tracks as any).title,
        artistName: (license.tracks as any).artist,
        usageType: license.usage_type,
        createdAt: license.created_at || ''
    });

    // Return as Base64 to be handled by the client
    return Buffer.from(pdfBytes).toString('base64');
}
