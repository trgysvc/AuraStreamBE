'use server'

import { S3Service } from '@/lib/services/s3';
import { createAdminClient } from '@/lib/db/admin-client';
import { v4 as uuidv4 } from 'uuid';

export interface UploadState {
    message: string;
    error?: string;
    success?: boolean;
}

/**
 * 1. Get Signed URL for S3 Upload
 */
export async function getSignedUploadUrl_Action(contentType: string, fileName: string) {
    // Config Validation
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_S3_BUCKET_RAW) {
        throw new Error('Server configuration error: AWS keys missing');
    }

    // Generate unique file path: raw/{uuid}/{filename}
    const fileId = uuidv4();
    const key = `raw/${fileId}/${fileName}`;

    try {
        const url = await S3Service.getUploadUrl(key, contentType, process.env.AWS_S3_BUCKET_RAW);
        return { url, key, fileId };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('S3 Signing Error:', errorMessage);
        throw new Error('Failed to generate upload URL');
    }
}

/**
 * 2. Create Track Record in Database
 */
export async function createTrackRecord_Action(formData: FormData, s3Key: string): Promise<UploadState> {
    // Use Admin Client to bypass RLS during insert
    const supabase = createAdminClient();

    const title = formData.get('title') as string;
    const genre = formData.get('genre') as string;
    const bpm = parseInt(formData.get('bpm') as string);
    const duration = parseInt(formData.get('duration') as string);

    // Validation
    if (!title || !s3Key) {
        return { message: 'Missing required fields', error: 'Validation Error' };
    }

    const { data: trackData, error: trackError } = await supabase.from('tracks').insert({
        title,
        bpm,
        duration_sec: duration,
        genre,
        status: 'pending_qc',
        ai_metadata: { source: 'manual_upload' }
    }).select().single();

    if (trackError) {
        console.error('DB Insert Error (Track):', trackError);
        return { message: 'Failed to save track record', error: trackError.message };
    }

    // 4. Link File to Track
    const { error: fileError } = await supabase.from('track_files').insert({
        track_id: trackData.id,
        file_type: 'raw', // Initial raw upload
        s3_key: s3Key,
        tuning: '440hz'
    });

    if (fileError) {
        console.error('DB Insert Error (File):', fileError);
        return { message: 'Failed to link file to track', error: fileError.message };
    }

    return { message: 'Track uploaded successfully!', success: true };
}
