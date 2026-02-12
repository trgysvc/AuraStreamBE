
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

const s3Client = new S3Client({
    region: env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSync() {
    console.log('--- Checking S3 Connection ---');
    try {
        const command = new ListObjectsV2Command({
            Bucket: env.AWS_S3_BUCKET_RAW,
            MaxKeys: 10
        });
        const s3Data = await s3Client.send(command);
        console.log(`S3 Bucket (${env.AWS_S3_BUCKET_RAW}) contains objects.`);
        s3Data.Contents?.forEach(obj => console.log(` - ${obj.Key}`));
        if (!s3Data.Contents) console.log('Bucket is empty.');
    } catch (err) {
        console.error('Error connecting to S3:', err.message);
    }

    console.log('\n--- Checking Supabase Data ---');
    try {
        const { count, error } = await supabase
            .from('tracks')
            .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        console.log(`Supabase 'tracks' table has ${count} records.`);

        const { data: recentTracks } = await supabase
            .from('tracks')
            .select('id, title, status')
            .limit(5);
        
        console.log('Recent tracks:');
        recentTracks?.forEach(t => console.log(` - [${t.status}] ${t.title} (${t.id})`));

    } catch (err) {
        console.error('Error connecting to Supabase:', err.message);
    }
}

checkSync();
