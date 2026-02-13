'use server'

import { createClient } from '@/lib/db/server';
import { S3Service } from '@/lib/services/s3';
import { PDFService } from '@/lib/services/license/pdf';

/**
 * Interface for Download Bundle
 */
export interface DownloadBundle {
    audioUrl: string;
    licensePdfUrl: string;
    trackTitle: string;
}

/**
 * Orchestrates the download process
 */
export async function getDownloadBundle_Action(trackId: string, licenseId: string): Promise<DownloadBundle | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Verify License exists for this user and track
    const { data: license, error: lError } = await supabase
        .from('licenses')
        .select(`
            *,
            tracks (*)
        `)
        .eq('id', licenseId)
        .eq('track_id', trackId)
        .eq('user_id', user.id)
        .single();

    if (lError || !license) {
        console.error('License verification failed for download');
        return null;
    }

    const track = (license as unknown as { tracks: { title: string, artist: string } }).tracks;

    // 2. Fetch Audio File (HQ Raw or high-bitrate MP3)
    const { data: file } = await supabase
        .from('track_files')
        .select('s3_key')
        .eq('track_id', trackId)
        .eq('file_type', 'raw') 
        .single();

    if (!file) return null;

    // 3. Generate License PDF
    await PDFService.generateLicensePDF({
        licenseKey: license.license_key,
        projectName: license.project_name,
        userName: user.user_metadata?.full_name || user.email || 'Sonaraura User',
        trackTitle: track.title,
        artistName: track.artist,
        usageType: license.usage_type,
        createdAt: license.created_at
    });

    // 6. Get Signed URLs
    const audioUrl = await S3Service.getDownloadUrl(file.s3_key);

    return {
        audioUrl,
        licensePdfUrl: audioUrl, 
        trackTitle: track.title
    };
}

/**
 * Temporary fallback for Stripe sessions
 */
export async function getDownloadUrlBySession(sessionId: string) {
    console.log('Fetching download for session:', sessionId);
    // Logic to find license associated with stripe session
    return { url: 'https://placeholder.com/download' };
}
