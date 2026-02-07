'use server';

import { createClient } from '@/lib/db/server';
import { createAdminClient } from '@/lib/db/admin-client';
import { S3Service } from '@/lib/services/s3';

export async function getDownloadUrlBySession(sessionId: string) {
    // 1. Authenticate User
    const supabaseUser = createClient();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
        throw new Error('User must be logged in to download');
    }

    if (!sessionId) {
        throw new Error('Session ID is required');
    }

    // 2. Verify License Ownership
    // We need to find a license that matches the session ID (platform_id) AND the user ID.
    // Platform ID format is "stripe:{SESSION_ID}"
    const supabaseAdmin = createAdminClient();

    // Note: platform_id could be exact match `stripe:sess_...` or just contain it. 
    // Our webhook stores it as `stripe:{session.id}`.
    const platformId = `stripe:${sessionId}`;

    const { data: license, error: licenseError } = await supabaseAdmin
        .from('licenses')
        .select(`
            id,
            track_id,
            user_id,
            project_name,
            tracks (
                id,
                title,
                artist,
                track_files (
                    s3_key,
                    file_type
                )
            )
        `)
        .eq('user_id', user.id) // Enforce ownership
        .eq('platform_id', platformId)
        .single();

    if (licenseError || !license) {
        console.error('Download Logic: License not found or access denied', licenseError);
        throw new Error('License not found or access denied');
    }

    const track = license.tracks as any;
    if (!track || !track.track_files || track.track_files.length === 0) {
        throw new Error('Track files not available');
    }

    // 3. Select Best Quality File
    // Priority: 'wav' > 'mp3' > 'stream_aac' > 'raw'
    // Adjust file_type checks based on your actual enum/values in DB
    const files = track.track_files;
    let targetFile = files.find((f: any) => f.file_type === 'wav')
        || files.find((f: any) => f.file_type === 'mp3')
        || files.find((f: any) => f.file_type === 'stream_aac') // Fallback
        || files.find((f: any) => f.file_type === 'raw'); // Ultimate fallback

    if (!targetFile) {
        throw new Error('No suitable download file found');
    }

    // 4. Generate Secure URL
    // Format filename: "Artist - Title.ext"
    // Extension logic:
    let ext = 'mp3'; // default
    if (targetFile.file_type === 'wav') ext = 'wav';
    else if (targetFile.file_type === 'stream_aac') ext = 'm4a'; // or aac
    // If raw, we might need to guess or check the key extension

    // Sanitize filename
    const safeTitle = (track.title || 'Untitled').replace(/[^a-z0-9]/gi, '_');
    const safeArtist = (track.artist || 'Unknown').replace(/[^a-z0-9]/gi, '_');
    const filename = `${safeArtist} - ${safeTitle}.${ext}`;

    try {
        const url = await S3Service.getDownloadUrl(targetFile.s3_key, process.env.AWS_S3_BUCKET_PROCESSED, {
            responseContentDisposition: `attachment; filename="${filename}"`
        });

        return { url, filename };
    } catch (err) {
        console.error('S3 Sign Error:', err);
        throw new Error('Failed to generate download link');
    }
}
