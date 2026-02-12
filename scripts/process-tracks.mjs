
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const s3Client = new S3Client({
    region: env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

async function processAllTracks() {
    console.log('--- Aura Processing Worker: Started ---');
    
    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('id, title')
        .eq('status', 'active');
    
    if (error) return console.error(error);

    for (const track of tracks) {
        console.log(`\nProcessing [${track.title}]...`);
        
        const { data: files } = await supabase.from('track_files').select('s3_key').eq('track_id', track.id).limit(1);
        if (!files?.length) continue;

        const s3Key = files[0].s3_key;
        const tempPath = path.join(__dirname, `tmp_${track.id}${path.extname(s3Key)}`);

        try {
            // 1. Download
            const response = await s3Client.send(new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET_RAW, Key: s3Key }));
            const writer = fs.createWriteStream(tempPath);
            await new Promise((res, rej) => {
                response.Body.pipe(writer);
                response.Body.on('end', res);
                response.Body.on('error', rej);
            });

            // 2. Analyze with Python
            console.log(` Analyzing audio features...`);
            const analysisRaw = execSync(`python3 "${path.join(__dirname, 'audio_analyzer.py')}" "${tempPath}"`).toString();
            const analysis = JSON.parse(analysisRaw);

            if (analysis.error) throw new Error(analysis.error);

            // 3. Update Supabase
            console.log(` Result: BPM ${analysis.bpm}, Key ${analysis.key}, Energy ${analysis.energy}`);
            await supabase.from('tracks').update({
                bpm: analysis.bpm,
                key: analysis.key,
                metadata: {
                    technical: { bpm: analysis.bpm, key: analysis.key },
                    vibe: { energy_level: analysis.energy }
                }
            }).eq('id', track.id);

            console.log(` Done.`);
        } catch (err) {
            console.error(` Error:`, err.message);
        } finally {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
    }
}

processAllTracks();
