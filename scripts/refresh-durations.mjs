
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

async function refreshDurations() {
    console.log('--- Duration Refresher Engine: Started ---');

    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('id, title, duration_sec, metadata');

    if (error) return console.error(error);

    for (const track of tracks) {
        console.log(`Analyzing [${track.title}]...`);

        const { data: files } = await supabase.from('track_files').select('s3_key, file_type').eq('track_id', track.id).eq('file_type', 'raw').limit(1);
        if (!files?.length) {
            console.log(' [Skip] No raw file found.');
            continue;
        }

        const s3Key = files[0].s3_key;
        const tempPath = path.join(__dirname, `duration_tmp_${track.id}${path.extname(s3Key)}`);

        try {
            const response = await s3Client.send(new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET_RAW, Key: s3Key }));
            const writer = fs.createWriteStream(tempPath);

            await new Promise((res, rej) => {
                response.Body.pipe(writer);
                response.Body.on('finish', res);
                response.Body.on('error', rej);
            });

            const analysisRaw = execSync(`python3 "${path.join(__dirname, 'audio_analyzer.py')}" "${tempPath}"`).toString();
            const analysis = JSON.parse(analysisRaw);

            if (analysis.duration) {
                console.log(` [Success] Real Duration: ${analysis.duration}s`);
                const { error: updateError } = await supabase.from('tracks').update({
                    duration_sec: Math.round(analysis.duration),
                    bpm: analysis.bpm,
                    key: analysis.key,
                    metadata: {
                        ...(track.metadata || {}),
                        waveform: analysis.waveform
                    }
                }).eq('id', track.id);
                
                if (updateError) console.error('  Update Error:', updateError);
            }
        } catch (err) {
            console.error(` [Error]:`, err.message);
        } finally {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
    }
    console.log('--- Done ---');
}

refreshDurations();
