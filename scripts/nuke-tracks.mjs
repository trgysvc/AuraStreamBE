
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');

const env = {};
if (fs.existsSync(envPath)) {
    const file = fs.readFileSync(envPath, 'utf-8');
    file.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim();
    });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const s3Client = new S3Client({
    region: env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

async function emptyBucket(bucketName) {
    if (!bucketName) return;
    console.log(`--- Emptying S3 Bucket: ${bucketName} ---`);
    try {
        let isTruncated = true;
        let cursor;

        while (isTruncated) {
            const listCommand = new ListObjectsV2Command({
                Bucket: bucketName,
                ContinuationToken: cursor,
            });
            const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(listCommand);

            if (Contents && Contents.length > 0) {
                const deleteParams = {
                    Bucket: bucketName,
                    Delete: { Objects: Contents.map(({ Key }) => ({ Key })) },
                };
                await s3Client.send(new DeleteObjectsCommand(deleteParams));
                console.log(` Deleted ${Contents.length} objects.`);
            }

            isTruncated = IsTruncated;
            cursor = NextContinuationToken;
        }
    } catch (err) {
        console.error(` Error emptying bucket ${bucketName}:`, err.message);
    }
}

async function nukeTracks() {
    console.log('--- CRITICAL: SONARAURA TRACK WIPE STARTED ---');

    // 1. Empty S3 Buckets
    await emptyBucket(env.AWS_S3_BUCKET_RAW);
    await emptyBucket(env.AWS_S3_BUCKET_PROCESSED);

    // 2. Clear Database (Reverse Order of Constraints)
    console.log('--- Clearing Database Tables ---');
    try {
        console.log(' Deleting playlist_tracks...');
        await supabase.from('playlist_tracks').delete().neq('id', '00000000-1111-2222-3333-444444444444');

        console.log(' Deleting licenses...');
        await supabase.from('licenses').delete().neq('id', '00000000-1111-2222-3333-444444444444');

        // Clear Telemetry & Logs first
        console.log(' Deleting playback_sessions...');
        await supabase.from('playback_sessions').delete().neq('id', '00000000-1111-2222-3333-444444444444'); // dummy check to bypass empty filter if needed

        console.log(' Deleting search_logs...');
        await supabase.from('search_logs').delete().neq('id', '00000000-1111-2222-3333-444444444444');

        console.log(' Deleting track_files...');
        await supabase.from('track_files').delete().neq('id', '00000000-1111-2222-3333-444444444444');

        console.log(' Deleting tracks...');
        const { error: tracksError } = await supabase.from('tracks').delete().neq('id', '00000000-1111-2222-3333-444444444444');

        if (tracksError) throw tracksError;

        console.log('✅ Database and S3 Wipe Complete.');
    } catch (err) {
        console.error('❌ Wipe Failed:', err.message);
    }
}

nukeTracks();
