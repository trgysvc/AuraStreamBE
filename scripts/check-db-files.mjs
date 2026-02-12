
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSync() {
    console.log('--- Database Consistency Check ---');
    try {
        const { data: files, error } = await supabase
            .from('track_files')
            .select('s3_key, track_id, tracks(title, status)');
        
        if (error) throw error;
        
        console.log(`Supabase has ${files?.length || 0} track files linked.`);
        files?.forEach(f => {
            console.log(` - File: ${f.s3_key} | Track: ${f.tracks?.title} [${f.tracks?.status}]`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkSync();
