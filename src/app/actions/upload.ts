'use server'

import { S3Service } from '@/lib/services/s3';
import { createAdminClient } from '@/lib/db/admin-client';
import { createClient as createServerClient } from '@/lib/db/server';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '@/lib/queue/client';
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
    // 0. Security Check
    const supabaseServer = createServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Check if user has creator or admin role
    const { data: profile } = await supabaseServer
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'creator')) {
        throw new Error('Access denied: You must be a creator or admin to upload tracks.');
    }

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
 * 2. Create Track Record in Database & Trigger Processing
 */
export async function createTrackRecord_Action(formData: FormData, s3Key: string): Promise<UploadState> {
    // 0. Security Check
    const supabaseServer = createServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
        return { message: 'Unauthorized', error: 'Auth Error' };
    }

    // Check if user has creator or admin role
    const { data: profile } = await supabaseServer
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'creator')) {
        return { message: 'Access denied', error: 'Role Error' };
    }

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

    // 1. Insert Track Record
    const { data: trackData, error: trackError } = await supabase.from('tracks').insert({
        title,
        bpm,
        duration_sec: duration,
        genre,
        status: 'pending_qc',
        ai_metadata: { 
            source: 'manual_upload',
            uploader_id: user.id
        }
    }).select().single();

    if (trackError) {
        console.error('DB Insert Error (Track):', trackError);
        return { message: 'Failed to save track record', error: trackError.message };
    }

    // 2. Link Raw File to Track
    const { error: fileError } = await supabase.from('track_files').insert({
        track_id: trackData.id,
        file_type: 'raw',
        s3_key: s3Key,
        tuning: '440hz'
    });

    if (fileError) {
        console.error('DB Insert Error (File):', fileError);
        return { message: 'Failed to link file to track', error: fileError.message };
    }

    // 3. Trigger Worker via SQS
    try {
        await sqsClient.send(new SendMessageCommand({
            QueueUrl: process.env.AWS_SQS_QUEUE_URL,
            MessageBody: JSON.stringify({
                action: 'PROCESS_TRACK',
                trackId: trackData.id
            })
        }));
    } catch (sqsError) {
        console.error('SQS Queue Error:', sqsError);
        // Track exists, but processing didn't trigger. 
        // Admin can manually trigger from dashboard later.
    }

    return { message: 'Track uploaded successfully! Processing started.', success: true };
}