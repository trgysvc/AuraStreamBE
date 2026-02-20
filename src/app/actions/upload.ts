'use server'

import { S3Service } from '@/lib/services/s3';
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
 * 1. Get Signed URL for S3 Upload (Works for Audio and Images)
 */
export async function getSignedUploadUrl_Action(contentType: string, fileName: string, prefix: string = 'raw') {
    const supabaseServer = createServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data: profile } = await supabaseServer
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'creator')) {
        throw new Error('Access denied');
    }

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_S3_BUCKET_RAW) {
        throw new Error('Server configuration error');
    }

    const fileId = uuidv4();
    const key = `${prefix}/${fileId}/${fileName}`;

    try {
        const url = await S3Service.getUploadUrl(key, contentType, process.env.AWS_S3_BUCKET_RAW);
        return { url, key, fileId };
    } catch (error: unknown) {
        console.error('S3 Signing Error:', error);
        throw new Error('Failed to generate upload URL');
    }
}

/**
 * 2. Create Track Record in Database & Trigger Processing
 */
export async function createTrackRecord_Action(formData: FormData, s3Key: string): Promise<UploadState> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { message: 'Unauthorized', error: 'Auth Error' };

    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const genre = formData.get('genre') as string;
    const bpm = parseInt(formData.get('bpm') as string);
    const duration = parseInt(formData.get('duration') as string);
    const coverUrl = formData.get('cover_url') as string;
    const lyrics = formData.get('lyrics') as string;

    if (!title || !s3Key) {
        return { message: 'Missing required fields', error: 'Validation Error' };
    }

    // 1. Insert Track Record
    const { data: trackData, error: trackError } = await supabase.from('tracks').insert({
        title,
        artist: artist || 'Sonaraura AI',
        bpm: bpm || 120,
        duration_sec: duration || 180,
        genre: genre || 'Ambient',
        cover_image_url: coverUrl,
        lyrics: lyrics || null,
        status: 'pending_qc',
        ai_metadata: {
            source: 'manual_upload',
            uploader_id: user.id
        }
    } as any).select().single() as any;

    if (trackError) {
        console.error('DB Insert Error (Track):', trackError);
        return { message: 'Failed to save track record', error: trackError.message };
    }

    // 2. Link Raw File to Track
    await supabase.from('track_files').insert({
        track_id: trackData.id,
        file_type: 'raw',
        s3_key: s3Key,
        tuning: '440hz'
    } as any);

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
    }

    return { message: 'Track uploaded successfully!', success: true };
}
