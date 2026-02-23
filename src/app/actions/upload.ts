'use server'

import { S3Service } from '@/lib/services/s3';
import { createClient as createServerClient } from '@/lib/db/server';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from '@/lib/queue/client';
import { AITaxonomyService } from '@/lib/services/ai-taxonomy';
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
    const supabaseServer = await createServerClient();
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
    const supabase = await createServerClient();
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

    // AI Auto-Tagging Prediction
    const aiTags = AITaxonomyService.predictTags({
        title,
        artist: artist || 'Sonaraura AI',
        genre: genre || 'Ambient'
    });

    // 1. Insert Track Record
    const { data: trackData, error: trackError } = await supabase.from('tracks').insert({
        title,
        artist: artist || 'Sonaraura AI',
        bpm: bpm || 120,
        duration_sec: duration || 180,
        genre: genre || 'Ambient',
        sub_genres: aiTags.sub_genres,
        vibe_tags: aiTags.vibe_tags,
        theme_tags: aiTags.theme_tags,
        character_tags: aiTags.character_tags,
        venue_tags: aiTags.venue_tags,
        cover_image_url: coverUrl,
        lyrics: lyrics || null,
        status: 'pending_qc',
        ai_metadata: {
            source: 'manual_upload',
            uploader_id: user.id
        }
    } as any).select().single() as any;

    if (trackError || !trackData) {
        console.error('DB Insert Error (Track):', trackError);
        return { message: 'Failed to save track record', error: trackError?.message || 'Empty track data response' };
    }

    // 2. Link Raw File to Track
    const { error: fileError } = await supabase.from('track_files').insert({
        track_id: trackData.id,
        file_type: 'raw',
        s3_key: s3Key,
        tuning: '440hz'
    } as any);

    if (fileError) {
        console.error('DB Insert Error (File Association):', fileError);
        // Atomic Cleanup: Delete the track record if file association fails
        await supabase.from('tracks').delete().eq('id', trackData.id);
        return { message: 'Failed to associate audio file', error: fileError.message };
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
        // We don't return an error here as the DB records are already saved
    }

    return { message: 'Track uploaded successfully!', success: true };
}
