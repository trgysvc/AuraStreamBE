import { createClient } from '@supabase/supabase-js';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/trgysvc/Developer/AuraStreamBE/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sqsClient = new SQSClient({
    region: 'eu-central-1', // Force region for SQS
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function createTrackRecord_TEST(formData, s3Key) {
    const title = formData.get('title');
    const artist = formData.get('artist');
    const genre = formData.get('genre');
    const bpm = parseInt(formData.get('bpm'));
    const duration = parseInt(formData.get('duration'));

    // 0. Strict Duplicate Check
    const { data: existingTrack } = await supabase
        .from('tracks')
        .select('id')
        .eq('title', title)
        .eq('artist', artist || 'Sonaraura Studio')
        .maybeSingle();

    if (existingTrack) {
        return { message: 'Duplicate track detected', error: 'Duplicate', success: false };
    }

    // 1. Insert Track Record
    const { data: trackData, error: trackError } = await supabase.from('tracks').insert({
        title,
        artist: artist || 'Sonaraura Studio',
        bpm: bpm || 120,
        duration_sec: duration || 180,
        genre: genre || 'Ambient',
        status: 'processing',
        ai_metadata: { source: 'manual_upload_test' }
    }).select().single();

    if (trackError || !trackData) {
        return { message: 'Failed to save track record', error: trackError?.message || 'Empty track data response' };
    }

    // 2. Link Raw File to Track
    const { error: fileError } = await supabase.from('track_files').insert({
        track_id: trackData.id,
        file_type: 'raw',
        s3_key: s3Key,
        tuning: '440hz'
    });

    if (fileError) {
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
        console.error('SQS Queue Error (Expected in some tests):', sqsError.name);
        
        // SQS Fault Tolerance (Atomic Cleanup)
        await supabase.from('track_files').delete().eq('track_id', trackData.id);
        await supabase.from('tracks').delete().eq('id', trackData.id);
        
        return { 
            message: 'Queue Failure - Please Retry', 
            error: 'SQS Error', 
            success: false 
        };
    }

    return { message: 'Track uploaded successfully!', success: true, id: trackData.id };
}
