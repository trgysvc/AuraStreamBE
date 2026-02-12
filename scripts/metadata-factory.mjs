
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

const s3Client = new S3Client({
    region: env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

async function extractMetadata() {
    console.log('--- Metadata Extraction Factory ---');
    
    // 1. Get tracks from DB
    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('id, title, status');
    
    if (error) {
        console.error('Error fetching tracks:', error.message);
        return;
    }

    console.log(`Found ${tracks.length} tracks to process.`);

    for (const track of tracks) {
        // 2. Find file for track
        const { data: files } = await supabase
            .from('track_files')
            .select('s3_key')
            .eq('track_id', track.id)
            .limit(1);
        
        if (!files || files.length === 0) {
            console.log(`[${track.title}] No file found in DB.`);
            continue;
        }

        const s3Key = files[0].s3_key;
        const tempFile = path.join(__dirname, `temp_${track.id}${path.extname(s3Key)}`);

        console.log(`[${track.title}] Downloading ${s3Key}...`);
        
        try {
            const getCommand = new GetObjectCommand({
                Bucket: env.AWS_S3_BUCKET_RAW,
                Key: s3Key
            });
            const response = await s3Client.send(getCommand);
            const stream = response.Body;
            const writer = fs.createWriteStream(tempFile);
            
            // Pipe stream manually
            await new Promise((resolve, reject) => {
                stream.pipe(writer);
                stream.on('end', resolve);
                stream.on('error', reject);
            });

            // 3. Extract duration using ffprobe
            console.log(`[${track.title}] Extracting duration...`);
            const durationOutput = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempFile}"`).toString().trim();
            const duration = Math.round(parseFloat(durationOutput));

            // 4. Mock BPM and Key for now (until Python worker is ready)
            const mockBpm = 100 + Math.floor(Math.random() * 40);
            const keys = ['C', 'Cm', 'G', 'Gm', 'D', 'Dm', 'A', 'Am', 'E', 'Em'];
            const mockKey = keys[Math.floor(Math.random() * keys.length)];

            console.log(`[${track.title}] Duration: ${duration}s, BPM: ${mockBpm}, Key: ${mockKey}`);

            // 5. Update Supabase (This will fail if migration wasn't run, but we'll try duration)
            const { error: updateError } = await supabase
                .from('tracks')
                .update({ 
                    duration_sec: duration,
                    bpm: mockBpm,
                    key: mockKey,
                    // metadata: { technical: { bpm: mockBpm, key: mockKey, duration } } // Will fail if column missing
                })
                .eq('id', track.id);
            
            if (updateError) console.error(`[${track.title}] Update error:`, updateError.message);
            else console.log(`[${track.title}] Updated successfully.`);

        } catch (err) {
            console.error(`[${track.title}] Error:`, err.message);
        } finally {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        }
    }
}

extractMetadata();
