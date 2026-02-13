
import { createClient } from '@supabase/supabase-js';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const envPath = './.env.local';
const env = {};
if (fs.existsSync(envPath)) {
    const file = fs.readFileSync(envPath, 'utf-8');
    file.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim();
    });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const s3 = new S3Client({ 
    region: env.AWS_REGION || 'us-east-1', 
    credentials: { 
        accessKeyId: env.AWS_ACCESS_KEY_ID, 
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY 
    } 
});

async function reconnectAssets() {
    console.log('--- Aura Recovery System: Reconnecting orphaned S3 masters (v2) ---');

    // 1. List all processed files on S3
    const s3Res = await s3.send(new ListObjectsV2Command({ Bucket: env.AWS_S3_BUCKET_RAW }));
    const s3Keys = s3Res.Contents?.map(c => c.Key) || [];

    const processedKeys = s3Keys.filter(k => k?.startsWith('processed/'));

    for (const key of processedKeys) {
        if (!key) continue;
        const parts = key.split('/');
        if (parts.length < 3) continue;

        const trackId = parts[1];
        console.log(`Processing recovery for Track: ${trackId}`);

        // 2. Delete ALL existing file pointers for this track to avoid duplicates/constraints
        await supabase.from('track_files').delete().eq('track_id', trackId);

        // 3. Insert the fresh processed pointer
        const { error } = await supabase.from('track_files').insert({
            track_id: trackId,
            file_type: 'raw',
            s3_key: key,
            tuning: '440hz'
        });

        if (error) {
            console.error(` Failed to link ${trackId}:`, error.message);
        } else {
            console.log(` Successfully linked ${trackId} to master: ${key}`);
            
            // 4. Update track status to active if it was stuck
            await supabase.from('tracks').update({ status: 'active' }).eq('id', trackId);
        }
    }

    console.log('--- Recovery Completed ---');
}

reconnectAssets();
