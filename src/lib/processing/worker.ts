
import { sqsClient } from '@/lib/queue/client';
import { ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { createAdminClient } from '@/lib/db/admin-client';
import { FFmpegService } from './ffmpeg'; 
import { S3Service } from '@/lib/services/s3';
import path from 'path';
import fs from 'fs';
import os from 'os';

const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL!;

export async function startWorker() {
    console.log('Sonaraura Worker started. Listening for high-fidelity audio jobs...');

    while (true) {
        try {
            const command = new ReceiveMessageCommand({
                QueueUrl: QUEUE_URL,
                MaxNumberOfMessages: 1,
                WaitTimeSeconds: 20, // Long polling
            });

            const response = await sqsClient.send(command);

            if (response.Messages && response.Messages.length > 0) {
                const message = response.Messages[0];
                const body = JSON.parse(message.Body || '{}');

                if (body.action === 'PROCESS_TRACK' && body.trackId) {
                    console.log(`[JOB] Processing track: ${body.trackId}`);
                    await processTrackJob(body.trackId);
                }

                await sqsClient.send(new DeleteMessageCommand({
                    QueueUrl: QUEUE_URL,
                    ReceiptHandle: message.ReceiptHandle,
                }));
            }
        } catch (error) {
            console.error('[ERROR] Worker polling error:', error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

async function processTrackJob(trackId: string) {
    const supabase = createAdminClient();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `sonaraura-${trackId}-`));

    try {
        // 1. Get Track and Raw File Info
        const { data: track, error: trackError } = await supabase.from('tracks').select('*').eq('id', trackId).single();
        if (trackError || !track) throw new Error(`Track not found: ${trackId}`);

        const { data: rawFile, error: fileError } = await supabase
            .from('track_files')
            .select('*')
            .eq('track_id', trackId)
            .eq('file_type', 'raw')
            .single();

        if (fileError || !rawFile) throw new Error(`Raw file not found for track: ${trackId}`);

        // Update status to processing
        await supabase.from('tracks').update({ status: 'processing' }).eq('id', trackId);

        // 2. Download Raw File
        const rawLocalPath = path.join(tempDir, 'raw_input');
        console.log(`-> Downloading raw file from S3: ${rawFile.s3_key}`);
        await S3Service.downloadToTemp(rawFile.s3_key, S3Service.buckets.raw!, rawLocalPath);

        // 3. Process High-Fidelity Versions
        const tunings = [
            { id: '440hz', ratio: 1.0 },
            { id: '432hz', ratio: 432 / 440 },
            { id: '528hz', ratio: 528 / 440 }
        ] as const;

        for (const tuning of tunings) {
            const fileName = `${tuning.id}.m4a`;
            const localPath = path.join(tempDir, fileName);
            const s3Key = `processed/${trackId}/${fileName}`;

            console.log(`-> Generating ${tuning.id} version (Ratio: ${tuning.ratio.toFixed(4)})...`);
            
            await FFmpegService.transcode(rawLocalPath, localPath, {
                pitchRatio: tuning.ratio,
                normalize: true,
                bitrate: '256k'
            });

            console.log(`-> Uploading ${tuning.id} to ${S3Service.buckets.processed}...`);
            await S3Service.uploadFromPath(localPath, s3Key, S3Service.buckets.processed!, 'audio/mp4');

            // 4. Record in Database
            await supabase.from('track_files').insert({
                track_id: trackId,
                file_type: 'stream_aac',
                tuning: tuning.id,
                s3_key: s3Key,
                bitrate: 256
            });
        }

        // 5. Finalize Track
        await supabase.from('tracks').update({
            status: 'active',
            updated_at: new Date().toISOString()
        }).eq('id', trackId);

        console.log(`[SUCCESS] Track ${trackId} is now active in all frequencies.`);

    } catch (error) {
        console.error(`[FAILURE] Job processing failed for ${trackId}:`, error);
        await supabase.from('tracks').update({ status: 'rejected' }).eq('id', trackId);
    } finally {
        // Cleanup temp files
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.error('Failed to cleanup temp dir:', e);
        }
    }
}
